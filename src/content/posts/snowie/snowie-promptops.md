---
title: "Snowie PromptOps：让提示词具备版本、发布与回滚能力"
published: 2026-09-27
draft: true
description: "结合 PromptRuntimeService、PromptTemplateBootstrap 和 AdminPromptService，复盘提示词配置化后的版本与缓存设计。"
tags: [PromptOps, AI Agent]
series: Snowie 实习项目
seriesOrder: 4
---

提示词是变化最快的业务资产。把它们硬编码在程序中，会让每次调词都变成一次发版；把文本搬进数据库之后，又必须处理版本审计、发布、回滚、缓存和故障兜底。

## 两张表对应两个问题

模板表保存 prompt key 和当前版本指针，版本表保存内容、版本号、状态和变更信息。模板解决“现在使用哪个”，版本表保留“过去发生过什么”。

```text
prompt_templates
  key + current_version_id
             ↓
prompt_template_versions
  versionNo + content + state
```

## 保存、发布和回滚

```text
saveDraft
  → versionNo = max + 1
  → 插入 DRAFT

publish
  → 旧 PUBLISHED → ARCHIVED
  → 目标版本 → PUBLISHED
  → 更新 currentVersionId
  → 清理缓存

rollback
  → 复制旧内容为新版本
  → 再走正常发布流程
```

:::important[回滚是一次新的发布]
直接回拨指针会丢失回滚痕迹。复制式回滚保持版本号递增，让回滚理由和操作本身进入审计历史。
:::

## 运行时读取的三层兜底

`PromptRuntimeService` 先读带 TTL 的 `ConcurrentHashMap`，未命中时读取数据库当前版本；指针为空或失效时寻找最新的 `PUBLISHED` 版本，数据库异常时回退到 `PromptDefaults`。

```text
缓存 → 数据库 currentVersionId
     → 最新 PUBLISHED
     → 代码默认提示词
```

代码默认值是主聊天的安全网。它也被 bootstrap 使用，但启动初始化必须在发现已有可解析运营版本后停止，不能每次启动覆盖运营调整。

## 缓存失效的竞态

如果缓存失效发生在事务提交前，另一个线程可能重新读到旧数据并放回缓存。当前设计依靠 TTL 自愈；更严格的方案可以使用 after-commit evict、延迟双删或版本号校验。

:::tip[简单方案也需要知道边界]
当前 prompt key 数量有限，TTL 加主动失效足够直接。规模增大后再引入 per-key 加载锁、命中率统计和热 key 保护，比一开始堆复杂缓存组件更容易控制。
:::

## `{{MEMORY}}` 是一个策略插槽

模板含有 `{{MEMORY}}` 时，记忆被渲染进 persona；模板没有这个插槽时，记忆作为独立 SYSTEM 消息注入。记忆的位置由模板作者决定，但不会因为漏写插槽就完全丢失。

参数值中的二次占位符、未消费占位符和模型输出格式，都是运行时契约的一部分。PromptOps 的核心不是把 prompt 存进数据库，而是让它可以被审计、发布、回滚和兜底。
