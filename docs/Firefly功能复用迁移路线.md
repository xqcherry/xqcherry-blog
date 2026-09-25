# Firefly 功能复用迁移路线

本文档记录当前博客与 `F:\repository\Firefly` 的功能对比结果，作为后续按需迁移的路线图。

目标是保留当前博客的主题、文章 URL 和已有内容，只在需要时逐项引入 Firefly 的独立模块。不要直接用 Firefly 覆盖当前项目。

## 一、当前博客已有能力

当前项目已经具备：

- 文章、草稿、归档、分类和标签
- 文章封面、阅读时间、目录和分页
- Pagefind 全文搜索
- Artalk 评论
- 赞助页、关于页、留言板
- 代码高亮、代码行号、可折叠代码块
- KaTeX 数学公式
- GitHub Card
- Markdown 提示块（note、tip、important、warning、caution）
- 图片灯箱（PhotoSwipe）
- 亮色/暗色主题、主题色设置和显示设置
- RSS、Sitemap 和多语言基础支持

因此，迁移重点不是替换基础博客，而是增加内容类型、文章增强和站点扩展能力。

## 二、总体迁移原则

1. **增量迁移**：保留当前 `src/layouts`、现有文章组件和样式体系。
2. **先独立页面，后全局能力**：优先迁移不会影响首页和文章页的模块。
3. **先本地数据，后第三方服务**：动态、友链和项目先使用 Markdown 或配置文件。
4. **只迁移必要依赖**：不要因为一个组件整体引入 Firefly 的 Astro、Tailwind 或构建链升级。
5. **迁移前检查依赖链**：Firefly 组件通常依赖自身的配置、类型、工具函数和 CSS，不能只复制单个 `.astro` 文件。

## 三、按难度排序的迁移清单

难度分为：

- **低**：可独立新增，基本不影响现有文章和布局
- **中**：需要修改内容 schema、页面路由或全局配置
- **高**：涉及 Markdown 编译链、运行时服务、资源处理或大量样式

### 1. 友链页面（低）

Firefly 能力：友链列表、头像、描述、链接、权重排序。

参考位置：

- `Firefly/src/config/friendsConfig.ts`
- `Firefly/src/pages/friends.astro`
- `Firefly/src/content/spec/friends.mdx`

当前状态：没有友链页面。

建议方案：第一版使用 `src/config/friends.ts` 或 `src/content/spec/friends.mdx` 保存数据，新增 `/friends/` 页面，并在导航栏加入入口。

迁移边界：暂不引入自动检测友链状态、随机排序等附加逻辑。

验证：空列表、单条友链、多条友链、无头像和外部链接均能正常渲染。

### 2. 项目展示页（低）

Firefly 能力：项目卡片、项目描述、标签、状态、多个项目链接。

参考位置：

- `Firefly/src/content/projects`
- `Firefly/src/components/pages/projects/ProjectCard.astro`
- `Firefly/src/pages/projects/index.astro`
- `Firefly/src/pages/projects/[slug].astro`

当前状态：没有 `projects` 内容集合和项目页。

建议方案：新增 `projects` collection，采用 Markdown/MDX 保存项目详情；先实现列表页，详情页可随后补充。

建议字段：`title`、`published`、`description`、`image`、`tags`、`status`、`link`、`order`。

验证：项目排序、草稿过滤、封面缺失、链接为空和移动端卡片布局。

### 3. 独立分类页和标签页（低）

Firefly 能力：分类索引、标签索引和按分类/标签筛选文章。

参考位置：

- `Firefly/src/pages/categories/index.astro`
- `Firefly/src/pages/tags/index.astro`
- `Firefly/src/components/common/FilterControls.svelte`

当前状态：文章已有 `category` 和 `tags` 字段，但没有独立索引页。

建议方案：直接复用现有文章查询逻辑，新增 `/categories/` 和 `/tags/` 页面，不改变文章 URL 和 frontmatter 格式。

验证：无分类文章、空标签、大小写相近的标签、分页和文章草稿过滤。

### 4. 系列文章（低到中）

Firefly 能力：系列索引、系列顺序、当前文章位置、上一篇/下一篇系列导航。

参考位置：

- `Firefly/src/components/misc/SeriesNav.astro`
- `Firefly/src/pages/series/index.astro`
- `Firefly/src/utils/content-utils.ts`

当前状态：当前 schema 已有内部导航字段，但没有 `series` 和 `seriesOrder` 字段。

建议方案：给文章 schema 增加可选的 `series`、`seriesOrder`，新增系列索引页，并在文章页显示系列导航。

注意：系列排序必须明确使用 `seriesOrder`；没有顺序的文章使用发布日期作为备用排序。

验证：单篇系列、缺少顺序、顺序重复、系列中间文章和跨目录文章。

### 5. 相册和图库（中）

