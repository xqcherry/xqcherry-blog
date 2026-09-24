---
title: HashMap 内部结构：数组、链表与红黑树如何协作
published: 2026-09-24
description: 从桶数组、哈希冲突到树化与退化，梳理 Java HashMap 的存储和查找过程，并解释 null key 的处理。
tags: [Java, HashMap, 哈希表, 红黑树]
category: 后端基础
draft: false
---

HashMap 的底层是数组，每个数组位置称为桶；发生哈希冲突时，节点先以链表形式挂在同一桶中，冲突严重时再转为红黑树。

## 从 key 到桶

存入 key 时，HashMap 会计算 hash 并定位数组下标。没有冲突时直接放入；有冲突时在链表或红黑树中继续比较 key。链表查找最坏为 $O(n)$，树化后可降为 $O(\log n)$。

## 什么时候树化

JDK 8 中，桶内链表长度达到 `8` 且数组长度至少为 `64` 时才会树化；数组太小时优先扩容。节点数量降低到 `6` 以下时，树结构会退化回链表，以避免少量节点承担红黑树的额外内存和维护成本。

## null key

HashMap 允许一个 `null key`，其 hash 按 `0` 处理，通常落在数组下标 `0`。ConcurrentHashMap 不允许 null key，因为并发场景下无法区分“key 不存在”和“key 存在但 value 为 null”。
