---
title: "Snowie 回复编排：协调 AI 生成、检测、扣费与落库"
published: 2026-09-27
draft: true
description: "基于 ChatReplyOrchestrator 的真实调用顺序，拆解串行主干、并行旁路、流式输出和计费补偿。"
tags: [AI Agent, SSE]
series: Snowie 实习项目
seriesOrder: 3
---

一次 AI 回复包含校验会话、判断特殊意图、风险检测、上下文构建、模型生成、SSE 推送、消息保存和积分扣除。`ChatReplyOrchestrator.reply()` 的价值，是把这些动作排成一条具有明确边界的流水线。

## 先验证请求属于谁

`requireReplyContext()` 会校验用户、会话、消息和 relationship profile 的归属，并确认消息角色为 `USER`。权限和数据归属问题必须挡在模型调用之前。

## 意图检测是可短路的前置步骤

`detectIntent()` 失败时返回 `NONE`，并把错误降级为继续主流程。命中特殊意图时，编排器可以直接保存 CTA 消息并发送完成事件，不必消耗一次普通生成请求。

```java title="特殊意图短路（简化伪代码）"
IntentDecision decision = detectIntent(command, session, latestUser);
if (decision.hit()) {
    ChatMessageEntity cta = persistenceService.saveAssessmentCtaMessage(session);
    command.output().onAssessmentCta(/* build event */);
    command.output().onCompleted();
    return /* short-circuited outcome */;
}
```

## 两个旁路检测并行启动

PUA 检测和 redflag 检测通过 `detectAsync()` 并行启动，主线程继续进行余额预检和上下文构建，最后在各自 timeout 边界内等待结果。

```text
                    ┌─ PUA detectAsync ─────┐
校验 → 意图判断 ────┤                        ├─ 等待结果 → 告警收尾
                    └─ Redflag detectAsync ─┘
                              ↘
                 主流程：余额 → 上下文 → 生成 → 落库 → 扣费
```

:::important[并行不等于完全不等待]
检测任务可以并行执行，但收尾仍需要有明确等待边界。超时或异常会降级为无告警结果，不应该阻断主聊天。
:::

## 流式输出为什么要保留尾部

模型 provider 的 delta 不保证按业务分隔符切开。系统使用 `<<<BUBBLE>>>` 标记气泡边界，`DefaultAiExecutionAdapter` 暂存最后 64 个字符，只把确定安全的前缀交给输出 sink。

`AssistantSegmentStreamForwarder` 还会保留分隔符的半截前缀，直到下一个 chunk 到来：

```text
chunk: "第一段<<<BUB"
               ↓ 保留尾部
chunk: "BLE>>>第二段"
               ↓ 拼成完整分隔符
输出第一段 / 开始第二段
```

流结束后，最终完整响应会和已经推送的可见文本做 common prefix 对账，补发尚未发送的尾部。

## 先落库、后扣费的补偿边界

模型完成后，系统先保存分段后的 assistant 消息，再调用 `CreditService.charge()`。如果扣费返回余额不足，`deleteMessages()` 删除本轮刚写入的 assistant 消息。

:::warning[不要把这个流程描述成原子事务]
模型调用、SSE 推送、消息保存和积分扣除跨越多个边界。更准确的说法是：系统用预检、补偿删除和审计日志实现最终收敛。
:::

助手消息和扣费成功后，编排器再等待 PUA 与 redflag 结果，命中时保存专门类型的提示消息并发送对应事件。这些告警消息不会再次作为普通历史进入模型上下文。
