---
title: ConcurrentHashMap 的实现：分段锁到桶级并发
published: 2026-09-24
description: 对比 JDK 1.7 与 JDK 1.8 的 ConcurrentHashMap，梳理分段锁、CAS、synchronized 和渐进式扩容。
tags: [Java, 并发编程]
category: 后端八股
draft: false
---

ConcurrentHashMap 的实现重点是降低锁竞争：JDK 1.7 通过 Segment 分段，JDK 1.8 去掉 Segment，将并发控制细化到数组桶。

## JDK 1.7：分段锁

底层把数组分成多个 Segment，每个 Segment 内部是一个带 `ReentrantLock` 的 HashMap。不同线程访问不同段时可以并行，同一段才会发生竞争，并发度通常受段数限制。

![JDK 1.7 ConcurrentHashMap](/images/bagu/1.png)

## JDK 1.8：CAS + 桶级 synchronized

JDK 1.8 移除 Segment，整体结构与 HashMap 类似：数组、链表和红黑树共同解决冲突。插入时先用 CAS 尝试无锁写入；发生冲突后，只对当前桶的头节点使用 `synchronized`，其他桶仍可并发操作。

![JDK 1.8 ConcurrentHashMap](/images/bagu/2.png)

![两代实现对比](/images/bagu/3.png)

## 常见追问

渐进式扩容会保留新旧两个数组，读操作要么读到旧数组，要么读到新数组，结果仍然正确。JDK 1.7 计算 size 时会先尝试多次无锁统计，只有结果不一致时才加锁，以减少大范围加锁的成本。

ConcurrentHashMap 的 key 和 value 都不能为 null。因为 `get` 返回 null 时，无法区分 key 不存在还是 value 本来就是 null。
