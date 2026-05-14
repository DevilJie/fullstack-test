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

## ⚠️ 重要：交互式引导流程

当此 skill 被调用时，**必须通过文字方式引导用户输入**，不要直接执行脚本。

按以下步骤进行：

### 步骤 1：询问工作目录

```
📁 请输入工作目录路径：

说明：工作目录是所有测试工作的工作目录，会在此生成测试产物
（报告、日志等），与实际的项目目录（如 /home/user/lumina）区分开来。

输入示例：/home/user/workspace
直接回车使用当前目录：/home/czy/workspace/ai/hsj/lumina
```

### 步骤 2：询问需求编号

```
🏷️ 请输入需求编号：

格式示例：REQ-001, 26RM-001, PRD-2024-Q1-001
直接回车使用默认：REQ-001
```

### 步骤 3：检查 service-info.json 是否存在

**重要：在用户选择角色之前，先检查是否有可用的全局配置**

检查 `{工作目录}/service-info.json` 是否存在：

- **文件不存在** → 继续步骤 4，用户选择角色
- **文件存在** → 读取已有配置，显示后让用户选择策略：
  ```
  📋 检测到已有服务配置

  后端 URL: {backend.url}
  前端 URL: {frontend.url}

  🔧 请选择需求的服务配置策略：

  1️⃣  沿用已有配置（推荐） - 所有需求共用同一份配置
  2️⃣  创建独立配置 - 本需求使用单独的 service-info.json

  输入数字：1
  ```

### 步骤 4：询问角色

```
👤 请选择你的角色：

1️⃣  🔧 后端开发 (backend) - 配置 API 规则，提供接口文档
2️⃣  🎨 前端开发 (frontend) - 对接后端 API，实现页面功能
3️⃣  🧪 测试 (testing) - 执行自动化测试，验证前后端集成

输入数字或角色名称：backend
```

### 步骤 5：加载角色规范

**重要：必须先加载角色规范**

根据选择的角色，指向对应的规范文件：

#### 🔧 后端开发 (Backend Architect)
```
📋 Backend Architect 角色规范

规范文件：
/home/czy/workspace/ai/skills/fullstack-test/templates/roles/backend.md
```

#### 🎨 前端开发 (Frontend Developer)
```
📋 Frontend Developer 角色规范

规范文件：
/home/czy/workspace/ai/skills/fullstack-test/templates/roles/frontend.md
```

#### 🧪 测试 (API Tester)
```
📋 API Tester 角色规范

规范文件：
/home/czy/workspace/ai/skills/fullstack-test/templates/roles/testing.md
```


### 步骤 6：根据角色配置

#### 后端开发 (backend)
如果步骤 3 用户选择了"沿用已有配置"，跳过 URL 输入；否则：
```
🔗 请输入后端服务 URL：
直接回车使用默认：http://localhost:8080

🔧 API 成功判断规则配置：
- 成功响应的 code 值（默认：0）：0
- 数据字段名（默认：data）：data
- 状态码字段名（默认：code）：code
```

**后端额外配置**：
```
📚 在线接口文档地址（可选）：
例如：https://api.example.com/docs, http://localhost:8080/swagger
直接回车跳过，稍后可通过 /coord-backend-config 配置
```

#### 前端开发 (frontend)
如果步骤 3 用户选择了"沿用已有配置"，跳过 URL 输入；否则：
```
🔗 请输入前端服务 URL：
直接回车使用默认：http://localhost:5173
```

#### 测试 (testing)
**重要：测试角色需要询问测试范围**

```
🧪 请描述本次测试的内容：

说明：请详细描述测试范围，包括：
- 测试的功能模块（如：用户登录、商品搜索）
- 是否有开发计划文档（.md 文件路径）
- 是否有设计文档（.md 文件路径）
- 测试场景（如：正常流程、异常流程、边界条件）

输入方式：
1️⃣  提供文档路径（如：/path/to/plan.md）
2️⃣  自然语言描述测试内容
3️⃣  直接回车跳过，稍后补充

你的输入：
```

