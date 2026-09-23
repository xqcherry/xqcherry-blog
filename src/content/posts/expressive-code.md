---
title: Expressive Code 代码块示例
published: 2024-04-10
description: 使用 Expressive Code 时 Markdown 代码块的效果展示。
tags: [Markdown, 博客, 示例]
category: 示例
draft: true
---

本篇文章演示使用 [Expressive Code](https://expressive-code.com/) 时代码块的效果。以下示例基于官方文档，更多细节可参考官方文档。

## Expressive Code

### 语法高亮

[语法高亮](https://expressive-code.com/key-features/syntax-highlighting/)

#### 常规语法高亮

```js
console.log('这段代码有语法高亮！')
```

#### 渲染 ANSI 转义序列

```ansi
ANSI colors:
- Regular: [31mRed[0m [32mGreen[0m [33mYellow[0m [34mBlue[0m [35mMagenta[0m [36mCyan[0m
- Bold:    [1;31mRed[0m [1;32mGreen[0m [1;33mYellow[0m [1;34mBlue[0m [1;35mMagenta[0m [1;36mCyan[0m
- Dimmed:  [2;31mRed[0m [2;32mGreen[0m [2;33mYellow[0m [2;34mBlue[0m [2;35mMagenta[0m [2;36mCyan[0m

256 colors (showing colors 160-177):
[38;5;160m160 [38;5;161m161 [38;5;162m162 [38;5;163m163 [38;5;164m164 [38;5;165m165[0m
[38;5;166m166 [38;5;167m167 [38;5;168m168 [38;5;169m169 [38;5;170m170 [38;5;171m171[0m
[38;5;172m172 [38;5;173m173 [38;5;174m174 [38;5;175m175 [38;5;176m176 [38;5;177m177[0m

Full RGB colors:
[38;2;34;139;34mForestGreen - RGB(34, 139, 34)[0m

Text formatting: [1mBold[0m [2mDimmed[0m [3mItalic[0m [4mUnderline[0m
```

### 编辑器与终端外框

[编辑器与终端外框](https://expressive-code.com/key-features/frames/)

#### 代码编辑器外框

```js title="my-test-file.js"
console.log('Title 属性示例')
```

---

```html
<!-- src/content/index.html -->
<div>文件名注释示例</div>
```

#### 终端外框

```bash
echo "这个终端外框没有标题"
```

---

```powershell title="PowerShell 终端示例"
Write-Output "这个有标题！"
```

#### 覆盖外框类型

```sh frame="none"
echo "看，没有外框！"
```

---

```ps frame="code" title="PowerShell Profile.ps1"
# 不覆盖的话，这会是一个终端外框
function Watch-Tail { Get-Content -Tail 20 -Wait $args }
New-Alias tail Watch-Tail
```

### 文本与行标记

[文本与行标记](https://expressive-code.com/key-features/text-markers/)

#### 标记整行和行范围

```js {1, 4, 7-8}
// 第 1 行 - 按行号标记
// 第 2 行
// 第 3 行
// 第 4 行 - 按行号标记
// 第 5 行
// 第 6 行
// 第 7 行 - 按范围 "7-8" 标记
// 第 8 行 - 按范围 "7-8" 标记
```

#### 选择行标记类型（mark 高亮 / ins 新增 / del 删除）

```js title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
  console.log('这行被标记为删除')
  // 这一行和下一行被标记为新增
  console.log('这是第二个新增行')

  return '这行使用默认的中性标记类型'
}
```

#### 给行标记添加标签

```jsx {"1":5} del={"2":7-8} ins={"3":10-12}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}
  value={value}
  className={buttonClassName}
  disabled={disabled}
  active={active}
>
  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
```

#### 添加独占一行的长标签

```jsx {"1. 在这里提供 value 属性:":5-6} del={"2. 移除 disabled 和 active 状态:":8-10} ins={"3. 添加以下代码在按钮内渲染 children:":12-15}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}

  value={value}
  className={buttonClassName}

  disabled={disabled}
  active={active}
>

  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
```

#### 使用 diff 风格语法

```diff
+这行会被标记为新增
-这行会被标记为删除
这是一行普通内容
```

---

```diff
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
+this is an actual diff file
-all contents will remain unmodified
 no whitespace will be removed either
```

#### 语法高亮与 diff 语法结合使用

```diff lang="js"
  function thisIsJavaScript() {
    // 整个代码块都会按 JavaScript 高亮，
    // 而且我们仍然可以添加 diff 标记！
-   console.log('要移除的旧代码')
+   console.log('崭新的代码！')
  }
```

#### 标记行内的部分文字

```js "given text"
function demo() {
  // 标记行内任意指定的文字
  return 'Multiple matches of the given text are supported';
}
```

#### 正则表达式

```ts /ye[sp]/
console.log('单词 yes 和 yep 会被标记。')
```

#### 转义正斜杠

```sh /\/ho.*\//
echo "Test" > /home/test.txt
```

#### 选择行内标记类型（mark 高亮 / ins 新增 / del 删除）

```js "return true;" ins="inserted" del="deleted"
function demo() {
  console.log('这些是 inserted 和 deleted 标记类型');
  // return 语句使用默认标记类型
  return true;
}
```

### 自动换行

[自动换行](https://expressive-code.com/key-features/word-wrap/)

#### 按代码块配置换行

```js wrap
// 开启换行的示例
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

---

```js wrap=false
// wrap=false 的示例
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

#### 配置换行的缩进

```js wrap preserveIndent
// preserveIndent 示例（默认开启）
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

---

```js wrap preserveIndent=false
// preserveIndent=false 的示例
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

## 可折叠区域

[可折叠区域](https://expressive-code.com/plugins/collapsible-sections/)

```js collapse={1-5, 12-14, 21-24}
// 所有这些样板初始化代码都会被折叠
import { someBoilerplateEngine } from '@example/some-boilerplate'
import { evenMoreBoilerplate } from '@example/even-more-boilerplate'

const engine = someBoilerplateEngine(evenMoreBoilerplate())

// 这部分代码默认可见
engine.doSomething(1, 2, 3, calcFn)

function calcFn() {
  // 可以有多个折叠区域
  const a = 1
  const b = 2
  const c = a + b

  // 这行保持可见
  console.log(`Calculation result: ${a} + ${b} = ${c}`)
  return c
}

// 从这里到代码块末尾的内容又会被折叠
engine.closeConnection()
engine.freeMemory()
engine.shutdown({ reason: 'End of example boilerplate code' })
```

## 行号

[行号](https://expressive-code.com/plugins/line-numbers/)

### 按代码块显示行号

```js showLineNumbers
// 这个代码块会显示行号
console.log('来自第 2 行的问候！')
console.log('我在第 3 行')
```

---

```js showLineNumbers=false
// 这个代码块禁用了行号
console.log('Hello?')
console.log('抱歉，你知道我在第几行吗？')
```

### 修改起始行号

```js showLineNumbers startLineNumber=5
console.log('来自第 5 行的问候！')
console.log('我在第 6 行')
```
