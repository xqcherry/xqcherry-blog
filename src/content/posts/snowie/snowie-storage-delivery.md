---
title: "Snowie 对象存储与云上交付：从文件抽象到迁移策略"
published: 2026-09-27
draft: true
description: "结合 ObjectStorageService、MinioObjectStorageService 和媒体策略，复盘 AI 应用中的文件处理、URL 与迁移边界。"
tags: [对象存储, 云上交付]
series: Snowie 实习项目
seriesOrder: 6
---

图片、附件、告警卡和语音文件都会穿过 AI 应用，但它们的生命周期和消费方完全不同。把所有文件都交给业务代码直接拼接 MinIO URL，会让供应商、权限和迁移成本扩散到每个模块。

## 让业务依赖 ObjectStorageService

业务层依赖对象存储服务接口，具体实现由 `MinioObjectStorageService` 提供。上传、下载、删除和访问地址留在 storage 包内，业务模块不需要知道 SDK 客户端和 endpoint 细节。

```text
业务模块
   ↓
ObjectStorageService
   ↓
MinioObjectStorageService
   ↓
对象存储
```

## URL 策略跟消费方走

| 消费方 | 合适策略 | 原因 |
| --- | --- | --- |
| 长期展示图片 | CDN/稳定访问地址 | 缓存和长期展示 |
| 临时告警卡 | 预签名 URL | 限制有效期 |
| AI 视觉输入 | 后端下载或转换 | 模型未必能访问私有地址 |
| 语音流 | 直接推送或短缓存 | 不一定需要长期落盘 |

:::warning[对象 key 不是公开 URL]
对象 key 是存储内部标识。直接暴露它会绕过访问控制，也会把未来迁移到其他供应商的成本写进业务数据。
:::

## 外部媒体的入站链路

外部平台的媒体通常带有平台鉴权和短期 URL。渠道层解析 media id 和 metadata，`InboundMediaDownloader` 负责下载并转换为统一对象，之后由策略决定上传对象存储、交给视觉模型，还是只保留临时副本。

```text
平台 webhook
    ↓
渠道解析器
    ↓
InboundMediaDownloader
    ↓
DownloadedObject
    ├─ 对象存储
    ├─ AI 输入
    └─ 临时丢弃
```

## 迁移不是一次 DNS 切换

云上迁移需要把入口、源站、数据和回滚拆成可验证的阶段：

```text
新环境并行重建
    ↓
对齐证书 / WAF / CDN / 源站配置
    ↓
数据库与对象存储增量同步
    ↓
短维护窗口停写
    ↓
切换入口并验证
    ↓
保留旧环境作为回退路径
```

入口域名和源站子域名解耦后，换服务器不需要让所有客户端重新认识一个新地址；同步、切换和回滚也可以分别验证。

## 基础设施也属于业务可用性

用户不会看到 `ObjectStorageService`，但会看到图片打不开、告警卡过期、语音迟迟不来，或者迁移后某个渠道突然失去上下文。存储抽象、URL 生命周期和迁移步骤最终都在保护同一件事：媒体不应该成为 Snowie 体验的脆弱环节。