**如果用户提供了文档路径**，读取并分析文档内容：
```bash
# 读取用户提供的文档
cat {文档路径}
```

**如果用户提供了自然语言描述**，记录描述内容。

### 步骤 7：创建目录结构

```bash
# 创建目录
mkdir -p {工作目录}/{需求编号}/{backend,frontend,testing/reports}

# 创建 service-info.json（项目级）
cat > {工作目录}/service-info.json << 'EOF'
{
  "created_at": "{ISO时间}",
  "backend": {
    "url": "{用户输入的URL}",
    "api_success_code": {用户输入},
    "response_data_field": "{data}",
    "response_code_field": "{code}",
    "status": "pending"
  },
  "frontend": {
    "url": "{用户输入的URL}",
    "status": "pending"
  },
  "testing": {
    "status": "pending"
  }
}
EOF

# 创建 README.md
cat > {工作目录}/{需求编号}/README.md << 'EOF'
# {需求编号} 联调测试协调手册

## 项目信息
- 工作目录: {工作目录}
- 需求编号: {需求编号}
- 服务配置: {工作目录}/service-info.json

## 命令
- /coord-status - 查看状态
- /coord-poll - 轮询反馈
- /coord-test-start - 启动测试
- /coord-resolve - 关闭问题
- /coord-done - 完成联调
- /coord-backend-config - 后端配置

## 测试案例
- 测试案例文档: {需求编号}/testing/test-cases.md
- 测试报告目录: {需求编号}/testing/reports/
EOF

# 创建 feedback.md（严格按照 feedback-format.md 格式）
cat > {工作目录}/{需求编号}/feedback.md << 'EOF'
# Feedback Log - {需求编号}

## Items

| # | assignee | from | priority | status | title |
|---|----------|------|----------|--------|-------|

EOF

# 创建 closed.md（严格按照 feedback-format.md 格式）
cat > {工作目录}/{需求编号}/closed.md << 'EOF'
# Closed Issues - {需求编号}

## Items

| # | assignee | from | priority | resolved_at | title |
|---|----------|------|----------|-------------|-------|

EOF
```

### 步骤 8：创建测试案例文档（仅测试角色）

如果用户选择了测试角色，创建测试案例文档：

```bash
# 创建测试案例目录和文档
mkdir -p {工作目录}/{需求编号}/testing/reports

# 如果用户提供了文档或描述，创建测试案例
cat > {工作目录}/{需求编号}/testing/test-cases.md << 'EOF'
# {需求编号} 测试案例

## 测试范围

{用户描述的测试内容或"待补充"}

## 测试环境
- 后端 URL: {backend.url}
- 前端 URL: {frontend.url}
- 创建时间: {ISO时间}

## 测试案例

### 待补充

说明：测试案例将根据用户后续提供的测试内容持续累加。
可以通过 /coord-test-start 或直接描述新测试内容来补充。
EOF
```

### 步骤 9：确认完成

```
✅ 初始化完成！

📁 工作目录: {工作目录}
📋 需求目录: {工作目录}/{需求编号}
📄 服务配置: {工作目录}/service-info.json
👤 角色: {角色}

下一步：
1️⃣  后端配置 API 规则: /coord-backend-config
2️⃣  查看状态: /coord-status
3️⃣  开始开发/测试工作
```

## 目录结构

```
{工作目录}/
├── service-info.json          # 服务配置（项目级）
├── REQ-001/
│   ├── README.md
│   ├── feedback.md
│   ├── backend/
│   ├── frontend/
│   └── testing/
│       ├── test-cases.md     # 测试案例（测试角色）
│       └── reports/          # 测试报告目录
└── REQ-002/
```

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-poll` - 轮询反馈
- `/coord-backend-config` - 后端配置
