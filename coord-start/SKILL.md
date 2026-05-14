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

## ⚠️ 必须执行 TUI 脚本

当调用此 skill 时，**必须**使用 PTY 模式执行交互式脚本：

```
exec(command="cd /home/czy/workspace/ai/skills/fullstack-test/coord-start && node start.js", pty=true, timeout=120)
```

**重要**：
- 必须设置 `pty=true` 以启用伪终端
- 必须设置足够的 `timeout`（至少 120 秒）
- **禁止**使用文字引导或逐个问题询问
- **禁止**跳过交互直接创建文件

脚本使用 inquirer 实现 TUI 交互（上下箭头选择、回车确认）。

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-poll` - 轮询反馈
- `/coord-backend-config` - 后端配置