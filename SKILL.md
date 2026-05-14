---
name: fullstack-test
description: >
  全流程测试协调 skill - 用于前后端分离项目的联调测试工作流。

  核心理念：
  - "Thinking time is more valuable than coding time" - 想清楚比写代码更重要
  - 三个会话角色：后端开发、前端开发、测试
  - 每个角色在执行工作前必须加载角色规范
  - 通过 feedback.md 登记问题，通过 closed.md 归档已验证问题
  - 支持 feedback 链式流转（测试→前端→后端）
  - 全自动 Playwright 浏览器测试

  角色规范模板位置：
  - templates/roles/backend.md - Backend Architect 规范
  - templates/roles/frontend.md - Frontend Developer 规范
  - templates/roles/testing.md - API Tester 规范

  ⚠️ 重要：每个角色在执行工作之前，必须先阅读并理解对应的角色规范

  首次使用 /coord-start 初始化项目，之后各会话使用对应命令协调工作。

  子命令（独立 skill）：
  - /coord-start - 初始化项目
  - /coord-status - 查看状态
  - /coord-poll - 轮询反馈
  - /coord-test-start - 启动测试
  - /coord-resolve - 关闭问题
  - /coord-done - 生成报告
  - /coord-backend-config - 后端配置
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - playwright
  - workflow
---

# Fullstack Test - 全流程测试协调

## ⚠️ 重要：角色规范加载要求

**每次开始工作之前，必须加载对应角色的规范文档。**

### 如何加载角色规范

当你以某个角色开始工作时，先阅读规范文档：

```
📋 正在加载 {角色} 规范...

请先阅读：
{templates/roles/{角色}.md}

理解规范后再开始工作。
```

### 角色规范概览

| 角色 | 规范文件 | 核心指标 |
|------|----------|----------|
| 🔧 backend | templates/roles/backend.md | API < 200ms, 可用性 > 99.9% |
| 🎨 frontend | templates/roles/frontend.md | Lighthouse > 90, 首屏 < 3s |
| 🧪 testing | templates/roles/testing.md | 覆盖率 > 95%, 安全优先 |

## 概述

本 skill 用于协调前后端分离项目的联调测试工作流。

**三个角色**：
- 后端开发 (`backend`)
- 前端开发 (`frontend`)
- 测试 (`testing`)

**核心协调机制**：
- `feedback.md` — 记录所有未关闭问题（open/acknowledged/in_progress）
- `closed.md` — 记录所有已验证通过的问题（测试完成验证后由 /coord-resolve 写入）

## 命令索引

| 命令 | 角色 | 说明 |
|------|------|------|
| `/coord-start` | 任一 | 初始化项目 + 注册角色 |
| `/coord-status` | 任一 | 查看联调状态 |
| `/coord-poll` | 后端/前端 | 轮询反馈、检测分配给自己的问题 |
| `/coord-test-start` | 测试 | 启动自动化测试 |
| `/coord-resolve` | 后端/前端 | 标记问题已解决，移入 closed.md |
| `/coord-done` | 测试 | 生成最终报告、完成联调 |
| `/coord-backend-config` | 后端 | 查看/修改后端服务配置 |

## 快速开始

### 1. 初始化项目（任一角色首次使用）

```
/coord-start
```

### 2. 后端配置 API 规则

```
/coord-backend-config set api_success_code 0
/coord-backend-config set response_data_field data
/coord-backend-config set response_code_field code
```

### 3. 测试启动自动化测试

```
/coord-test-start
```

### 4. 解决和关闭问题

```
/coord-resolve <编号> [解决方案]
```

### 5. 完成联调

```
/coord-done
```

## 目录结构

项目文件结构：

```
{工作目录}/
├── service-info.json        # ⭐ 项目级（所有需求共享同一份服务配置）
├── {需求编号1}/
│   ├── README.md            # 需求协调手册
│   ├── feedback.md          # 问题追踪（open/acknowledged/in_progress）
│   ├── closed.md            # 已验证通过的问题归档
│   ├── backend/             # 后端工作目录（可选）
│   ├── frontend/            # 前端工作目录（可选）
│   └── testing/
│       ├── test-cases.md    # 测试案例（持续累加）
│       └── reports/         # 测试报告目录
│           └── final/       # 最终报告
└── {需求编号2}/
    └── ...
```

**说明**：
- `service-info.json` 放在工作目录，所有需求共享同一份服务配置
- `feedback.md` 记录未关闭问题（测试发现缺陷→前端/后端认领→修复→复测验证通过→移入 closed.md）
- `closed.md` 归档已验证通过的问题
- `testing/test-cases.md` 用于测试案例，会持续累加

**关键**：`service-info.json` 放在工作目录根目录，所有需求共享同一份服务配置（URL、API规则等）。

## 核心理念

> **"Thinking time is more valuable than coding time"**
> **想清楚比写代码更重要**

在动手之前，先规划、先评审、先想清楚。

## 相关文档

- `references/project-structure.md` - 项目结构说明
- `references/feedback-format.md` - Feedback 格式说明
- `references/api-rules.md` - API 判断规则说明

## 安装说明

如需独立安装子命令（每个子 skill 可独立触发），请运行：

```bash
bash install.sh
```

这会自动创建所有子 skill 的软链接到 `~/.claude/skills/`。