Firefly 能力：相册列表、相册详情、图片卡片、瀑布流和灯箱。

参考位置：

- `Firefly/src/pages/gallery`
- `Firefly/src/components/pages/gallery/AlbumCard.astro`
- `Firefly/src/components/pages/gallery/PhotoCard.astro`
- `Firefly/src/config/galleryConfig.ts`

当前状态：没有独立相册页面，但已有 PhotoSwipe 和图片包装组件，可以复用已有依赖。

建议方案：第一版使用 `public/gallery` 或独立内容配置保存相册，先实现静态相册和灯箱；不要一开始迁移加密相册和远程图片管理。

验证：空相册、单图相册、大图、图片加载失败、移动端瀑布流和灯箱返回行为。

### 6. 动态/说说系统（中）

Firefly 能力：本地 Markdown 动态、置顶、位置、分页、年份筛选、图片画廊和动态评论。

参考位置：

- `Firefly/src/content/dynamic`
- `Firefly/src/components/pages/dynamic`
- `Firefly/src/pages/dynamic`
- `Firefly/src/config/dynamicConfig.ts`

当前状态：没有动态内容集合和动态页。

建议方案：先新增 `dynamic` collection，使用本地 Markdown 文件；复用 `DynamicItem`、`DynamicGallery` 的结构，但适配当前的评论和图片组件。

暂不迁移：Memos 数据源、动态 API 和动态内联评论。这些功能需要额外的远程服务配置。

验证：置顶动态、年份筛选、分页、无图动态、多图动态、Markdown 内容和空数据。

### 7. 文章推荐、统计和系列导航（中）

Firefly 能力：相关文章推荐、文章统计、系列导航。

参考位置：

- `Firefly/src/components/misc/RecommendedPost.astro`
- `Firefly/src/components/layout/PostStats.astro`
- `Firefly/src/components/misc/SeriesNav.astro`

当前状态：文章元数据已有部分能力，但没有统一的推荐和统计组件。

建议方案：先将推荐算法限制为同分类或同标签文章，避免引入复杂索引；统计信息优先使用构建时可获得的数据，例如字数、阅读时间和更新时间。

验证：无相似文章、只有一篇文章、同标签文章过多和草稿过滤。

### 8. 图片增强和代码组（中）

Firefly 能力：更完善的图片处理、代码组、图片懒加载和构建期图片资源处理。

参考位置：

- `Firefly/src/components/features/FancyboxManager.astro`
- `Firefly/src/components/features/CodeGroupManager.astro`
- `Firefly/src/plugins/remark-image-grid.js`
- `Firefly/src/plugins/rehype-figure.mjs`

当前状态：当前项目已有 PhotoSwipe、图片包装器和 Expressive Code，但没有代码组和图片网格语法。

建议方案：优先迁移代码组和图片网格 Markdown 插件；不要同时迁移 Firefly 的全部图片构建脚本。

验证：单组代码、多标签代码组、图片网格、图片缺失和普通 Markdown 图片兼容性。

### 9. Mermaid、PlantUML 和 Wiki Link（中到高）

Firefly 能力：Mermaid、PlantUML、图表缩放、主题切换、Wiki Link。

参考位置：

- `Firefly/src/plugins/remark-mermaid.js`
- `Firefly/src/plugins/remark-plantuml.js`
- `Firefly/src/plugins/rehype-mermaid.mjs`
- `Firefly/src/plugins/rehype-plantuml.mjs`
- `Firefly/src/plugins/remark-wiki-link.js`

当前状态：当前 Markdown 配置没有这些插件。

建议方案：分开迁移。先迁移 Mermaid，再评估 PlantUML；PlantUML 需要编码器、远程渲染服务或本地渲染策略。

风险：会修改 `astro.config.mjs` 的 Markdown 编译链，必须确保现有 KaTeX、提示块、GitHub Card 和标题锚点不回归。

验证：正常图表、暗色主题、图表语法错误、SSR 构建和客户端缩放。

### 10. 加密文章和加密内容（中到高）

Firefly 能力：整篇文章加密、文章内局部内容加密、密码提示。

参考位置：

- `Firefly/src/components/features/EncryptedPost.astro`
- `Firefly/src/components/features/EncryptedContent.astro`
- `Firefly/src/utils/crypto-utils.ts`

当前状态：文章 schema 没有密码、密码提示和评论开关字段。

建议方案：只有明确需要发布私密文章时再迁移；先设计数据字段和密钥派生方式，再接入页面。

注意：客户端加密只能防止普通访问者直接查看，不能替代真正的权限控制，也不应保护高敏感数据。

### 11. 多评论系统（中）

Firefly 能力：统一支持 Artalk、Twikoo、Waline、Giscus、Disqus。

参考位置：

