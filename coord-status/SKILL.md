---
name: coord-status
description: >
  查看联调状态 - 用于前后端分离项目的联调测试工作流。

  触发关键词：查看状态、联调状态、coord-status、coord status、状态检查

  ⚠️ 重要：执行任务前必须先加载角色规范
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - status
---

# /coord-status

## ⚠️ 重要：执行前必须先加载角色规范

**角色规范文件：**
- 后端开发 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/backend.md`
- 前端开发 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/frontend.md`
- 测试 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/testing.md`

在查看状态之前，可以选择性阅读相关角色的规范文件。

### 步骤 1：选择要查看的角色

```
👤 请选择要查看哪个角色的状态：

1️⃣  🔧 后端开发 (backend)
2️⃣  🎨 前端开发 (frontend)
3️⃣  🧪 测试 (testing)
4️⃣  📊 查看全部状态

输入数字或角色名称：
```

### 步骤 2：读取 service-info.json

根据选择的角色，读取对应的配置和状态：

**读取 service-info.json 的内容**

### 步骤 3：显示状态

根据角色显示对应的状态信息：

#### 后端状态
```
🔧 后端服务状态

📍 URL: {backend.url}
🏥 健康检查: {backend.health_url}
📚 API文档: {backend.api_doc_url || "未设置"}
🔧 API规则: code={api_success_code}, data={response_data_field}
⏱️ 超时: {timeout_ms}ms
📊 状态: {status}

✅ 如果状态是 ready，表示后端已就绪
⚠️ 如果状态是 pending，表示还在开发中
❌ 如果状态是 error，表示有问题需要解决
```

#### 前端状态
```
🎨 前端服务状态

📍 URL: {frontend.url}
📊 状态: {status}

✅ 如果状态是 ready，表示前端已就绪
⚠️ 如果状态是 pending，表示还在开发中
❌ 如果状态是 error，表示有问题需要解决
```

#### 测试状态
```
🧪 测试状态

📊 状态: {status}

✅ 如果状态是 ready，表示测试已就绪
⚠️ 如果状态是 pending，表示还在准备中
❌ 如果状态是 error，表示有问题需要解决
```

### 步骤 4：检查相关文档

检查需求目录中是否存在相关文档：
```bash
# feedback.md
ls {工作目录}/{需求编号}/feedback.md 2>/dev/null

# closed.md
ls {工作目录}/{需求编号}/closed.md 2>/dev/null

# test-cases.md
ls {工作目录}/{需求编号}/testing/test-cases.md 2>/dev/null
```

显示文档存在情况：
```
📄 文档状态：

feedback.md: {存在/不存在}
closed.md: {存在/不存在}
test-cases.md: {存在/不存在}
```

### 步骤 5：给出建议

根据当前状态给出下一步建议：
```
💡 建议：

{根据各角色状态给出具体建议}

例如：
• 后端状态 pending → 建议运行 /coord-backend-config 完成配置
• 所有状态 ready → 可以开始 /coord-test-start 启动测试
```