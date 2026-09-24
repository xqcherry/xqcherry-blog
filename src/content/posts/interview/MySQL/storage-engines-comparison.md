---
title: MySQL 存储引擎怎么选：InnoDB、MyISAM 与 MEMORY
published: 2026-09-24
description: 从 MySQL Server 层、存储引擎能力、锁粒度和数据持久化出发，比较常见存储引擎的使用边界。
tags: [MySQL, InnoDB, MyISAM, MEMORY, 存储引擎]
category: 后端基础
draft: false
---

MySQL 可以分为 Server 层和存储引擎层：Server 层负责连接、SQL 分析和执行，存储引擎负责数据的存储和提取。常见引擎包括 InnoDB、MyISAM 和 MEMORY，实际业务通常以 InnoDB 为主。

| 引擎 | 事务/MVCC | 锁与特点 | 适用方向 |
| --- | --- | --- | --- |
| InnoDB | 支持 | 行锁、事务、MVCC | 高并发业务 |
| MyISAM | 不支持 | 表锁，读取简单 | 读多写少的旧场景 |
| MEMORY | 数据在内存 | 重启丢失 | 临时计算 |

## InnoDB 行锁到底锁什么

InnoDB 锁的是索引记录，而不是抽象的物理行。走主键索引时锁主键记录；走二级索引时会锁二级索引记录并关联主键记录；没有合适索引时可能扫描并锁住大量记录，因此建索引也会影响锁粒度。

## MEMORY 与 Redis 的差异

MEMORY 是 MySQL 进程内的表结构，只能用 SQL 访问且重启即丢；Redis 是独立的 KV 服务，支持 String、Hash、List、Set、ZSet 等数据结构，并可通过 RDB/AOF 持久化。

## 查看表使用的引擎

```sql
SHOW TABLE STATUS LIKE 'table_name';
SHOW CREATE TABLE table_name;
```
