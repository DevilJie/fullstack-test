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

## ⚠️ 必须执行脚本

当调用此 skill 时，**必须**直接执行脚本，不要文字引导：

```bash
cd /home/czy/workspace/ai/skills/fullstack-test/coord-start && node start.js
```

脚本使用 inquirer 实现 TUI 交互，会自动：
1. 询问工作目录（A. 使用当前 / B. 自行输入）
2. 询问需求编号
3. 检查并询问配置策略
4. 询问角色
5. 根据角色询问服务配置
6. 确认并创建项目

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-poll` - 轮询反馈
- `/coord-backend-config` - 后端配置