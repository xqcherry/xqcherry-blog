---
title: WireGuard 组网实践：用 VPS 建立私有服务器网络
published: 2026-06-28
description: 以一台公网 VPS 为中心，配置 WireGuard 服务端与多个节点，建立仅供内部服务访问的加密私有网段。
tags: [WireGuard, VPN, 网络安全, Linux, 运维]
category: 运维
draft: false
---

WireGuard 适合将多台分散的服务器连接到一个私有网段。以下示例以公网 VPS 为中心节点，两个内网节点通过加密隧道互通；示例地址请按自己的网络规划替换。

```text
Internet
   │
VPS / WireGuard Server · 10.20.0.1
   ├── Node A · 10.20.0.2
   └── Node B · 10.20.0.3
```

:::warning[密钥安全]
每个节点必须生成独立密钥对。私钥仅保存在节点本机，不能提交仓库、发送给他人或出现在截图中；配置示例中的占位符不是实际密钥。
:::

## 1. 安装并生成节点密钥

在每个节点执行：

```bash
sudo apt update
sudo apt install -y wireguard
umask 077
wg genkey | tee privatekey | wg pubkey > publickey
```

记录每个节点的**公钥**，并安全保存其私钥。VPS 需要开放 UDP `51820`（或自定义端口）。

## 2. 配置中心 VPS

编辑 `/etc/wireguard/wg0.conf`：

```ini
[Interface]
Address = 10.20.0.1/24
ListenPort = 51820
PrivateKey = <VPS_PRIVATE_KEY>

[Peer]
PublicKey = <NODE_A_PUBLIC_KEY>
AllowedIPs = 10.20.0.2/32

[Peer]
PublicKey = <NODE_B_PUBLIC_KEY>
AllowedIPs = 10.20.0.3/32
```

`AllowedIPs` 同时用于路由和对端身份约束；服务端应为每个 peer 精确指定单个地址或必要的私有子网，避免使用过宽的范围。

## 3. 配置客户端节点

以 Node B 为例：

```ini
[Interface]
Address = 10.20.0.3/24
PrivateKey = <NODE_B_PRIVATE_KEY>

[Peer]
PublicKey = <VPS_PUBLIC_KEY>
Endpoint = <VPS_PUBLIC_HOST>:51820
AllowedIPs = 10.20.0.0/24
PersistentKeepalive = 25
```

`PersistentKeepalive = 25` 对位于 NAT 后的节点很有帮助，它会周期性维持映射。Node A 按相同方式配置自己的地址和密钥。

## 4. 启动与验证

```bash
sudo systemctl enable --now wg-quick@wg0
sudo wg show
ping 10.20.0.1
```

当 `wg show` 出现最近握手时间、收发字节数增长时，说明隧道已建立。随后可从节点间 ping 私网地址，或用 `ip route` 检查预期路由。

## 常见故障排查

1. 没有握手：检查 UDP 端口、防火墙、Endpoint 地址和双方公钥是否对应。
2. 能握手但无法访问：检查 `AllowedIPs`、本机路由及防火墙规则。
3. 需要让一个节点转发到其他子网：在转发节点启用 IP forwarding，并明确增加路由与最小化的防火墙/NAT 规则。

仅需服务器之间私网互访时，不要把 `AllowedIPs` 配为 `0.0.0.0/0`；这会把全部流量都导向 VPN，增加意外断网和暴露风险。