- `Firefly/src/components/comment/index.astro`
- `Firefly/src/components/comment/Artalk.astro`
- `Firefly/src/components/comment/Twikoo.astro`
- `Firefly/src/components/comment/Waline.astro`
- `Firefly/src/components/comment/Giscus.astro`
- `Firefly/src/config/commentConfig.ts`

当前状态：当前项目只有 Artalk，入口位于 `src/components/misc/Comments.astro`。

建议方案：保留现有 Artalk 行为，先抽象评论 provider 接口，再按需增加其他系统，避免一次性改动文章页和留言板。

### 12. 统计分析（低到中）

Firefly 能力：Google Analytics、Microsoft Clarity、Umami、51la。

参考位置：

- `Firefly/src/components/analytics`
- `Firefly/src/config/analyticsConfig.ts`

当前状态：没有统一统计接入模块。

建议方案：迁移为独立的配置驱动组件，默认关闭；只启用实际使用的一个服务。

验证：统计脚本默认不输出、配置关闭时不加载、生产构建后脚本位置正确。

### 13. 高级搜索（中）

Firefly 能力：Pagefind 搜索、筛选、排序和更丰富的搜索界面。

参考位置：

- `Firefly/src/components/pages/AdvancedSearch.svelte`
- `Firefly/src/pages/search.astro`
- `Firefly/src/components/common/FilterControls.svelte`

当前状态：当前项目已有 `src/components/Search.svelte` 和 Pagefind，基础搜索已存在。

建议方案：先不替换现有搜索；如果后续需要搜索分类、标签、年份或排序，再局部移植筛选逻辑。

### 14. 阅读体验和悬浮控制（中）

Firefly 能力：沉浸式阅读、悬浮目录、悬浮控制按钮、返回评论区、滚动指示器。

参考位置：

- `Firefly/src/components/controls/ImmersiveReading.astro`
- `Firefly/src/components/controls/FloatingTOC.astro`
- `Firefly/src/components/controls/FloatingControls.astro`

当前状态：当前项目已有目录、返回顶部和显示设置。

建议方案：只在确认现有文章页布局需要增强时迁移，避免重复实现目录和控制按钮。

### 15. 分享海报（中到高）

Firefly 能力：客户端或构建期生成文章分享海报。

参考位置：

- `Firefly/src/components/misc/SharePoster.svelte`
- `Firefly/src/pages/og/[...slug].ts`

当前状态：没有 OG 图片生成和分享海报。

建议方案：先迁移服务端 OG 图片页面，再考虑客户端分享海报；需要检查字体、图片和部署平台兼容性。

### 16. 音乐、Live2D、Spine 和视觉特效（高）

Firefly 能力：音乐播放器、背景音乐、Live2D、Spine、樱花、波浪、打字机效果。

参考位置：

- `Firefly/src/components/features`
- `Firefly/src/config/musicConfig.ts`
- `Firefly/src/config/pioConfig.ts`
- `Firefly/src/config/effectsConfig.ts`
- `Firefly/public/pio`

当前状态：没有这些能力和资源。

建议方案：最后考虑。这些功能会增加静态资源体积、移动端性能负担和维护成本；其中 Live2D、Spine 还需要一并迁移模型资源和运行时脚本。

## 四、不建议整体复制的部分

Firefly 当前使用 Astro 7、Tailwind 4，并包含较多自己的配置、类型、工具函数和构建脚本；当前博客使用 Astro 5、Tailwind 3。以下内容不建议直接覆盖：

- `Firefly/src/layouts`
- `Firefly/src/styles`
- `Firefly/astro.config.mjs`
- `Firefly/src/config/index.ts`
- Firefly 的完整构建脚本链
- Firefly 的全部 `public/pio` 和音乐资源

应采用“复制功能思路 + 适配当前接口”的方式迁移。

## 五、推荐实际顺序

1. 友链页
2. 项目页
3. 分类页和标签页
4. 系列文章
5. 相册页
6. 动态/说说
7. 相关文章推荐和文章统计
8. 代码组、图片网格
9. Mermaid
10. 多评论系统
11. 加密文章
12. PlantUML、Wiki Link、高级搜索和分享海报
13. 音乐、Live2D、Spine 和视觉特效

## 六、迁移完成后的通用检查

每次迁移一个模块后执行：

```bash
pnpm check
pnpm type-check
pnpm build
```

同时检查：

- 原有文章 URL 不变
- 首页、文章页、归档页仍能正常生成
- 亮色/暗色主题正常
- 搜索、目录、评论和图片灯箱不回归
- 移动端布局正常
- 生产构建不引入不必要的远程请求

## 七、许可证说明

Firefly 使用 MIT License。若直接复制其实质代码或较大代码片段，应保留原项目的版权声明和 MIT License 文本。只参考设计思路、接口设计或自行重写实现时，不需要复制具体代码，但仍建议在迁移记录中注明参考来源。
