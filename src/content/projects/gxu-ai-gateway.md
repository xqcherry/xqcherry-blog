---
title: "GXU AI Gateway：广西大学 AI 平台的 OpenAI 兼容网关"
published: 2026-09-12
description: "一次从兴趣出发的尝试：将广西大学 AI 平台的登录、Token 管理、智能体会话和 SSE 对话能力封装为 OpenAI 兼容接口。"
status: published
tags:
  - TypeScript
  - Next.js
  - OpenAI API
  - SSE
  - AI Gateway
link:
  - label: "GitHub"
    icon: "fa6-brands:github"
    value: "https://github.com/xqcherry/gxu-ai-gateway"
---

## 项目概览

GXU AI Gateway 是一个面向广西大学 AI 平台的 API 网关。它将上游平台的 CAS 登录、Token 续期、智能体列表、会话管理和 SSE 流式对话封装起来，对外提供 OpenAI 兼容接口以及一组更直接的 REST API。

项目起源于一次无聊时的尝试，目标是探索如何把一个仅面向特定平台的 AI 服务，转换成更容易被其他应用和 SDK 使用的统一接口。目前项目已经完成，核心功能可以正常工作，后续仍有进一步优化空间。

## 主要功能

### OpenAI 兼容接口

网关提供 `/v1` 接口前缀，可以使用熟悉的 OpenAI SDK 访问上游智能体：

```python
from openai import OpenAI

client = OpenAI(
    api_key="gk_你的key",
    base_url="http://<网关地址>:3000/v1",
)
resp = client.chat.completions.create(
    model="灵小西",      # 智能体名称，模糊匹配
    messages=[{"role": "user", "content": "你好"}],
)
```

其中 `model` 对应上游智能体名称，网关会负责模糊匹配智能体、创建或复用会话，并将上游响应转换为 OpenAI 风格的结果。

支持的 OpenAI 兼容接口包括：

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/v1/chat/completions` | `POST` | 支持流式和非流式对话 |
| `/v1/models` | `GET` | 返回可用智能体列表 |

### REST 能力接口

除了 OpenAI 兼容层，项目还提供更贴近业务能力的接口：

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/register` | `POST` | 使用平台账号注册网关 API Key |
| `/api/agents` | `GET` | 获取智能体列表 |
| `/api/chat` | `POST` | 发起对话并返回完整回答 |
| `/api/chat/stream` | `POST` | 以 SSE 方式返回增量回答 |

除注册接口外，其他接口统一使用 `Authorization: Bearer <api-key>` 鉴权。

能力层对话请求支持指定智能体、复用会话，以及控制联网搜索和个人搜索等选项：

```json
{
  "message": "必填",
  "agentId": "可选，与 agentName 二选一",
  "agentName": "可选，按名称模糊匹配",
  "sessionId": "可选，复用上游会话，缺省新建",
  "onlineSearch": false,
  "personalSearch": false
}
```

### 上游登录与 Token 管理

网关在服务端封装了上游平台的登录链路，并负责维护访问令牌：

- 处理 CAS 登录和平台 Token 交换
- 自动刷新即将过期的 Token
- 保存和轮换 refresh token
- 统一处理上游会话创建和复用
- 将上游错误转换为网关侧的 API 错误

这些逻辑对调用方透明，调用方只需要管理网关颁发的 API Key。

### 流式响应转换

上游平台使用 `text/event-stream` 返回流式对话结果。网关会解析上游 SSE 数据，提取累积式回答内容，再分别转换成 OpenAI 兼容的流式响应或完整响应。

这层转换也隔离了上游响应中的平台专有字段，让调用方只需要处理标准化后的回答内容。

## 技术实现

项目位于 `gateway/` 目录，使用 Next.js、React 和 TypeScript 构建：

- Next.js App Router：提供页面、API Route 和服务端运行环境
- TypeScript：实现网关核心逻辑和类型约束
- OpenAI 兼容协议：降低接入现有 AI 工具的成本
- SSE：支持对话结果的流式传输
- SQLite：保存网关侧 API Key 等数据
- Docker：支持容器化部署

代码按职责拆分为多个模块：

- `src/app/v1/`：OpenAI 兼容 API
- `src/app/api/`：注册、智能体和对话 REST API
- `src/lib/openai/`：OpenAI 请求解析、格式化和类型定义
- `src/lib/upstream/`：上游登录、Token、智能体、会话和对话调用
- `src/lib/auth/`：API Key 鉴权、Token 管理和限流
- `src/lib/db/`：API Key 数据访问
- `src/lib/crypto/`：认证过程中的加密相关逻辑

## 部署方式

本地运行需要 Node.js 22.5 或更高版本：

```bash
cd gateway
npm install
npm run build
npm start
```

默认监听 `3000` 端口。启动后访问管理页注册 API Key，再使用生成的 Key 调用网关。

项目也提供 Docker Compose 配置：

```bash
docker compose up -d --build
docker compose logs -f gateway
```

API Key 数据保存在名为 `gateway-data` 的 Docker volume 中，部署时需要注意保留该 volume。

## 项目状态

项目已经完成，核心功能包括上游平台接入、Token 管理、智能体发现、会话处理、OpenAI 兼容接口和 SSE 流式响应。后续仍可以继续优化，例如完善错误处理、增强多实例部署能力、扩展兼容的 OpenAI 参数，以及进一步改善管理页面和运维能力。
