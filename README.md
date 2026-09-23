# xq的仓库

个人博客，记录技术、学习和生活。

基于 [Astro](https://astro.build/) 和 [Fuwari](https://github.com/saicaca/fuwari) 模板构建。

## 本地开发

```bash
pnpm install
pnpm dev        # 启动开发服务器 http://localhost:4321
```

## 常用命令

```bash
pnpm new-post "文章标题"   # 新建文章
pnpm build                 # 构建生产版本到 dist/
pnpm check                 # TypeScript 类型检查
```

## 写文章

文章放在 `src/content/posts/`，Markdown 格式，头部使用 YAML frontmatter：

```yaml
---
title: 文章标题
published: 2026-09-23
description: 一句话摘要
tags: [标签1, 标签2]
category: 分类
draft: false
---
```

`draft: true` 的文章只在本地 dev 显示，不会出现在构建产物中。
# xqcherry-blog
