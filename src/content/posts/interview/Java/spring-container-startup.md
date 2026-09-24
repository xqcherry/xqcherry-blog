---
title: Spring 容器启动过程：从 BeanDefinition 到 AOP 代理
published: 2026-09-24
description: 按容器刷新、Bean 定义注册、实例化、依赖注入和后置处理器的顺序，梳理 Spring 启动生命周期。
tags: [Java, Spring, IoC, Bean 生命周期, AOP]
category: 后端基础
draft: false
---

Spring 启动可以概括为：

```text
创建容器 → 注册 BeanDefinition → BeanFactory 后置处理器
→ Bean 后置处理器 → 实例化 → 依赖注入 → 初始化
→ AOP 代理 → 容器启动完成
```

## 主要阶段

1. **创建并刷新 ApplicationContext**：创建 IoC 容器，加载配置和环境信息。
2. **解析并注册 BeanDefinition**：通过组件扫描和配置类发现 Bean，将定义信息注册到 BeanFactory。
3. **执行 BeanFactory 后置处理器**：在实例化前修改或处理 BeanDefinition。
4. **注册 Bean 后置处理器**：为 Bean 创建和初始化过程提供扩展能力。
5. **实例化 Bean**：创建非懒加载的单例 Bean。
6. **依赖注入**：解析依赖关系，完成 `@Autowired` 等注入。
7. **初始化 Bean**：执行 Aware 回调、`@PostConstruct`、`InitializingBean` 和相关后置处理逻辑。
8. **创建 AOP 代理**：为需要增强的 Bean 创建代理，例如 `@Transactional` 或切面。
9. **容器启动完成**：发布刷新完成事件，ApplicationContext 进入可用状态。

## BeanFactory 与 ApplicationContext

BeanFactory 是 IoC 容器的基础接口，负责 Bean 的创建、获取、依赖注入和生命周期管理。ApplicationContext 在此基础上增加了事件发布、国际化、资源加载和环境配置等能力，因此实际项目中更常直接使用 ApplicationContext。
