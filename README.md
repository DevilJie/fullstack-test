# Fullstack Test - 全流程测试协调

[![GitHub](https://img.shields.io/badge/GitHub-DevilJie/fullstack-test-blue)](https://github.com/DevilJie/fullstack-test)
[![Claude Code Compatible](https://img.shields.io/badge/Claude%20Code-Compatible-green)](https://claude.ai)
[![Platform](https://img.shields.io/badge/Platform-Cross--Platform-yellow)]

> **English** | [中文](#中文)

---

## English

### What is Fullstack Test?

Fullstack Test is a **full-chain testing coordination skill** for frontend-backend separated projects. It coordinates integration testing workflows between three roles: Backend Developer, Frontend Developer, and Tester.

### Core Philosophy

> **"Thinking time is more valuable than coding time"**
> Think before you code.

### Features

- **Seven Independent Commands**: Each command is a standalone skill
  - `/coord-start` - Initialize project + register role
  - `/coord-status` - View integration status
  - `/coord-poll` - Poll feedback assigned to you
  - `/coord-test-start` - Start automated testing
  - `/coord-resolve` - Mark issue resolved → move to closed.md
  - `/coord-done` - Generate final report, complete integration
  - `/coord-backend-config` - View / modify backend service config
- **Feedback Chain**: Issues flow from Testing → Frontend → Backend with proper traceability
- **Closed Issue Archive**: Verified issues are moved to `closed.md` to keep `feedback.md` lean
- **API Success Rule Enforcement**: Testing is blocked until backend provides API response parsing rules
- **Playwright Integration**: Automated browser testing with built-in support

### Project Structure

```
fullstack-test/                           # Main skill (coordinator)
├── SKILL.md                              # Main coordination manual
├── README.md                             # This file
├── install.sh                            # One-click install script
├── coord-start/                          # Sub-skill: Initialize project
│   └── SKILL.md
├── coord-status/                         # Sub-skill: View status
│   └── SKILL.md
├── coord-poll/                           # Sub-skill: Poll feedback
│   └── SKILL.md
├── coord-test-start/                     # Sub-skill: Start testing
│   └── SKILL.md
├── coord-resolve/                        # Sub-skill: Resolve issues
│   └── SKILL.md
├── coord-done/                           # Sub-skill: Complete integration
│   └── SKILL.md
├── coord-backend-config/                 # Sub-skill: Backend config
│   └── SKILL.md
└── references/                           # Shared reference documents
    ├── project-structure.md
    ├── feedback-format.md
    └── api-rules.md
```

### One-Click Installation

```bash
# Clone from GitHub
git clone https://github.com/DevilJie/fullstack-test.git ~/.local/share/fullstack-test

# Install all skills (main + 7 sub-skills)
bash ~/.local/share/fullstack-test/install.sh all

# Or install for Claude Code only (sub-skills will be installed)
bash ~/.local/share/fullstack-test/install.sh claude

# Or install for OpenClaw only
bash ~/.local/share/fullstack-test/install.sh openclaw
```

After installation, Claude Code will show all 7 commands when you type `/`.

### Quick Start

#### 1. Initialize Project

```bash
/coord-start
```

#### 2. Backend Configures API Rules

```bash
/coord-backend-config set url http://localhost:8080
/coord-backend-config set api_success_code 0
/coord-backend-config set response_data_field data
/coord-backend-config set response_code_field code
```

#### 3. Start Testing

```bash
/coord-test-start
```

#### 4. Resolve Issues

```bash
/coord-resolve 1 已修复空指针异常
```

#### 5. Complete Integration

```bash
/coord-done
```

---

## 中文

### 什么是 Fullstack Test？

Fullstack Test 是一款**全流程测试协调 Skill**，用于前后端分离项目的联调测试工作流。它协调三个角色之间的测试工作：后端开发、前端开发、测试。

### 核心理念

> **"Thinking time is more valuable than coding time"**
> 想清楚比写代码更重要。

### 功能特性

- **7 个独立命令**：每个命令都是独立的 skill
  - `/coord-start` - 初始化项目 + 注册角色
  - `/coord-status` - 查看联调状态
  - `/coord-poll` - 轮询分配给自己的反馈
  - `/coord-test-start` - 启动自动化测试
  - `/coord-resolve` - 标记问题已解决，移入 closed.md
  - `/coord-done` - 生成最终报告，完成联调
  - `/coord-backend-config` - 查看/修改后端服务配置
- **Feedback 链式流转**：问题从测试 → 前端 → 后端，全程可追溯
- **已关闭问题归档**：验证通过的问题移入 `closed.md`，保持 `feedback.md` 精简
- **API 成功规则强制校验**：后端未配置 API 解析规则时，测试被阻断
- **Playwright 集成**：内置浏览器自动化测试支持

### 项目目录结构

```
fullstack-test/                           # 主 skill（总协调）
├── SKILL.md                              # 总协调手册
├── README.md                             # 本文件
├── install.sh                            # 一键安装脚本
├── coord-start/                          # 子 skill：初始化项目
│   └── SKILL.md
├── coord-status/                         # 子 skill：查看状态
│   └── SKILL.md
├── coord-poll/                           # 子 skill：轮询反馈
│   └── SKILL.md
├── coord-test-start/                     # 子 skill：启动测试
│   └── SKILL.md
├── coord-resolve/                        # 子 skill：解决问题
│   └── SKILL.md
├── coord-done/                           # 子 skill：完成联调
│   └── SKILL.md
├── coord-backend-config/                 # 子 skill：后端配置
│   └── SKILL.md
└── references/                           # 共享引用文档
    ├── project-structure.md
    ├── feedback-format.md
    └── api-rules.md
```

### 一键安装

```bash
# 从 GitHub 克隆
git clone https://github.com/DevilJie/fullstack-test.git ~/.local/share/fullstack-test

# 安装所有 skills（主 skill + 7 个子 skill）
bash ~/.local/share/fullstack-test/install.sh all

# 或只安装 Claude Code 版（子 skill 都会安装）
bash ~/.local/share/fullstack-test/install.sh claude

# 或只安装 OpenClaw 版
bash ~/.local/share/fullstack-test/install.sh openclaw
```

安装后在 Claude Code 中输入 `/` 即可看到全部 7 个独立命令。

### 快速开始

#### 1. 初始化项目

```bash
/coord-start
```

#### 2. 后端配置 API 规则

```bash
/coord-backend-config set url http://localhost:8080
/coord-backend-config set api_success_code 0
/coord-backend-config set response_data_field data
/coord-backend-config set response_code_field code
```

#### 3. 启动测试

```bash
/coord-test-start
```

#### 4. 关闭问题

```bash
/coord-resolve 1 已修复空指针异常
```

#### 5. 完成联调

```bash
/coord-done
```

### Feedback 状态流转

```
open → acknowledged → in_progress → resolved → closed
                   ↑                        ↓
                   └── 对方已修复，等待测试验证 ┘
```

---

## License

MIT