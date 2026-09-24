---
title: Java 并发基础：CAS、AQS 与锁的实现关系
published: 2026-09-24
description: 从 CAS 的乐观更新，到 AQS 的 state 与等待队列，理解 Java 并发同步器的底层协作方式。
tags: [Java, 并发编程]
category: 后端基础
draft: false
---

## CAS：乐观地尝试更新

CAS（Compare And Swap）是乐观锁思想的一种实现。它包含内存位置 `V`、预期值 `A` 与新值 `B`：只有当 `V` 的当前值仍等于 `A` 时，才将其更新为 `B`；否则说明其他线程已经修改过数据，需要重新读取并重试。

:::note[核心特点]
CAS 不会先把线程阻塞起来，而是先尝试原子更新；失败后再决定重试或进入后续竞争流程。
:::

## AQS：构建同步器的通用框架

AQS（AbstractQueuedSynchronizer）是 Java 并发包构建锁和同步器的基础框架，`ReentrantLock` 等组件都基于它实现。

它围绕两类状态工作：

1. **state**：表示同步状态，例如锁是否被持有、重入次数等。
2. **FIFO 等待队列**：线程获取资源失败后进入双向等待队列；资源释放时，框架从队列中选择合适线程继续竞争。

## CAS 与 AQS 的关系

AQS 用 CAS 保证 `state` 修改的原子性。线程获取资源时，会先 CAS 尝试修改 `state`；失败通常意味着资源已被占用，线程随后进入等待队列。释放资源时，同样通过 CAS 恢复状态，再唤醒后续等待线程。
