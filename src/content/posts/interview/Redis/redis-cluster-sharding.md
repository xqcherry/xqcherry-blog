---
title: Redis Cluster：哈希槽、Gossip 与故障转移
published: 2026-09-24
description: 从数据分片、节点通信和客户端重定向三个角度，梳理 Redis Cluster 的去中心化实现。
tags: [Redis, 分布式系统]
category: 后端八股
draft: false
---

Redis Cluster 主要解决单机内存和并发能力的上限。它通过多个 Redis 实例共同保存数据，核心可以概括为：**哈希槽分片、Gossip 通信、去中心化管理**。

## 数据如何分片

集群预先划分出 `16384` 个哈希槽，每个主节点负责其中一部分。写入 Key 时，Redis 根据 CRC16 计算槽位，再路由到负责该槽位的 Master：

```text
Key → CRC16 → % 16384 → Hash Slot → 对应 Master
```

扩缩容时只需迁移部分槽位，不必重新计算所有 Key 的位置。

## 节点如何互相了解

Redis Cluster 没有中心节点。节点通过 Gossip 协议交换节点存活状态、槽位归属和集群拓扑，让每个节点逐步掌握集群状态。

## 客户端如何找到数据

客户端可以连接任意节点：如果 Key 属于当前节点负责的槽位，节点直接处理；否则返回 `MOVED`，告诉客户端应该访问哪个节点。

```text
客户端 → 节点 A
          ↓ MOVED
客户端 → 节点 B → 返回数据
```

:::note[复习重点]
回答 Redis Cluster 时，按“槽位怎么分、节点怎么通信、请求怎么重定向”三个问题展开即可。实际生产还需继续关注副本、故障转移和数据迁移期间的可用性。
:::
