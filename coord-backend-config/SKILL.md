---
name: coord-backend-config
description: >
  后端服务配置管理 - 用于前后端分离项目的联调测试工作流。

  触发关键词：后端配置、服务配置、coord-backend-config、backend config、API规则

  ⚠️ 重要：执行任务前必须先加载后端开发规范
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - backend
  - config
---

# /coord-backend-config

## ⚠️ 重要：执行前必须加载角色规范

**Backend Architect 规范文件：**
```
/home/czy/workspace/ai/skills/fullstack-test/templates/roles/backend.md
```

**在开始配置之前，必须先阅读规范文件。**

**核心要点（来自规范文件）：**
- 🔑 安全优先：数据加密、认证授权、防御深度
- ⚡ 性能设计：水平扩展、数据库索引、缓存策略
- 📊 API 响应时间目标 < 200ms (95百分位)
- 🛡️ 安全审计零高危漏洞

**确认理解后，继续执行配置。**

### 步骤 1：检查工作目录

检查 `{工作目录}/service-info.json` 是否存在：
- **存在** → 读取现有配置，显示给用户确认
- **不存在** → 提示先运行 `/coord-start` 初始化

### 步骤 2：检查后端配置

检查 `service-info.json` 中是否已有 `backend` 配置：
- **有配置且 URL 非默认** → 询问是否使用现有配置
  ```
  📋 检测到已有后端配置：
     URL: {backend.url}
     健康检查: {backend.health_url}
     API文档: {backend.api_doc_url}

  是否使用上述配置？
  - 是（使用现有配置）
  - 否（重新配置）
  ```
- **无配置或使用默认端口** → 直接进入配置流程

### 步骤 3：配置后端服务

需要配置的字段：
```
🔧 后端服务配置：

1️⃣  URL（必填）：
   当前: {url}
   输入新值或回车使用当前值：

2️⃣  健康检查 URL：
   当前: {health_url}
   输入新值或回车使用当前值：

3️⃣  API 文档 URL（可选）：
   当前: {api_doc_url}
   输入新值或回车跳过：

4️⃣  成功 code 值：
   当前: {api_success_code}
   输入新值或回车使用当前值：

5️⃣  数据字段名：
   当前: {response_data_field}
   输入新值或回车使用 "data"：

6️⃣  状态码字段名：
   当前: {response_code_field}
   输入新值或回车使用 "code"：

7️⃣  超时毫秒：
   当前: {timeout_ms}
   输入新值或回车使用 5000：
```

### 步骤 4：保存配置

将配置写入 `service-info.json`：
```bash
# 更新 backend 配置
# 保留其他角色（frontend, testing）的配置不变
```

### 步骤 5：标记状态

询问用户是否将 `backend.status` 设为 `ready`：
```
✅ 是否将后端状态标记为 ready？

这样其他角色就知道后端服务已经可以使用了。
- 是（标记为 ready）
- 否（保持 pending）
```

### 步骤 6：确认完成

```
✅ 后端配置完成！

📄 配置已保存到: {service-info.json 路径}
🔗 后端 URL: {url}
📚 API 文档: {api_doc_url || "未设置"}
🔧 成功判断: code={api_success_code}, data={response_data_field}
状态: {status}

下一步：
1️⃣  前端配置: /coord-frontend-config
2️⃣  查看状态: /coord-status
3️⃣  开始开发: 在项目目录使用 superpowers 工作流
```