---
name: coord-done
description: >
  完成联调测试 - 用于前后端分离项目的联调测试工作流。

  触发关键词：完成联调、测试完成、coord-done、done、联调结束

  功能：
  - 检查所有问题是否已关闭
  - 生成最终测试报告
  - 更新 service-info.json 中 testing.status = completed

  适用角色：测试
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - done
---

# /coord-done - 生成最终报告，完成联调

## 执行条件

必须同时满足：
1. 所有测试通过
2. 所有 feedback 问题已关闭（status = closed）

## 条件检查

```
❌ [coord-done] 仍有 3 条问题未关闭

待处理问题：
  - #1 [high] POST /api/login 返回500 (open)
  - #2 [medium] 登录页样式错位 (in_progress)
  - #3 [high] /api/users 缺少 avatar_url (resolved)

请先关闭所有问题后再运行 /coord-done
```

## 执行流程

1. 读取 `feedback.md`，确认所有问题都已 closed
2. 生成最终报告到 `testing/reports/final-report.md`
3. 更新 `service-info.json` → `testing.status = completed`

## 最终报告内容

```markdown
# 测试最终报告 - {需求编号}

## 测试结果
- 总测试用例: N
- 通过: N
- 失败: N
- 覆盖率: XX%

## 测试详情
（列出所有测试用例及其结果）

## 发现的 Bug 及解决方案
（从 closed.md 读取）

## 结论
所有测试通过，联调完成。
```

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-test-start` - 启动测试
- `/coord-resolve` - 关闭已验证的问题