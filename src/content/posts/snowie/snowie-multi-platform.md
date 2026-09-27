---
title: "Snowie 多平台接入：让不同渠道复用同一套业务链路"
published: 2026-09-27
draft: true
description: "结合 InboundChannelEvent、ReplyPort 和 ExternalChatReplyCoordinator，拆解多个聊天平台如何共享账号、记忆和计费。"
tags: [AI Agent, Spring Boot]
series: Snowie 实习项目
seriesOrder: 2
---

多平台接入最容易出现的问题，是每接入一个渠道就复制一套消息处理逻辑。短期看起来开发很快，长期会导致记忆、计费、异常处理和回复格式逐渐不一致。

## 适配边界

平台实现负责解析协议、完成鉴权、把统一回复转换为平台消息；业务编排器只应该看到统一事件和统一输出。

```text
Telegram / WhatsApp / WeChat
          ↓ 平台 parser / service
      InboundChannelEvent
          ↓
   ExternalChatReplyCoordinator
          ↓
      ChatReplyOrchestrator
          ↓
        ReplyPort
```

`InboundChannelEvent` 解决“用户说了什么”，`ReplyPort` 解决“如何送回去”。中间业务层不依赖平台 update JSON。

:::important[统一不等于抹平]
SSE 可以发送增量文本，WhatsApp 可能需要完整消息，WeChat 可能还需要上传图片。统一层抽象共同语义，平台特有能力留在适配器边界内。
:::

## 入站事件不只是文本

统一事件还需要包含渠道、外部用户标识、会话标识、消息 id、文本、媒体描述和回复上下文。外部媒体经过 `InboundMediaDownloader` 和 `InboundMediaDownloadService` 转换成系统可消费的对象，不直接把平台短期 URL 存入业务历史。

## 账号、关系和渠道身份

外部平台用户先通过绑定关系映射到系统内部用户和 relationship profile，再进入统一会话。这样用户换渠道后仍然可以继续使用同一份记忆、关系天气和计费状态。

## “只回最新”的协调器

`ExternalChatReplyCoordinator` 负责外部消息的幂等、路由级协调和过期判断：

```text
外部消息到达
   ↓
记录 inbound event / 解析会话
   ↓
同一路由已有任务？
   ├─ 否：启动回复
   └─ 是：标记旧请求过期或合并最新输入
   ↓
发送结果并记录 delivery 状态
```

旧任务即使被标记过期，也需要在输出前再次检查，不能只在队列入口检查一次。

## 生成成功不等于投递成功

外部渠道需要区分“业务回复已生成”和“平台消息已确认投递”。`ExternalDeliveryTask`、状态枚举和 worker 让系统可以重试投递，而不必重新调用模型。

多平台架构的价值不在于所有平台长得一样，而在于把差异限制在边界上：新增渠道时增加适配代码，记忆、检索、计费和安全规则仍然复用。
