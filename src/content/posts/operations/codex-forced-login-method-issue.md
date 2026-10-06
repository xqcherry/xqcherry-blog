---
title: Codex 已登录却反复要求登录：forced_login_method 不生效的排查与解决
published: 2026-10-06
description: codex login status 显示已登录但启动仍进入登录界面的排查复盘：排除凭证与代理问题后，定位到认证策略未生效，最终通过 config.toml 的 forced_login_method 解决。
tags: [Codex, CLI, 运维]
category: 运维
draft: false
---

`codex login status` 明明显示已登录，直接运行 `codex` 却又跳回登录界面。这篇复盘记录完整的排查过程，核心结论先行：

> Codex 不是没登录，而是普通启动时认证策略没有正确生效；`-c` 强制 ChatGPT 可以绕过，官方 Issue #46914 也记录了这个问题。

## 1. 问题

```bash
codex login status
```

显示：

```text
Logged in using ChatGPT
```

但：

```bash
codex
```

却重新进入登录界面。

## 2. 排查

先确认登录凭证：

```text
~/.codex/auth.json
```

存在，并且：

```text
auth_mode = chatgpt
```

→ **排除登录凭证问题。**

然后检查网络：

```bash
codex doctor
```

一开始发现代理没有正确传给 Codex。代理监听在 `127.0.0.1:7892`，于是设置：

```bash
export HTTP_PROXY=http://127.0.0.1:7892
export HTTPS_PROXY=http://127.0.0.1:7892
export ALL_PROXY=http://127.0.0.1:7892
```

再次运行 `codex doctor`，显示：

```text
websocket connected
HTTP 101 Switching Protocols
ChatGPT inference URL reachable
```

→ **网络也正常。**

## 3. 关键发现

执行：

```bash
codex -c 'forced_login_method="chatgpt"'
```

结果：**直接进入 Codex。**

所以可以确定：**账号、token、代理都没问题**，问题出在 Codex 启动时的**认证策略 / app-server**。

## 4. 官方 Issue

OpenAI Codex 官方仓库有一个几乎一样的现象：

- [Issue #46914](https://github.com/openai/codex/issues/46914)

Issue 描述：

> `forced_login_method = "chatgpt"` from config.toml is not respected, while CLI `-c` override works

也就是说 `codex` 有问题，但：

```bash
codex -c 'forced_login_method="chatgpt"'
```

正常，和这里的症状基本一致。

## 5. 最终解决

编辑配置：

```bash
nano ~/.codex/config.toml
```

加入：

```toml
forced_login_method = "chatgpt"
```

最终的 `config.toml`：

```toml
model = "gpt-5.6-luna"
model_reasoning_effort = "medium"
forced_login_method = "chatgpt"

[tui]
screen_reader_detection_done = true
```

然后重启 app-server：

```bash
codex app-server daemon restart
```

最后正常运行 `codex` 即可。

## 排查路径小结

| 步骤 | 命令 | 结论 |
| --- | --- | --- |
| 检查登录状态 | `codex login status` | 已登录，排除凭证问题 |
| 检查网络 | `codex doctor` | 补齐代理环境变量后正常 |
| 强制认证方式 | `codex -c 'forced_login_method="chatgpt"'` | 能进，定位到认证策略 |
| 固化配置 | `config.toml` + `app-server daemon restart` | 彻底解决 |

遇到同类问题，最关键的一条判断依据：

```bash
codex -c 'forced_login_method="chatgpt"'
```

**能进 = 优先查配置 / app-server，不要去删 `auth.json`。**
