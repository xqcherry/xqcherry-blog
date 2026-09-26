---
title: "vscode-fast-cpp：让 VS Code 更快开始 C/C++ 编译与调试"
published: 2025-10-01
description: "一个面向 Windows 的 VS Code C/C++ 扩展，自动准备 MinGW 工具链，并提供一键编译与 GDB 断点调试能力。"
status: archived
tags:
  - VS Code
  - C/C++
  - MinGW
  - GDB
link:
  - label: "GitHub"
    icon: "fa6-brands:github"
    value: "https://github.com/xqcherry/vscode-fast-cpp"
---

## 项目概览

这是我接触开发后完成的第一个项目，目标是做一个面向 Windows 的 VS Code C/C++ 扩展，让刚开始写 C/C++ 的用户可以少做一些环境配置，直接完成编译、运行和调试。

项目目前已停止维护，仓库代码仍然保留在 GitHub 中。

## 解决的问题

在 VS Code 中开始 C/C++ 开发，通常需要先安装和配置 MinGW、`g++`、`gdb`，再分别准备编译任务和调试配置。这个项目把这些常用步骤集中到扩展中：首次激活时检查工具链，随后通过命令完成编译或调试。

## 主要功能

### 自动准备 MinGW 工具链

扩展激活后会检查本地是否存在可用的 `g++` 和 `gdb`。如果没有找到，就自动下载并解压 WinLibs，并将工具路径写入 VS Code 的全局设置：

- `maomao.gpp`：`g++` 的绝对路径
- `maomao.gdb`：`gdb` 的绝对路径

同时，扩展会将 MinGW 的 `bin` 目录注入当前扩展进程的 `PATH`。下载过程支持按顺序尝试代理前缀，以适应网络环境不稳定的情况。

### 一键编译并运行

命令 `maomao.compile` 支持编译当前打开的 `.c` 或 `.cpp` 文件，编译参数固定为：

```text
-g -O0 -Wall -Wl,--disable-dynamicbase
```

编译结果会放在源文件同级的 `output/` 目录中，例如 `main.cpp` 会生成 `output/main.exe`。编译成功后，程序会在名为 `MinGW Run` 的终端中启动。

### 一键启动调试

命令 `maomao.debug` 会先编译当前文件，然后启动内置的 `maomao_cppdbg` 调试器。调试器基于 GDB/MI 协议，支持：

- 断点、继续、暂停和单步执行
- 堆栈查看
- 变量查看
- 中文路径或其他非 ASCII 路径的调试兜底处理
- 通过 `set substitute-path` 修复源码路径映射

### 快捷键与其他入口

扩展同时提供命令面板、编辑器右键菜单和快捷键入口：

| 功能 | 命令 | 默认快捷键 |
| --- | --- | --- |
| 编译当前文件 | `maomao.compile` | `Ctrl+Shift+B` |
| 启动调试 | `maomao.debug` | `Ctrl+F6` |
| 测试命令注册 | `maomao.hello` | `Ctrl+F5` |

## 使用方式

1. 安装扩展，并打开一个包含 `.c` 或 `.cpp` 文件的工作区。
2. 首次激活时等待 MinGW 自动下载和解压完成。
3. 使用命令面板、编辑器右键菜单或快捷键执行编译、运行和调试。

日常使用中，直接执行 `maomao.debug` 就可以自动编译并启动调试，一般不需要手写 `launch.json`。如果需要手动配置，扩展提供的调试器类型是 `maomao_cppdbg`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "C++ Debugger",
      "type": "maomao_cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/a.exe",
      "cwd": "${workspaceFolder}",
      "stopAtEntry": true
    }
  ]
}
```

## 实现结构

项目使用 TypeScript 编写，主要模块职责如下：

- `src/extension.ts`：扩展入口，注册命令和内联调试适配器
- `src/mingw.ts`：MinGW 的下载、解压、自动发现和路径同步
- `src/debug/DebugAdapterC++.ts`：调试会话主类
- `src/debug/gdbController.ts`：GDB 进程管理和 MI 命令收发
- `src/debug/miParser.ts`：解析 GDB/MI 输出
- `src/debug/sourceResolver.ts`：处理源码路径映射
- `src/debug/handlers/`：按请求类型拆分启动、控制、断点、堆栈和变量处理逻辑

## 项目状态

项目目前已停止维护，主要实现面向 Windows + MinGW 场景，定位是帮助 C/C++ 初学者更快完成 VS Code 环境准备。它也是我在刚接触开发阶段，对 VS Code 扩展、进程调用、工具链管理和调试协议的一次完整尝试。
