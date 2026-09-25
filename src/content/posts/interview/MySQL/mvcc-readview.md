---
title: MySQL MVCC：Undo Log、版本链与 ReadView
published: 2026-09-24
description: 从隐藏字段、Undo Log 和版本链出发，理解 InnoDB 快照读如何通过 ReadView 判断可见版本。
tags: [MySQL, 事务]
category: 后端八股
draft: false
---

MVCC（多版本并发控制）的核心是让普通读尽量不阻塞写。更新时不直接覆盖旧版本，而是把旧值保存在 Undo Log，新版本写入数据页，并通过版本链关联历史记录。

## 版本链的组成

InnoDB 记录包含 `trx_id` 和 `roll_pointer` 等隐藏信息：前者表示最后修改事务，后者指向 Undo Log 中的旧版本。普通 SELECT 进行快照读，沿版本链寻找对当前事务可见的版本。

## ReadView 如何判断可见性

ReadView 记录当前事务 ID、活跃事务列表 `m_ids`、最小活跃 ID `min_trx_id` 和下一个事务 ID `max_trx_id`。从最新版本向前查找时：当前事务自己的版本可见；小于 `min_trx_id` 的版本已提交可见；大于等于 `max_trx_id` 的版本来自之后事务不可见；处于中间范围时，再判断是否在活跃列表中。

## 读已提交与可重复读

两者的可见性判断逻辑相同，区别是 ReadView 的生成时机：读已提交每次 SELECT 都生成新 ReadView，可看到其他事务的新提交；可重复读通常在第一次快照读时生成并复用，因此同一事务内结果更稳定。

![MVCC 版本链示意](/images/bagu/9.png)

## 快照读、当前读与幻读

普通 SELECT 是快照读；`FOR UPDATE`、`LOCK IN SHARE MODE`、`UPDATE` 和 `DELETE` 是当前读，需要最新版本并加锁。可重复读不能在快照读和当前读混用时完全避免幻读；要保护范围，需要从一开始使用当前读并依靠 Next-Key Lock。
