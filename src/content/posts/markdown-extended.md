---
title: Markdown 扩展功能
published: 2024-05-01
updated: 2024-11-29
description: '了解更多 Fuwari 支持的 Markdown 扩展功能'
image: ''
tags: [示例, Markdown]
category: '示例'
draft: true
---

## GitHub 仓库卡片

你可以添加动态的 GitHub 仓库链接卡片，页面加载时会从 GitHub API 拉取仓库信息。

::github{repo="Fabrizz/MMM-OnSpotify"}

用代码 `::github{repo="<用户名>/<仓库名>"}` 即可创建 GitHub 仓库卡片。

```markdown
::github{repo="saicaca/fuwari"}
```

## 提示框（Admonitions）

支持以下类型的提示框：`note`（笔记）`tip`（技巧）`important`（重要）`warning`（警告）`caution`（注意）

:::note
即使只是快速浏览，用户也应该注意的信息。
:::

:::tip
帮助用户更顺利使用的可选信息。
:::

:::important
用户成功所必需的关键信息。
:::

:::warning
因存在潜在风险而需要用户立即关注的重要内容。
:::

:::caution
某个操作可能带来的负面后果。
:::

### 基本语法

```markdown
:::note
即使只是快速浏览，用户也应该注意的信息。
:::

:::tip
帮助用户更顺利使用的可选信息。
:::
```

### 自定义标题

提示框的标题可以自定义。

:::note[我的自定义标题]
这是一个带有自定义标题的提示框。
:::

```markdown
:::note[我的自定义标题]
这是一个带有自定义标题的提示框。
:::
```

### GitHub 语法

> [!TIP]
> 也支持 [GitHub 语法](https://github.com/orgs/community/discussions/16925)。

```
> [!NOTE]
> 也支持 GitHub 语法。

> [!TIP]
> 也支持 GitHub 语法。
```

### 剧透（防剧透文本）

你可以给文字添加剧透效果，被隐藏的文字也支持 **Markdown** 语法。

内容 :spoiler[被隐藏了 **嘿嘿**]！

```markdown
内容 :spoiler[被隐藏了 **嘿嘿**]！

```
