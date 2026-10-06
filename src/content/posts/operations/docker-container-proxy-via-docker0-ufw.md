---
title: Docker 容器走宿主机代理：127.0.0.1 陷阱与 UFW 放行实战
published: 2026-10-06
description: 容器内 Google OAuth 超时的完整排查复盘：为什么主机的 127.0.0.1 代理在容器里不可用，如何通过 docker0 网桥和 UFW 放行让容器走宿主机代理。
tags: [Docker, Linux, 网络, 运维]
category: 运维
draft: false
---

一次 Antigravity Manager 容器内 Google OAuth 登录失败的排查复盘。整个问题复盘下来其实很清晰，关键点只有两个：

> `127.0.0.1` 对 Docker 容器来说不是宿主机。

> UFW 又挡住了 Docker → 宿主机 7892 的连接。

## 1. 最开始的问题

Antigravity Manager 在 Docker 里，Google OAuth 登录失败：

```text
oauth2.googleapis.com/token
operation timed out
```

也就是 **Antigravity 容器访问 Google 不通**。

## 2. 为什么主机的 `127.0.0.1:7892` 能用？

宿主机上的代理客户端（CatCore）监听：

```text
*:7892
```

主机执行：

```bash
curl -x http://127.0.0.1:7892 ...
```

可以正常访问 Google。

但是：

```text
主机的 127.0.0.1
        ≠
Docker 容器的 127.0.0.1
```

容器里的 `127.0.0.1` 指的是**容器自己**，而不是宿主机。

## 3. 选择方案：走 Docker 网桥

让容器通过 Docker 网桥访问宿主机：

```text
172.17.0.1:7892
```

理论路径：

```text
Antigravity
 ↓
172.17.0.1:7892
 ↓
CatCore
 ↓
Google
```

## 4. 第一次测试为什么失败？

容器测试：

```bash
docker exec antigravity-manager sh -c \
'curl -x http://172.17.0.1:7892 -I https://oauth2.googleapis.com'
```

超时。

后来检查发现：

```text
docker0 = 172.17.0.1
CatCore = *:7892
UFW = 激活
```

而 UFW 当时基本只允许：

```text
22/tcp
```

所以判断是 **UFW 把 Docker → 7892 的连接挡住了**。

## 5. 放行 Docker → 7892

执行：

```bash
sudo ufw allow in on docker0 to any port 7892 proto tcp
```

再次测试：

```bash
docker exec antigravity-manager sh -c \
'curl --connect-timeout 3 -I -x http://172.17.0.1:7892 https://oauth2.googleapis.com'
```

成功：

```text
HTTP/1.1 200 Connection established
HTTP/2 404
```

这里的 `404` **不是问题**——它只是对根路径 `HEAD` 请求的正常响应。

它说明：

```text
Docker容器
 ↓
UFW
 ↓
CatCore
 ↓
Google
```

整个网络链路已经打通。

## 6. 为什么还要重建 Antigravity？

因为刚才的 `curl -x`：

```bash
curl -x http://172.17.0.1:7892 ...
```

只是**临时测试**，它不会改变 Antigravity 程序本身的代理配置。

所以需要在容器环境变量里加入：

```text
HTTP_PROXY=http://172.17.0.1:7892
HTTPS_PROXY=http://172.17.0.1:7892
```

这样 Antigravity 自己发起 Google OAuth 请求时，也会走 CatCore。

## 7. 为什么不改 `docker.service.d/proxy.conf`？

因为那个配置：

```text
/etc/systemd/system/docker.service.d/proxy.conf
```

作用于：

```text
Docker daemon → 代理
```

例如 `docker pull`。

它**不会自动把容器内所有程序的代理环境变量设置好**。

所以：

```text
Docker daemon
    ↓
127.0.0.1:7892       ← 可以保持原样

Antigravity container
    ↓
172.17.0.1:7892       ← 单独配置
```

这是两个不同层次。

## 8. 最终操作

按三步走：

```bash
docker stop antigravity-manager
docker rm antigravity-manager
```

然后用增加了：

```bash
-e HTTP_PROXY=http://172.17.0.1:7892 \
-e HTTPS_PROXY=http://172.17.0.1:7892 \
```

的 `docker run` 重建。

原有的数据卷挂载：

```bash
-v ~/.antigravity_tools:/root/.antigravity_tools
```

会保留数据。

## 小结

| 层次 | 代理地址 | 配置位置 |
| --- | --- | --- |
| Docker daemon（`docker pull`） | `127.0.0.1:7892` | `docker.service.d/proxy.conf` |
| 容器内程序 | `172.17.0.1:7892` | 容器环境变量 `HTTP_PROXY` / `HTTPS_PROXY` |

容器要走宿主机代理，需要同时满足三个条件：地址用 `172.17.0.1` 而非 `127.0.0.1`、UFW 放行 `docker0` 上的代理端口、程序本身通过环境变量感知代理。
