---
name: coord-resolve
description: >
  标记反馈问题已解决 - 用于前后端分离项目的联调测试工作流。

  触发关键词：解决问题、已修复、coord-resolve、resolve、关闭问题

  ⚠️ 重要：执行任务前必须先加载角色规范
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - resolve
---

# /coord-resolve

## ⚠️ 重要：执行前必须加载角色规范

**角色规范文件：**
- 后端问题 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/backend.md`
- 前端问题 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/frontend.md`
- 测试问题 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/testing.md`

**解决问题之前，必须先阅读相关角色的规范文件。**

**核心要点提醒：**

Backend Architect:
- 🔑 安全优先：数据加密、认证授权、防御深度
- ⚡ 性能设计：水平扩展、数据库索引
- 📊 API 响应时间 < 200ms

Frontend Developer:
- ⚡ 性能优先：Core Web Vitals 优化
- ♿ 可访问性：WCAG 2.1 AA 合规
- 📊 Lighthouse 分数 > 90

API Tester:
- 🔒 安全测试优先：OWASP Top 10
- 📊 覆盖率 > 95%
- ⚡ 性能 SLA 验证

**确认理解后，继续执行。**

### 步骤 1：读取 feedback.md

读取当前需求目录下的 feedback.md：
```bash
cat {工作目录}/{需求编号}/feedback.md
```

### 步骤 2：显示待解决的问题

```
📋 当前待解决的问题：

{列出所有 open 或 in_progress 状态下的问题}

每个问题包含：
- ID
- 描述
- 创建时间
- 当前状态 (open/in_progress)
- 涉及的角色（backend/frontend）
```

### 步骤 3：选择要解决的问题

```
🔧 请选择要标记为已解决的问题：

输入问题 ID，或输入 "all" 标记全部解决：
```

### 步骤 4：确认解决方案

对于每个要解决的问题，询问：
```
✅ 确认问题已解决：

问题 ID: {id}
描述: {description}

解决方案简述：
{让用户简要说明如何解决的}

是否确认解决？
- 是（标记为 resolved）
- 否（取消）
```

### 步骤 5：更新 feedback.md

将问题的状态从 `in_progress` 改为 `resolved`，并记录解决时间和解决方案：
```bash
# 更新 feedback.md 中的问题状态为 resolved
# 记录：解决时间、解决方案、谁解决的
```

### 步骤 6：提醒测试复测

```
⚠️  重要：开发标记问题为 resolved 后，需要测试进行复测验证。

测试复测验证通过后，请运行：
/coord-test-start

测试将验证问题是否真正修复，验证通过后会移动到 closed.md 归档。
```

### 步骤 7：确认完成

```
✅ 问题已标记为解决！

📋 已解决的问题：
{列出刚解决的问题的状态变为 resolved}

📄 feedback.md 已更新

⚠️  下一步需要测试进行复测验证：
1️⃣  测试执行复测: /coord-test-start
2️⃣  复测通过后问题会移动到 closed.md
3️⃣  继续处理其他问题: /coord-resolve
```