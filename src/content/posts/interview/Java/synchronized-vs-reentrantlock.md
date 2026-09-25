---
title: synchronized 与 ReentrantLock：功能、性能与使用边界
published: 2026-09-24
description: 对比 Java 内置监视器锁和 AQS 可重入锁，理解公平性、中断、超时与资源释放的取舍。
tags: [Java, 并发编程]
category: 后端八股
draft: false
---

## 两种锁分别是什么

`synchronized` 是 Java 关键字，通过 JVM Monitor 实现同步，可修饰方法和代码块，锁的获取与释放由 JVM 管理。`ReentrantLock` 是 JUC 提供的可重入锁，基于 AQS 实现，需要显式调用 `lock()` 与 `unlock()`。

## 核心差异

| 维度 | synchronized | ReentrantLock |
| --- | --- | --- |
| 形态 | 关键字 | 类 |
| 释放方式 | JVM 自动释放 | 必须手动释放 |
| 公平性 | 非公平 | 默认非公平，也可配置公平 |
| 扩展能力 | 基础同步 | 支持中断、超时获取等能力 |
| 底层机制 | JVM Monitor | AQS |

JDK 6 之后，`synchronized` 经历了多项锁优化；两者没有简单的“谁一定更快”。只有确实需要公平锁、可中断获取或超时等能力时，再选择 `ReentrantLock`。

## 常见追问

### 公平锁为什么不是默认选择？

公平锁按等待顺序获取锁；非公平锁允许新线程先 CAS 尝试抢锁，失败才排队。非公平锁减少了唤醒队首线程和上下文切换的开销，因此通常吞吐量更高。

### 忘记 unlock 会怎样？

锁不会释放，其他线程会持续阻塞。`ReentrantLock` 应放在 `try-finally` 中释放：

```java
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```

### 什么是可重入？

同一线程已持有一把锁时，可以再次获取它而不发生死锁。锁内部记录持有线程和重入次数；每次获取递增、每次释放递减，计数归零后才真正释放。
