---
name: coord-status
description: >
  查看联调测试状态 - 用于前后端分离项目的联调测试工作流。

  触发关键词：查看状态、联调状态、coord-status、coord status、状态检查

  功能：
  - 查看服务就绪状态（backend/frontend/testing）
  - 查看 API 判断规则配置
  - 查看前置条件是否满足
  - 查看待处理的 feedback 问题

  配合使用：coord-start（初始化项目）、coord-poll（轮询反馈）
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - status
---

# /coord-status - 查看联调状态

## 输出示例

```
=== REQ-001 联调状态 ===

服务就绪:
✅ backend: http://localhost:8080 (ready)
✅ frontend: http://localhost:5173 (ready)
🔄 testing: running

API 判断规则:
✅ 成功 code: 0
✅ 失败 codes: [30001, 30002, 40001]
✅ data 字段: data

前置条件:
✅ backend/api-spec.md 已就绪
✅ frontend/pages.md 已就绪

待处理反馈 (后端):
  - #1 [high] /api/users 缺少 avatar_url (open)
  - #3 [medium] POST /api/login 返回500 (acknowledged)

待处理反馈 (前端):
  - #2 [high] 登录页样式错位 (open)
  - 等待 #3 解决后才能处理

测试进度:
  通过: 15 | 失败: 2 | 待测: 8
  覆盖率: 65%
```

## 查看内容

1. **服务状态** - backend/frontend/testing 的 status
2. **API 判断规则** - api_success_code、response_data_field 等
3. **前置条件** - api-spec.md 和 pages.md 是否存在
4. **待处理反馈** - 按 assignee 分组显示 open 问题

## 相关命令

- `/coord-start` - 初始化项目
- `/coord-poll` - 轮询分配给自己的反馈
- `/coord-test-start` - 启动测试（测试角色）