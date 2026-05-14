---
name: coord-resolve
description: >
  标记反馈问题已解决 - 用于前后端分离项目的联调测试工作流。

  触发关键词：解决问题、已修复、coord-resolve、resolve、关闭问题

  功能：
  - 标记 feedback 问题为 resolved
  - 验证修复后关闭问题，移入 closed.md
  - 从 feedback.md 中移除已关闭问题

  适用角色：后端开发、前端开发（修复问题后）、测试（验证后关闭）
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - resolve
---

# /coord-resolve - 标记问题已解决

## 使用方式

```
/coord-resolve <编号> [解决方案]

示例:
/coord-resolve 1 已修复空指针异常
/coord-resolve 3
```

## 触发条件

以下条件**同时满足**时才能执行 /coord-resolve：
1. 问题的 `status` 当前为 `resolved`（对方已修复，等待验证）
2. 测试 agent 已验证该修复有效

## 执行流程

1. 读取 `feedback.md` 中指定编号的问题
2. 确认 `status` 为 `resolved`（表示对方已处理，等待测试验证）
3. 确认测试已验证修复有效
4. 在 `feedback.md` 中将 `status` 改为 `closed`
5. 将该问题追加写入 `closed.md`（保留完整记录：created_at、resolved_at、resolution）
6. 从 `feedback.md` 中删除该条目（已归档到 closed.md）

## Feedback 状态机

```
open → acknowledged → in_progress → resolved → closed
                   ↑                        ↓
                   └── 对方已修复，待测试验证 ┘
```

## 链式流转示例

```
测试发现 Bug → 提交给前端 (#1，status: open)
     ↓
前端定位到根因在后端 → 新建 #2 (assignee: backend，status: open)
     ↓
前端暂时搁置 #1，等待 #2 解决
     ↓
后端处理 #2 → /coord-resolve 2 → status: resolved（等待测试验证）
     ↓
测试验证 #2 有效 → /coord-resolve 2 → status: closed，移入 closed.md
     ↓
前端处理 #1 → /coord-resolve 1 → status: resolved
     ↓
测试验证 #1 有效 → /coord-resolve 1 → status: closed，移入 closed.md
```

## 错误处理

如果状态不对：
```
[coord-resolve] 问题 #3 状态为 open
只有状态为 resolved 的问题才能执行 /coord-resolve
（即对方已修复，等待测试验证后才能关闭）
```

## 相关命令

- `/coord-poll` - 查看分配给我的问题
- `/coord-status` - 查看完整联调状态
- `/coord-done` - 完成所有测试后生成最终报告