---
title: "Snowie 语音 Agent：从语音输入到流式语音回复"
published: 2026-09-27
draft: true
description: "结合 ChatCallWebSocketHandler、CallTurnOrchestrator 和 TTS 流程，拆解一个实时语音回合如何建立、提交、生成和打断。"
tags: [AI Agent, WebSocket]
series: Snowie 实习项目
seriesOrder: 1
---

实时语音的难点不在于调用一次 STT 和一次 TTS，而在于一轮对话始终处于变化中：音频还在上传，识别结果不断修正，模型可能已经开始生成，用户又突然打断。Snowie 的语音实现把这些状态集中在 `CallSession`，由 WebSocket handler 驱动输入，由 turn orchestrator 驱动回复。

## 一次语音回合的整体链路

```text
建立会话 → 接收音频 → 流式识别 → 判断结束
    → 提交文本 → 复用回复编排 → 流式分句
    → 逐句 TTS → 推送音频 → 支持打断
```

## STT 启动为什么需要 generation

每次 `startSpeech()` 都会递增 `speechStartGeneration`。provider 的 open、transcript、error 和 close 回调要先确认自己仍然属于当前 generation，才允许修改会话状态。

```text
旧 STT 启动 ────── provider 回调到达
       ↘ 用户打断/重启
新 STT 启动 ────── 当前 generation 改变

旧回调发现 generation 过期 → 丢弃
```

这解决的是旧连接晚到回调覆盖新状态的问题。仅仅 cancel 旧 stream，并不能阻止已经排队的回调继续执行。

:::important[generation 和 turn sequence 不是一回事]
generation 标识一次 STT 流的生命周期；turn sequence 标识一次已经提交给回复编排器的对话回合。前者保护识别连接，后者保护生成和播放结果。
:::

## “用户说完了”有三条路径

| 信号 | 入口 | 作用 |
| --- | --- | --- |
| STT final/definite | `handleTranscript` | provider 明确给出最终转写 |
| 客户端提交 | `commit` / `stop` | 前端主动结束输入 |
| 静音兜底 | `maybeEndpoint` | 连续 700ms 没有新音频时停止识别 |

这些路径最终都会尝试进入 `commitTranscript()`。提交前会检查状态，并通过 `beginTurnCommit()` 保证同一轮只成功一次。

```java title="commitTranscript 的关键边界（简化伪代码）" collapse={1-4}
if (clean.isBlank() || state != LISTENING) return;
if (!beginTurnCommit()) return;

// 取消 endpointing task 和当前 speech stream
int turnSeq = nextTurnSeq();
activateTurn(turnSeq);
state = THINKING;
```

## 语音回复复用文字回复

`CallTurnOrchestrator` 不重新实现一套 AI 对话逻辑，而是创建面向 WebSocket 的回复输出。文字回复产生的 assistant segment 会被转换为 TTS 任务，并继续复用统一的上下文、记忆、RAG、风险检测和计费逻辑。

```text
语音 final transcript
        ↓
CallTurnOrchestrator
        ↓
ChatReplyOrchestrator.reply(...)
        ↓
assistant segment
        ├── WebSocket 文本事件
        └── CallTtsStreamer 音频队列
```

## TTS 分句与播放队列

模型输出可能是连续 token，TTS 更适合一段一段地合成。`CallTtsSegmenter` 维护待处理文本，优先寻找句末边界；`CallTtsStreamer` 负责消费队列、启动 TTS 会话并推送音频 chunk。

:::tip[为什么不等整段文本生成完再 TTS]
整段等待会把模型首 token 和完整回复生成时间叠加到首音频延迟中。首段尽早合成，后续生成隐藏在播放过程中，用户会更快听到反馈。
:::

## 打断是取消加有效性检查

客户端发送 `interrupt` 时，handler 会取消 endpointing、STT stream、turn future 和 TTS future，并使当前回合失效。取消只能尽量停止工作，不能保证所有异步回调都不会到达，因此回调和输出边界还要再次检查 generation 或 turn 是否仍然有效。

语音系统不能保证第三方 provider 永远及时返回，但可以保证重复结束信号不会生成两次回复，旧回调不会覆盖新状态，被打断的回合不会继续播放旧音频。
