---
title: Cloudflare 525 故障复盘：从回源握手失败到 Tunnel
published: 2026-09-24
description: 一次 Cloudflare 525 排查：源站直连正常，但传统回源在 TLS 协商阶段被中断，最终通过 Cloudflare Tunnel 恢复访问。
tags: [Cloudflare, Nginx, Docker, 运维, 故障复盘]
category: 运维
draft: false
---

博客接入 Cloudflare 后，访问一度稳定返回 `525 SSL handshake failed`。最终确认：静态站点、Nginx 和证书都能正常工作，问题出在 Cloudflare 到源站公网 `443` 的 TLS 协商链路。

## 现象

原始链路如下：

```text
浏览器 → Cloudflare → 源站公网 443 → Docker/Nginx
```

Cloudflare 开启“完全（严格）”SSL 后，站点返回 525；但绕过 Cloudflare、使用 SNI 直连源站时，首页可以正常返回 `HTTP 200`。

```bash
curl -k -I --resolve example.com:443:<源站 IP> https://example.com/
```

这说明问题不在静态站点构建、Nginx 基础配置或端口可达性。

## 排查结论

服务器抓包表明，Cloudflare 的请求已经到达源站网卡，并转发到 Nginx；Nginx 也正常返回了握手数据。

握手日志中的关键现象是：

```text
Cloudflare ClientHello
→ Nginx ServerHello
→ 对端发送 RST
```

TLS 1.3 中，`ServerHello` 发生在证书发送之前。因此这次中断不足以证明是证书、私钥或域名校验的问题。

后续也逐一排除了这些常见原因：

- 源站安全组或 `443` 端口未开放；
- Nginx 未正确转发；
- 证书过期、私钥不匹配或域名不匹配；
- TLS 1.2 / TLS 1.3 不支持；
- 服务器时间漂移；
- 在 Cloudflare “完全”与“完全（严格）”之间切换。

故障边界最终收敛为：**Cloudflare 到源站公网 `443` 的链路，在 TLS 参数协商阶段中断。** 这类问题无法仅靠站点代码或常规 Nginx 配置可靠解决。

## 解决方案：目前还是解决解决不了

目前还是不知道问题出在哪

只能暂时采用别的方案，将公网回源改为 Tunnel：

```text
浏览器 → Cloudflare → Cloudflare Tunnel
→ cloudflared → Docker 内网 → Nginx
```

`cloudflared` 与 Nginx 加入同一个 Docker 网络，再在 Cloudflare Zero Trust 中为域名配置 Public Hostname。Tunnel 建立后，由服务器主动向 Cloudflare 发起连接，不再依赖 Cloudflare 访问源站公网 `443`。

切换完成后，站点恢复 `HTTP 200`。现阶段保持 Tunnel 作为默认链路。
