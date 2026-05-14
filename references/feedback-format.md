# Feedback 格式说明

## feedback.md 格式

```markdown
# Feedback Log - {需求编号}

## Items

| # | assignee | from | priority | status | title |
|---|----------|------|----------|--------|-------|

### #{编号} - {标题}
**assignee**: backend / frontend
**from**: testing / frontend / backend
**priority**: high / medium / low
**status**: open / acknowledged / in_progress / resolved
**title**: {简短描述}
**description**: {详细说明}
**related**: #{关联编号} (可选)
**needed**: {阻塞时需要的支持} (可选)
**created_at**: {时间戳}
**resolved_at**: {时间戳}
**resolution**: {解决方案}
```

## closed.md 格式

```markdown
# Closed Issues - {需求编号}

## Items

| # | assignee | from | priority | resolved_at | title |
|---|----------|------|----------|-------------|-------|

### #{编号} - {标题}
**assignee**: backend / frontend
**from**: testing / frontend / backend
**priority**: high / medium / low
**title**: {简短描述}
**description**: {详细说明}
**related**: #{关联编号} (可选)
**created_at**: {时间戳}
**resolved_at**: {时间戳}
**resolution**: {解决方案}
```

## 状态流转

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