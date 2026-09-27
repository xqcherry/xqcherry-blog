---
title: "Snowie 记忆与 RAG：可控、可降级的上下文增强"
published: 2026-09-27
draft: true
description: "结合 ChatContextBuilder、MemoryExtractionService 和 RagRetrievalService，梳理记忆读写、三层去重与混合检索。"
tags: [RAG, AI Agent]
series: Snowie 实习项目
seriesOrder: 5
---

记忆和 RAG 的作用，是让模型获得当前消息之外的上下文；工程难点则是控制注入量、保证异步写入不重复、处理结构化输出失败，并在检索服务不可用时不拖垮主聊天。

## ChatContextBuilder 是上下文总装车间

回复编排器调用 `ChatContextBuilder.build()`，统一组装 persona、语言和天气等 profile context、记忆、固定 SYSTEM 消息、附件、历史消息和 RAG 结果。

```text
基础 persona
    ↓
关系上下文与记忆
    ↓
最近会话历史
    ↓
围绕最新用户消息的 RAG 结果
    ↓
AiMessage 列表
```

顺序不是排版问题。记忆的位置、RAG 的查询对象和历史消息的范围都会影响最终模型行为。

:::important[上下文增强也有预算]
记忆不是把全部历史拼进 prompt。系统需要限制数量和长度，把记忆作为软上下文，而不是让旧信息覆盖用户此刻明确表达的内容。
:::

## 静默门控与游标

`MemoryExtractionService.extractPendingUsersMessagesIfSilent()` 会检查 memory 开关、最近消息是否已经静默足够长，以及 cursor 之后是否存在待处理用户消息。满足条件后才调用 memory AI，并在完成后推进 `memoryLastProcessedUserMessageAt`。

```text
持续聊天 → 暂不抽取
    ↓ 静默窗口结束
读取 cursor 之后的消息
    ↓
抽取并校验 JSON
    ↓
写入 memo point / occurrence
    ↓
推进 cursor
```

这减少了连续输入期间的重复抽取，但也意味着记忆写入不是即时一致的。

## 三层去重

| 层次 | 避免的重复 | 主要手段 |
| --- | --- | --- |
| 语义层 | 新旧记忆描述同一事实 | 带入已有 memo points |
| 内容层 | title/detail 重复建点 | `contentHash` upsert |
| 事件层 | 同一消息重复计数 | occurrence 检查 messageId |

`occurrenceAlreadyRecorded()` 保护发生记录和 `occurrence_count` 的一致性。只更新计数、不保存明细，会让之后的统计失去依据。

## 双向量混合检索

RAG 同时走稀疏和稠密两条路径：

```text
用户问题
  ├── RagLexicalVectorizer：hashing trick 稀疏特征
  └── RagEmbeddingClient：稠密 embedding
             ↓
       RagMilvusClient.hybridSearch
             ↓
       weighted rerank
             ↓
       RagPromptBuilder
```

稀疏检索对实体和精确词更敏感，稠密检索对语义相近的表达更友好。混合排序保留两者的优势，再把命中文档整理成模型上下文。

## 失败时只少一些增强

记忆服务、embedding 或 Milvus 失败时，检索入口统一返回空结果并记录降级。模型继续使用 persona、当前消息和普通历史生成回复，而不是因为向量服务异常返回 500。

:::caution[AI 系统的契约也藏在 Prompt 里]
记忆抽取曾出现过模型输出结构和解析器预期不一致的问题：调用本身成功，抽取结果却长期为空。提示词、模型输出和解析代码之间同样需要结构约束、样例和测试。
:::
