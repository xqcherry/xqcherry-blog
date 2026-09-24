---
title: 从域名到应用：Route 53、CloudFront、Nginx 与 Next.js 的部署链路
published: 2026-07-21
description: 用一个通用架构说明域名注册、DNS、CloudFront、源站域名、Nginx 与 Next.js 各自的职责，以及请求如何从浏览器抵达应用。
tags: [AWS, Nginx, Next.js, 运维]
category: 运维
draft: false
---

一个面向公网的 Web 应用通常由“域名注册、DNS 解析、CDN 入口、源站代理与应用进程”几层构成。把职责拆开，排查访问、缓存或证书问题时就能快速定位到正确的一层。

```text
浏览器
  → DNS（Route 53）
  → CDN（CloudFront）
  → 源站域名（origin.example.com）
  → Nginx
  → Next.js 应用
```

## 各组件的职责

| 组件 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| 域名注册商 | 域名归属与续费 | 不必然提供 DNS 解析 |
| Route 53 | DNS 托管与记录解析 | 不提供应用服务 |
| CloudFront | HTTPS 入口、边缘缓存、回源转发 | 不替代源站业务逻辑 |
| Nginx | 反向代理、请求限制、响应头 | 不生成 Next.js 页面 |
| Next.js | 页面渲染、API 和业务逻辑 | 不管理 DNS 或 CDN 证书 |

## DNS 与入口配置

常见的记录关系是：

```text
example.com        A/AAAA Alias → CloudFront 分发
www.example.com    A/AAAA Alias → CloudFront 分发
origin.example.com A/AAAA          → 源站公网地址或负载均衡器
```

主域名和 `www` 交给 CloudFront，源站使用专门的子域名。这样迁移服务器时只需更新源站记录，不必改动 CDN 分发配置。

:::note[证书位置]
为 CloudFront 自定义域名签发的 ACM 证书必须位于 `us-east-1` 区域。源站若使用 HTTPS，还需要一张与 `origin.example.com` 匹配且由 CloudFront 信任的证书。
:::

## 缓存策略要与请求类型匹配

| 路径类型 | 推荐策略 |
| --- | --- |
| 带哈希的 JS/CSS/图片 | 长缓存，文件名变化即更新 |
| 页面 HTML | 依据是否 SSR、ISR 或静态导出设置短缓存/不缓存 |
| `/api/*` | 通常不缓存，转发必要请求头和查询参数 |
| `/ws/*` | 不缓存，并确认 CDN 与源站均允许 WebSocket 升级 |
| `/_next/image*` | 结合 Next.js 图片优化和缓存策略配置 |

不要把“动态接口一律缓存”或“静态资源一律不缓存”作为默认策略；缓存键、TTL、Cookie 与查询参数都要随业务调整。

## 源站反向代理示意

```nginx
server {
  listen 443 ssl http2;
  server_name origin.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

生产环境还应限制源站仅接受 CloudFront 或受信网络的访问、启用访问日志和健康检查，并避免把管理后台直接暴露在未保护的子域名上。

## 排查顺序

遇到访问故障时，按“DNS 记录 → CloudFront 分发与证书 → 源站可达性 → Nginx 日志 → 应用日志”逐层验证。每层只确认一个事实，可以避免在错误的组件上反复修改配置。
