---
name: coord-poll
description: >
  轮询反馈问题 - 用于前后端分离项目的联调测试工作流。

  触发关键词：轮询反馈、poll、coord-poll、coord poll、查看我的问题

  ⚠️ 重要：执行任务前必须加载角色规范
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - poll
---

# /coord-poll

## ⚠️ 重要：执行前必须加载角色规范

**角色规范文件：**
- 后端开发 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/backend.md`
- 前端开发 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/frontend.md`
- 测试 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/testing.md`

**在查看反馈之前，必须先阅读你的角色规范文件。**

**核心要点（来自规范文件）：**

Backend Architect: API < 200ms, 安全优先, 可用性 > 99.9%
Frontend Developer: Lighthouse > 90, WCAG 2.1 AA, 移动端优先
API Tester: 覆盖率 > 95%, OWASP 安全测试, 性能 SLA

**确认理解后，继续执行。**

### 步骤 1：确定你的角色

```
👤 请确认你的角色：

1️⃣  🔧 后端开发 (backend)
2️⃣  🎨 前端开发 (frontend)
3️⃣  🧪 测试 (testing)

输入数字或直接回车确认：
```

### 步骤 2：读取 feedback.md

读取当前需求目录下的 feedback.md：
```bash
cat {工作目录}/{需求编号}/feedback.md
```

### 步骤 3：显示分配给你的问题

```
📋 分配给你的反馈问题：

{列出所有分配给当前角色的问题}

每个问题包含：
- ID
- 描述
- 创建时间
- 当前状态 (open/acknowledged/in_progress/resolved)
```

### 步骤 4：处理问题建议

根据角色规范，给出处理问题的建议：

**如果是后端问题：**
```
💡 后端处理建议：
• 检查 API 响应时间是否 < 200ms
• 验证安全措施是否到位
• 确认数据库查询性能
• 确保错误处理正确
```

**如果是前端问题：**
```
💡 前端处理建议：
• 检查 Core Web Vitals 指标
• 验证可访问性合规
• 测试跨浏览器兼容性
• 确保响应式设计正常
```

**如果是测试相关：**
```
💡 测试处理建议：
• 验证测试覆盖率
• 检查安全测试是否完整
• 确认性能测试结果
• 评估是否需要补充测试
```

### 步骤 5：给出下一步行动建议

```
📋 下一步行动：

1️⃣  查看详细问题: 阅读 feedback.md
2️⃣  认领问题: 手动将问题状态改为 in_progress
3️⃣  解决问题: /coord-resolve
4️⃣  完成联调: /coord-done
```