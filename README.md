# Fullstack Test - 全流程测试协调

[![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-Plugin-blue)](https://openclaw.ai)
[![Claude Code Compatible](https://img.shields.io/badge/Claude%20Code-Compatible-green)](https://claude.ai)
[![Platform](https://img.shields.io/badge/Platform-Cross--Platform-yellow)]

> **English** | [中文](#中文)

---

## English

### What is Fullstack Test?

Fullstack Test is a **full-chain testing coordination plugin** for frontend-backend separated projects. It coordinates integration testing workflows between three roles: Backend Developer, Frontend Developer, and Tester.

### Core Philosophy

> **"Thinking time is more valuable than coding time"**
> Think before you code.

### Features

- **Three Roles**: Backend, Frontend, Testing - each with dedicated workflow commands
- **Feedback Chain**: Issues flow from Testing → Frontend → Backend with proper traceability
- **Closed Issue Archive**: Verified issues are moved to `closed.md` to keep `feedback.md` lean
- **API Success Rule Enforcement**: Testing is blocked until backend provides API response parsing rules
- **Playwright Integration**: Automated browser testing with built-in support
- **Cross-Platform**: Works with OpenClaw (native commands) and Claude Code / Codex (tool calls)

### Commands

| Command | Role | Description |
|---------|------|-------------|
| `/coord-start` | Any | Initialize project + register role |
| `/coord-status` | Any | View integration status |
| `/coord-poll` | Backend / Frontend | Poll feedback assigned to you |
| `/coord-test-start` | Testing | Start automated testing |
| `/coord-resolve` | Backend / Frontend | Mark issue resolved → move to closed.md |
| `/coord-done` | Testing | Generate final report, complete integration |
| `/coord-backend-config` | Backend | View / modify backend service config |

### Project Structure

```
{project-root}/{requirement-id}/
├── README.md
├── service-info.json       # Service URLs, API rules, status
├── feedback.md            # Open issues tracking
├── closed.md              # Verified & closed issues archive
├── backend/
│   ├── spec.md
│   ├── plan.md
│   └── api-spec.md        # Required for testing
├── frontend/
│   ├── spec.md
│   ├── plan.md
│   └── pages.md           # Required for testing
└── testing/
    ├── test-plan.md
    ├── session.ts
    └── reports/
        └── final-report.md
```

### One-Click Installation

#### OpenClaw Users

```bash
# 一键安装（推荐，自动检测本地源码）
bash <(curl -sL https://codeup.aliyun.com/668647a62300ebb98e4e54fd/hsj/skills/fullstack-test/raw/install.sh) all

# 或手动克隆后安装
git clone https://codeup.aliyun.com/668647a62300ebb98e4e54fd/hsj/skills/fullstack-test.git ~/.local/share/fullstack-test
bash ~/.local/share/fullstack-test/install.sh
```

#### Claude Code / Codex Users

```bash
# 一键安装
bash <(curl -sL https://codeup.aliyun.com/668647a62300ebb98e4e54fd/hsj/skills/fullstack-test/raw/install.sh) claude

# 或手动克隆后安装
git clone https://codeup.aliyun.com/668647a62300ebb98e4e54fd/hsj/skills/fullstack-test.git ~/.local/share/fullstack-test
bash ~/.local/share/fullstack-test/install.sh claude
```

#### Manual Installation (Any Platform)

```bash
# 1. 克隆仓库
git clone https://<token>@codeup.aliyun.com/668647a62300ebb98e4e54fd/hsj/skills/fullstack-test.git ~/fullstack-test

# 2. 创建软链接（根据需要选择）
mkdir -p ~/.openclaw/skills ~/.claude/skills
ln -sf ~/fullstack-test ~/.openclaw/skills/fullstack-test
ln -sf ~/fullstack-test ~/.claude/skills/fullstack-test

# 3. 重启 OpenClaw gateway（如使用 OpenClaw）
openclaw gateway restart
```

### Uninstall

To remove the installed symlinks (does NOT delete the skill source files):

```bash
# Run the uninstall script
bash install.sh uninstall

# Or use the standalone uninstall script
bash uninstall.sh
```

To also remove the skill source files:

```bash
# Remove symlinks
bash uninstall.sh

# Remove source files
rm -rf /home/czy/workspace/ai/skills/fullstack-test
```

### Quick Start

#### 1. Initialize Project

```bash
/coord-start --project-dir ~/projects/lumina --reqId REQ-001 --role backend
```

#### 2. Backend Configures API Rules

```bash
# View current config
/coord-backend-config

# Set required fields
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
# After backend/frontend fixes an issue
/coord-resolve 1 已修复空指针异常
```

#### 5. Complete Integration

```bash
/coord-done
```

### API Success Rule Enforcement

Testing **will be blocked** if `service-info.json` is missing these fields:

```json
{
  "backend": {
    "api_success_code": 0,
    "response_data_field": "data",
    "response_code_field": "code"
  }
}
```

This ensures the tester can properly validate API responses.

### Feedback Status Flow

```
open → acknowledged → in_progress → resolved → closed
                   ↑                        ↓
                   └── Partner fixed, waiting for test verification ┘
```

---

## 中文

### 什么是 Fullstack Test？

Fullstack Test 是一款**全流程测试协调插件**，用于前后端分离项目的联调测试工作流。它协调三个角色之间的测试工作：后端开发、前端开发、测试。

### 核心理念

> **"Thinking time is more valuable than coding time"**
> 想清楚比写代码更重要。

### 功能特性

- **三角色协作**：后端、前端、测试 - 各自有专属工作流命令
- **Feedback 链式流转**：问题从测试 → 前端 → 后端，全程可追溯
- **已关闭问题归档**：验证通过的问题移入 `closed.md`，保持 `feedback.md` 精简
- **API 成功规则强制校验**：后端未配置 API 解析规则时，测试被阻断
- **Playwright 集成**：内置浏览器自动化测试支持
- **跨平台支持**：兼容 OpenClaw（原生命令）和 Claude Code / Codex（工具调用）

### 命令索引

| 命令 | 角色 | 说明 |
|------|------|------|
| `/coord-start` | 任意 | 初始化项目 + 注册角色 |
| `/coord-status` | 任意 | 查看联调状态 |
| `/coord-poll` | 后端/前端 | 轮询分配给自己的反馈问题 |
| `/coord-test-start` | 测试 | 启动自动化测试 |
| `/coord-resolve` | 后端/前端 | 标记问题已解决，移入 closed.md |
| `/coord-done` | 测试 | 生成最终报告，完成联调 |
| `/coord-backend-config` | 后端 | 查看/修改后端服务配置 |

### 项目目录结构

```
{项目根目录}/{需求编号}/
├── README.md
├── service-info.json       # 服务URL、API规则、状态
├── feedback.md            # 未关闭问题追踪
├── closed.md              # 已验证关闭问题归档
├── backend/
│   ├── spec.md
│   ├── plan.md
│   └── api-spec.md        # 测试必需
├── frontend/
│   ├── spec.md
│   ├── plan.md
│   └── pages.md           # 测试必需
└── testing/
    ├── test-plan.md
    ├── session.ts
    └── reports/
        └── final-report.md
```

### 一键安装脚本

#### OpenClaw 用户

```bash
# 通过 ClawHub 安装
openclaw plugins install /home/czy/workspace/ai/skills/fullstack-test

# 或使用便捷命令
openclaw skill install fullstack-test
```

#### Claude Code / Codex 用户

```bash
# 创建软链接到 Claude Code skills 目录
mkdir -p ~/.claude/skills
ln -sf /home/czy/workspace/ai/skills/fullstack-test ~/.claude/skills/fullstack-test
```

#### 通用安装（任意平台）

```bash
# 克隆或复制 skill 到指定位置
git clone <仓库地址> ~/path/to/fullstack-test

# 为所有平台创建软链接
mkdir -p ~/.openclaw/skills ~/.claude/skills
ln -sf ~/path/to/fullstack-test ~/.openclaw/skills/fullstack-test
ln -sf ~/path/to/fullstack-test ~/.claude/skills/fullstack-test
```

### 快速开始

#### 1. 初始化项目

```bash
/coord-start --project-dir ~/projects/lumina --reqId REQ-001 --role backend
```

#### 2. 后端配置 API 规则

```bash
# 查看当前配置
/coord-backend-config

# 设置必需字段
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
# 后端/前端修复后
/coord-resolve 1 已修复空指针异常
```

#### 5. 完成联调

```bash
/coord-done
```

### API 成功规则强制校验

如果 `service-info.json` 缺少以下字段，**测试将被阻断**：

```json
{
  "backend": {
    "api_success_code": 0,
    "response_data_field": "data",
    "response_code_field": "code"
  }
}
```

这确保测试人员能够正确验证 API 响应。

### Feedback 状态流转

```
open → acknowledged → in_progress → resolved → closed
                   ↑                        ↓
                   └── 对方已修复，等待测试验证 ┘
```

---

## License

MIT