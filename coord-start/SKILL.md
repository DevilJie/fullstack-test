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

## 交互式引导流程

按步骤逐一询问用户，每个问题等待用户回复后再进行下一步。

---

### 步骤 1：询问工作目录

```
📁 请输入工作目录路径：

说明：工作目录是所有测试工作的工作目录，会在此生成测试产物
（报告、日志等），与实际的项目目录（如 /home/user/lumina）区分开来。

输入示例：/home/user/workspace
直接回车使用当前目录：/home/czy/workspace/ai/hsj/lumina
```

**等待用户输入路径后，继续下一步**

---

### 步骤 2：询问需求编号

```
🏷️ 请输入需求编号：

格式示例：REQ-001, 26RM-001, PRD-2024-Q1-001
直接回车使用默认：REQ-001
```

**等待用户输入后，继续下一步**

---

### 步骤 3：检查配置策略

检查 `{工作目录}/service-info.json` 是否存在：

**如果已存在**，显示并询问：
```
📋 检测到已有服务配置

位置：{工作目录}/service-info.json
后端 URL：{url}
前端 URL：{url}

🔧 请选择需求的服务配置策略：

1️⃣  沿用已有配置（推荐） - 所有需求共用同一份配置
2️⃣  创建独立配置 - 本需求使用单独的 service-info.json

请输入数字（1 或 2）：
```

**如果不存在**，继续下一步

---

### 步骤 4：选择角色

```
👤 请选择你的角色：

1️⃣  🔧 后端开发 (backend) - 配置 API 规则，提供接口文档
2️⃣  🎨 前端开发 (frontend) - 对接后端 API，实现页面功能
3️⃣  🧪 测试 (testing) - 执行自动化测试，验证前后端集成

请输入数字（1、2 或 3）：
```

**等待用户选择后，根据角色继续**

---

### 步骤 5：根据角色配置

#### 后端开发
```
🔗 请输入后端服务 URL：
直接回车使用默认：http://localhost:8080

请输入 URL：
```

**等待用户输入后，继续：**
```
🔧 API 成功判断规则配置：

请逐项回答：
- 成功响应的 code 值（默认：0）：
- 数据字段名（默认：data）：
- 状态码字段名（默认：code）：
```

#### 前端开发
```
🔗 请输入前端服务 URL：
直接回车使用默认：http://localhost:5173

请输入 URL：
```

#### 测试
```
🧪 测试角色说明：
- 测试会话需要等待 backend/api-spec.md 和 frontend/pages.md 就绪
- 准备好后运行 /coord-test-start 启动测试

请按回车继续：
```

---

### 步骤 6：创建项目

根据用户输入，创建目录和文件：

```bash
# 创建目录结构
mkdir -p {工作目录}/{需求编号}/{backend,frontend,testing/reports}

# 创建 service-info.json
# （根据配置策略选择放在项目级或需求级）

# 创建 README.md
cat > {工作目录}/{需求编号}/README.md << 'EOF'
# {需求编号} 联调测试协调手册

## 项目信息
- 工作目录: {工作目录}
- 需求编号: {需求编号}
- 服务配置: {配置路径}

## 命令
- /coord-status - 查看状态
- /coord-poll - 轮询反馈
- /coord-test-start - 启动测试
- /coord-resolve - 关闭问题
- /coord-done - 完成联调
- /coord-backend-config - 后端配置
EOF

# 创建 feedback.md
cat > {工作目录}/{需求编号}/feedback.md << 'EOF'
# Feedback Log - {需求编号}

## Items

EOF
```

---

### 步骤 7：确认完成

```
✅ 初始化完成！

📁 工作目录：{工作目录}
📋 需求目录：{工作目录}/{需求编号}
📄 服务配置：{配置路径}
👤 角色：{角色}
🔗 服务 URL：{url}

下一步：
1️⃣  后端配置 API 规则：/coord-backend-config
2️⃣  查看状态：/coord-status
3️⃣  开始开发/测试工作
```

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-poll` - 轮询反馈
- `/coord-backend-config` - 后端配置