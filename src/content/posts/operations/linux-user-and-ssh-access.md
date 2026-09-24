---
title: Linux 服务器初始化：创建管理员用户并启用 SSH 密钥登录
published: 2026-05-27
description: 一份最小而安全的 Linux 服务器初始化流程：创建日常管理员账户、配置 sudo、部署 SSH 公钥，并在验证后关闭密码登录。
tags: [Linux, SSH, 服务器安全, 运维]
category: 运维
draft: false
---

新服务器不应长期直接使用 root 账户，也不应把密码作为主要远程登录方式。下面的流程将日常操作切换到拥有 sudo 权限的普通用户，并通过 SSH 密钥认证访问服务器。

:::caution[避免把自己锁在门外]
请保持当前 root 会话不断开，在**另一个终端**确认新用户可以通过密钥登录并运行 `sudo` 后，再修改 SSH 的密码登录策略。
:::

## 1. 创建日常管理员账户

将 `<user>` 替换为实际用户名：

```bash
sudo useradd --create-home --shell /bin/bash <user>
sudo passwd <user>
sudo usermod -aG sudo <user>
```

在 Debian/Ubuntu 上，可用以下命令验证该用户是否拥有 sudo 权限：

```bash
su - <user>
sudo -v
```

## 2. 在本地生成 SSH 密钥

如果还没有可用密钥，在本地机器执行：

```bash
ssh-keygen -t ed25519 -a 100 -C "your_email@example.com"
```

私钥应始终只保留在你的受控设备或密钥管理工具中；不要上传、粘贴到聊天记录，也不要提交到仓库。

## 3. 部署并验证公钥

使用密码仅完成这一次公钥部署：

```bash
ssh-copy-id <user>@<server-host>
ssh <user>@<server-host>
```

无法使用 `ssh-copy-id` 时，可将本地 `~/.ssh/id_ed25519.pub` 的内容追加到服务器用户的 `~/.ssh/authorized_keys`，并确保权限正确：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## 4. 验证后收紧 SSH 策略

确认密钥登录正常后，在 `/etc/ssh/sshd_config.d/hardening.conf`（或发行版对应的 sshd 配置文件）加入：

```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

检查配置并平滑重载服务：

```bash
sudo sshd -t
sudo systemctl reload ssh
```

:::important[恢复方式]
在关闭密码认证前，确保至少两台受控设备保存了可用私钥，或确认云厂商控制台能够提供带外恢复入口。
:::
