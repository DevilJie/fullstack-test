---
name: coord-start
description: >
  初始化联调测试项目 - 用于前后端分离项目的联调测试工作流。

  触发关键词：初始化项目、开始联调、coord-start、coord start、新建项目
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - init
---

# /coord-start - 初始化联调测试项目

## ⚠️ 必须使用交互式 TUI

当调用此 skill 时，**必须**使用 PTY 模式执行交互式脚本。

执行方式：

```bash
cd /home/czy/workspace/ai/skills/fullstack-test/coord-start && node start.js
```

**禁止**：
- ❌ 使用文字引导逐个询问
- ❌ 直接创建文件而不执行脚本

## TUI 交互流程

脚本会自动通过上下箭头和回车选择来引导用户完成：

1. **工作目录选择** - 使用当前目录 或 自行输入
2. **需求编号** - 输入需求编号
3. **配置策略** - 沿用已有配置 或 创建独立配置
4. **角色选择** - 后端/前端/测试
5. **服务配置** - 根据角色询问 URL 和 API 规则
6. **确认创建** - Y/N 确认

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-poll` - 轮询反馈
- `/coord-backend-config` - 后端配置