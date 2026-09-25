---
title: Java 集合框架：List、Set、Queue 与 Map 如何选择
published: 2026-09-24
description: 梳理 Java 集合框架的主要接口和实现，并结合查询、插入、排序与并发场景说明选型边界。
tags: [Java, 并发编程]
category: 后端八股
draft: false
---

Java 集合主要分为 `Collection` 和 `Map` 两大体系。前者表示一组元素，后者表示 key-value 映射。

![Java Collection 层次结构](/images/bagu/4.png)

## Collection

| 接口 | 常见实现 | 特点 |
| --- | --- | --- |
| List | ArrayList、LinkedList、Vector | 有序、可重复 |
| Set | HashSet、LinkedHashSet、TreeSet | 通常不允许重复 |
| Queue | PriorityQueue、LinkedList | 按队列规则处理元素 |

ArrayList 基于数组，随机访问快；LinkedList 基于双向链表，节点增删方便但访问需要遍历；Vector 是较早的线程安全 List，如今很少作为首选。HashSet 基于哈希表，LinkedHashSet 保留插入顺序，TreeSet 基于红黑树按大小排序。

![Java Map 层次结构](/images/bagu/5.png)

## Map

1. **HashMap**：最常用的哈希映射。
2. **LinkedHashMap**：维护插入顺序。
3. **TreeMap**：基于红黑树，按 key 排序。
4. **Hashtable**：早期线程安全 Map，通常由 ConcurrentHashMap 替代。
5. **ConcurrentHashMap**：面向高并发访问，锁粒度比 Hashtable 更细。

## 常见选型问题

### ArrayList 和 LinkedList 怎么选？

大多数场景优先 ArrayList。它的数组移动使用了优化后的底层拷贝，且具有更好的 CPU 缓存局部性；LinkedList 更适合确实需要链表语义的场景，也可以作为队列使用。

### ConcurrentHashMap 和 Hashtable 有什么区别？

Hashtable 倾向于整表加锁；ConcurrentHashMap 在 JDK 1.7 使用分段锁，JDK 1.8 将锁粒度细化到数组桶，并结合 CAS 与 `synchronized`，因此并发能力更强。

### HashMap 什么时候会树化？

JDK 8 中，桶内链表长度达到 8 且数组长度至少为 64 时可能转为红黑树；节点减少到 6 以下时会退化为链表。
