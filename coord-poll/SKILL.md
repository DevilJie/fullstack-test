---
name: coord-poll
description: >
  轮询反馈问题 - 用于前后端分离项目的联调测试工作流。

  触发关键词：轮询反馈、poll、coord-poll、coord poll、查看我的问题

  功能：
  - 读取 feedback.md
  - 筛选分配给自己的未关闭问题
  - 显示待处理问题列表

  适用角色：后端开发、前端开发

  建议时机：完成开发后、等待响应时、开始新任务前
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - poll
---

# /coord-poll - 轮询反馈问题

## 行为

1. 读取 `feedback.md`
2. 筛选 `assignee: 当前会话角色` 的未关闭问题
3. 显示待处理问题列表
4. 如果有新增/更新的反馈，提示用户处理

## 触发条件

建议在以下时机运行:
- 完成一个功能开发后
- 等待对方响应时
- 开始新任务前

## 输出示例

```
=== 你的待处理反馈 ===

后端问题:
  - #3 [high] POST /api/login 返回500 (open)
  - #5 [medium] GET /api/orders 缺少 pagination (acknowledged)

前端问题:
  - #2 [high] 登录页样式错位 (in_progress)
  - #4 [low] 按钮点击无响应 (open)

如需查看完整反馈，请运行 /coord-status
```

## 相关命令

- `/coord-status` - 查看完整联调状态
- `/coord-resolve` - 标记问题已解决
- `/coord-test-start` - 启动测试（测试角色）