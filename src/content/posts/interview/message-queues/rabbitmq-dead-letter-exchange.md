---
title: RabbitMQ 消息何时进入死信交换机
published: 2026-09-24
description: 梳理 RabbitMQ 死信的三个触发条件，并比较 TTL+DLX 延迟队列与官方延迟消息插件。
tags: [消息队列, RabbitMQ]
category: 后端基础
draft: false
---

## 三种进入死信交换机的情况

1. 消费者调用 `basic.reject` 或 `basic.nack`，并将 `requeue` 设为 `false`。
2. 消息或队列设置了 TTL，消息到期仍未被消费。
3. 队列达到最大长度，新消息进入时队头旧消息被挤出。

## 死信队列实现延迟有什么限制

TTL + DLX 的做法是让消息先进入没有消费者的普通队列，过期后转发到死信队列。它的主要问题是队头阻塞：前面的消息 TTL 较长时，后面 TTL 较短的消息也可能要等待。

延迟插件使用 `x-delayed-message` 交换器，将消息按延迟时间保存，时间到达后再路由到目标队列，顺序问题更少，但需要额外安装并考虑重启时的加载延迟。

## 死信消费者故障与重试

死信队列本质上也是普通队列，配置持久化后重启不会凭空丢失，但会持续积压并消耗磁盘，因此需要监控告警。

RabbitMQ 原生不直接提供按次数自动重试。可以在消息 header 中维护重试计数，达到上限后再 reject 进入死信；Spring AMQP 的 RetryTemplate 可以封装这一流程。
