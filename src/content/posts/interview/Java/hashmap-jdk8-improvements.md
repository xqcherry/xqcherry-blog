---
title: JDK 1.8 对 HashMap 的三项重要改进
published: 2026-09-24
description: 除了红黑树，JDK 1.8 还简化了哈希计算、优化了扩容迁移，并将链表插入从头插法改为尾插法。
tags: [Java, HashMap, JDK 8, 扩容]
category: 后端基础
draft: false
---

JDK 1.8 对 HashMap 的改动不只是在冲突严重时树化，还集中在哈希计算、扩容和链表迁移三个环节。

## 哈希函数更简单

JDK 1.7 的 hash 处理多次异或；JDK 1.8 主要将 key 的 hashCode 高 16 位与低 16 位异或，在保证高低位参与索引计算的同时减少运算开销。

## 扩容不再逐个取模

容量翻倍后，元素要么留在原下标，要么移动到“原下标 + 旧数组长度”。通过一次位运算即可判断迁移方向，避免对每个元素重新计算 `hash % newCapacity`。

## 头插法改为尾插法

JDK 1.7 扩容时采用头插法，链表顺序会反转；并发扩容时可能形成环，导致 CPU 空转。JDK 1.8 改为尾插法，迁移后顺序更稳定，避免了这种成环问题。

![JDK 1.8 HashMap 改动示意](/images/bagu/8.png)
