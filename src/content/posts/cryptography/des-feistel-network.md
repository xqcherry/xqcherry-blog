---
title: DES 与 Feistel 网络：理解经典分组密码的轮函数设计
published: 2026-09-18
description: 以 DES 为例梳理 Feistel 网络、16 轮处理和密钥长度限制，并说明它为何只适合作为学习材料。
tags: [密码学, DES, Feistel, 分组密码]
category: 密码学
draft: false
---

DES（Data Encryption Standard）是研究分组密码结构的重要案例，但其 56 位有效密钥已无法抵抗现代穷举攻击，因此不应再用于新系统。

![DES 整体流程](/images/cryptography/des-overview.png)

## 参数速览

| 参数 | 值 |
| --- | --- |
| 分组长度 | 64 bit |
| 标称密钥长度 | 64 bit |
| 有效密钥长度 | 56 bit（其余为校验位） |
| 网络结构 | Feistel 网络 |
| 轮数 | 16 |
| 每轮子密钥 | 48 bit |

## DES 的处理过程

```text
64 bit 明文
  → 初始置换 IP
  → 分为 L₀、R₀（各 32 bit）
  → 16 轮 Feistel 变换
  → 合并并执行逆初始置换 IP⁻¹
  → 64 bit 密文
```

第 $i$ 轮可抽象为：

$$L_i=R_{i-1}, \qquad R_i=L_{i-1}\oplus F(R_{i-1}, K_i)$$

轮函数 $F$ 将右半部分与子密钥混合，经扩展、S 盒非线性代换和置换后输出 32 位结果。多轮迭代使局部差异逐步扩散到整个分组。

## 为什么 Feistel 结构重要

即使轮函数 $F$ 本身不可逆，整个 Feistel 网络仍可逆：解密时按相反顺序使用子密钥即可。这使结构设计更灵活，也影响了后续许多密码算法。

:::caution[安全现状]
DES 已废弃；3DES 也正逐步退出。新系统应选择 AES-GCM 或 ChaCha20-Poly1305 等现代认证加密方案。
:::
