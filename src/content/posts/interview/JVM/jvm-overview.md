---
title: JVM 是什么：从类加载到执行引擎的四大组成
published: 2026-10-09
description: JVM 是 Java 程序运行的核心环境，由类加载器子系统、运行时数据区、执行引擎和本地接口四部分组成。
tags: [Java, JVM]
category: 后端八股
draft: false
---

JVM（Java Virtual Machine，Java 虚拟机）是 Java 程序运行的核心环境，负责执行 Java 字节码、管理运行时内存，并通过垃圾回收机制管理对象的生命周期。

## JVM 由哪些部分组成

JVM 的核心组成可以分为四个部分：

1. **类加载器子系统（Class Loader Subsystem）**：负责加载 class 文件，并通过验证、准备、解析和初始化等过程，让类能够被 JVM 使用。
2. **运行时数据区（Runtime Data Areas）**：可以理解为 JVM 运行时的内存区域，用于存放程序执行过程中需要的数据，主要包括堆、Java 虚拟机栈、程序计数器、方法区等。
3. **执行引擎（Execution Engine）**：负责执行 Java 字节码，包括解释执行，以及通过 JIT 即时编译将热点代码编译为机器码执行。
4. **本地接口（JNI，Java Native Interface）**：提供 Java 代码与本地代码交互的机制，例如调用使用 C 或 C++ 编写的本地方法。
