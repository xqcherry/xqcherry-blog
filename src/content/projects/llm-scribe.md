---
title: "LLM-Scribe：面向 QQ 群聊的智能摘要插件"
published: 2025-11-01
description: "一个基于 NoneBot2、OneBot v11 与 LangChain 生态构建的 QQ 群聊总结插件，将指定时间窗口内的消息整理为可直接发送的图文报告。"
status: archived
tags:
  - Python
  - NoneBot2
  - LangChain
  - LLM
  - MySQL
link:
  - label: "GitHub"
    icon: "fa6-brands:github"
    value: "https://github.com/xqcherry/LLM-Scribe"
---

## 项目概览

LLM-Scribe 是一个面向 QQ 群聊场景的 LLM 智能摘要插件，基于 NoneBot2 与 OneBot v11 开发。它会从数据库读取指定时间窗口内的群聊消息，经过清洗、结构化总结和主题提炼后，渲染成一张可以直接发送到群里的摘要长图。

这是我在 Coding Agent 还没有兴起时做的项目。当时元宝的 QQ 总结功能还没有推出，我希望先为自己的 QQ Bot 增加一个群聊总结能力。项目目前已停止开发和维护。

## 主要功能

### 群聊消息摘要

插件默认从 MySQL 表 `messages_event_logs` 中读取群聊消息，并根据时间窗口生成总结报告。报告包含以下内容：

- 群聊内容总览
- 主要话题列表
- 参与者信息
- 消息统计

### 灵活的时间窗口

插件提供 `/sum` 和 `/summary` 命令，默认总结最近 6 小时的消息，也可以指定其他时间范围：

| 命令 | 作用 |
| --- | --- |
| `/sum` | 总结最近 6 小时的消息 |
| `/sum 12` | 总结最近 12 小时的消息 |
| `/sum day` 或 `/sum d` | 总结最近 24 小时的消息 |
| `/sum ls` | 查看帮助 |

时间窗口支持 1～72 小时。

### 自动选择模型与成本估算

摘要流程会先估算输入消息的 Token 数，再根据上下文长度选择不同规格的模型（8k、32k 或 128k），并计算预估成本。这样可以在处理较长群聊记录时，尽量平衡上下文容量和调用成本。

### 图文报告渲染

项目使用 Jinja2 构建 HTML 模板，再通过 Playwright 将模板渲染为高清长图。相比直接发送纯文本，图文报告更适合在群聊中快速浏览，也方便后续调整展示结构。

## 实现方式

项目使用 Python 开发，采用 LangChain 生态中的 LangGraph 编排摘要流程，将消息读取、摘要生成和报告渲染拆分为相互独立的步骤：

1. `interfaces/bot/summary_command.py` 接收命令并解析参数。
2. `application/services/summary_report_app_service.py` 串联摘要和渲染流程。
3. `infrastructure/persistence/adapters/mysql_message_repository.py` 从 MySQL 读取消息。
4. `infrastructure/summary/graph/summary_graph.py` 执行 LangGraph 工作流。
5. `infrastructure/summary/chains/summary_chain.py` 调用 LLM，生成结构化摘要。
6. `infrastructure/reporting/` 将结果渲染为 HTML 并截图为图片。

整体结构参考了 Ports & Adapters 的分层思路，将领域逻辑、应用服务、基础设施实现和 Bot 接口分开：

```text
src/
├─ application/            # 应用层（用例与端口）
├─ domain/                 # 领域层（实体与领域服务）
├─ infrastructure/         # 基础设施层（LLM、数据库、渲染、模板等）
└─ interfaces/             # 接口层（NoneBot 命令）
```

## 运行条件

- Python 3.10+
- MySQL，以及名为 `messages_event_logs` 的消息表
- NoneBot2 运行环境
- 可用的 LLM API Key，当前实现默认使用 Moonshot 兼容接口
- Playwright Chromium 浏览器内核

消息表需要提供以下字段，才能被默认的数据访问实现读取：

- `message_type`
- `group_id`
- `user_id`
- `sender_nickname`
- `raw_message`
- `time`

## 基本使用

安装依赖并准备 Playwright 浏览器内核：

```bash
pip install -r requirements.txt
python -m playwright install chromium
```

然后复制并填写环境变量配置：

```bash
cp .env.example .env
```

主要配置包括数据库连接信息、`LLM_API_KEY`，以及可选的 `IGNORE_QQ`。最后将项目作为插件模块接入 NoneBot2 主程序。

## 项目状态与回顾

项目目前已停止开发和维护。它记录了我在 LLM 应用早期阶段的一次完整尝试：从群聊消息持久化、Token 估算和模型选择，到 LangGraph 工作流编排，再到最终的图片报告生成。
