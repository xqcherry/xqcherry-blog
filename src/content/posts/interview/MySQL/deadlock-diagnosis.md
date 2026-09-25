---
title: MySQL 发生死锁怎么办：检测、定位与处理
published: 2026-09-24
description: 说明 InnoDB 自动死锁检测如何回滚事务，以及如何通过状态信息定位阻塞线程并进行人工干预。
tags: [MySQL, 锁, 事务]
category: 后端八股
draft: false
---

MySQL 死锁处理分为自动处理和人工干预两部分。InnoDB 默认开启死锁检测，会选择代价较小的事务回滚，释放锁让其他事务继续执行。

## 自动处理

`innodb_deadlock_detect` 控制死锁检测。检测到环路后，InnoDB 选择一个事务回滚；应用端仍应捕获死锁异常并按业务安全地重试。

## 人工定位

自动处理不够及时或需要快速恢复时，可以查看：

```sql
SHOW ENGINE INNODB STATUS;
```

也可以查询锁相关的系统表，找出阻塞线程，再谨慎执行 `KILL <thread_id>`。处理前应确认线程对应的事务、业务影响和是否存在更安全的回滚方式。
