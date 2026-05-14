---
name: fullstack-test
description: >
  全流程测试协调 skill - 用于前后端分离项目的联调测试。

  核心理念：
  - "Thinking time is more valuable than coding time" - 想清楚比写代码更重要
  - 三个会话角色：后端开发、前端开发、测试
  - 通过 feedback.md 登记问题，通过 closed.md 归档已验证问题
  - 支持 feedback 链式流转（测试→前端→后端）
  - 全自动 Playwright 浏览器测试

  首次使用 /coord-start 初始化项目，之后各会话使用对应命令协调工作。
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - playwright
  - workflow
---

# Fullstack Test - 全流程测试协调

## 概述

本 skill 用于协调前后端分离项目的联调测试工作流。

**三个角色**：
- 后端开发 (`backend`)
- 前端开发 (`frontend`)
- 测试 (`testing`)

**核心协调机制**：
- `feedback.md` — 记录所有未关闭问题（open/acknowledged/in_progress）
- `closed.md` — 记录所有已验证通过的问题（测试完成验证后由 /coord-resolve 写入）

---

## 目录结构

项目根目录由用户在初始化时指定，需求文件将创建在 `{项目根目录}/{需求编号}/` 下:

```
{项目根目录}/{需求编号}/
├── README.md                 # 项目协调手册
├── service-info.json        # 服务配置（URL、状态、API规则）
├── feedback.md             # 统一问题追踪（未关闭）
├── closed.md               # 已关闭问题归档（仅测试/后端/前端确认后由测试写入）
├── backend/
│   ├── spec.md            # 设计文档
│   ├── plan.md            # 开发计划
│   └── api-spec.md        # 接口规范（联调必需）
├── frontend/
│   ├── spec.md            # 设计文档
│   ├── plan.md            # 开发计划
│   └── pages.md           # 测试页面清单（联调必需）
└── testing/
    ├── test-plan.md       # 测试计划
    ├── session.ts         # Playwright 自动化脚本
    └── reports/
        └── final-report.md
```

---

## 命令索引

| 命令 | 角色 | 说明 |
|------|------|------|
| `/coord-start` | 任一 | 初始化项目 + 注册角色 |
| `/coord-status` | 任一 | 查看联调状态 |
| `/coord-poll` | 后端/前端 | 轮询反馈、检测分配给自己的问题 |
| `/coord-test-start` | 测试 | 启动自动化测试 |
| `/coord-resolve` | 后端/前端 | 标记问题已解决，移入 closed.md |
| `/coord-done` | 测试 | 生成最终报告、完成联调 |
| `/coord-backend-config` | 后端 | 查看/修改后端服务配置 |

---

## /coord-start

**首次使用，必须先运行此命令**

### 流程

```
1. 询问项目根目录 (默认当前工作目录)
2. 询问需求编号 (例如: REQ-001)
3. 询问角色:
   - 后端开发
   - 前端开发
   - 测试
4. 根据角色询问不同内容
```

### 选择项目根目录

```
当前工作目录: /path/to/your/project
是否使用当前目录作为项目根目录? (y/n)

→ 选择 y: 项目文件将创建在 /path/to/your/project/REQ-001/
→ 选择 n: 请输入自定义目录路径
```

### 后端开发

```
请提供设计文档和开发计划:
- 输入已有文件路径 (例如: ./docs/spec.md)
- 或使用自然语言描述开发内容

产出:
- backend/spec.md (设计文档)
- backend/plan.md (开发计划)
- backend/api-spec.md (接口规范，供前端联调)

请输入后端服务 URL:
- 例如: http://localhost:8080

重要：必须提供 API 成功判断规则（写入 service-info.json）:
- 接口端点 domain
- 成功响应的 code 值（如 0、200）
- 失败响应的 code 值（如 30001、40001）
- 报文字段解析规则（data 字段位置、错误信息字段等）

示例：
  "api_success_code": 0,
  "api_fail_codes": [30001, 30002, 40001],
  "response_data_field": "data",
  "response_code_field": "code",
  "response_msg_field": "msg"
```

### 前端开发

```
请提供设计文档和开发计划:
- 输入已有文件路径
- 或使用自然语言描述开发内容

产出:
- frontend/spec.md (设计文档)
- frontend/plan.md (开发计划)
- frontend/pages.md (测试页面清单，供测试使用)

请输入前端服务 URL:
- 例如: http://localhost:5173
```

### 测试

```
请提供测试范围:
- 输入已有测试计划文件路径
- 或使用自然语言描述需要测试的功能

注意: 测试会话需要等待 backend/api-spec.md 和 frontend/pages.md 都就绪后
才能生成测试计划。

产出:
- testing/test-plan.md (测试计划)
- testing/session.ts (Playwright 自动化脚本)
```

---

## /coord-backend-config

后端会话查看/修改服务配置。

### 查看当前配置

```
/coord-backend-config
```

输出当前 service-info.json 中的后端配置。

### 修改配置

```
/coord-backend-config set <字段> <值>

示例:
/coord-backend-config set url http://localhost:9090
/coord-backend-config set api_success_code 0
/coord-backend-config set api_doc_url http://localhost:8080/docs
```

### 可配置字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `url` | 接口端点 domain | `http://localhost:8080` |
| `health_url` | 健康检查地址 | `http://localhost:8080/health` |
| `api_doc_url` | 接口文档地址 | `http://localhost:8080/api/docs` |
| `api_success_code` | 成功响应 code 值 | `0` 或 `200` |
| `api_fail_codes` | 失败响应 code 值数组 | `[30001, 40001]` |
| `response_data_field` | 响应数据字段名 | `data` |
| `response_code_field` | 响应状态码字段名 | `code` |
| `response_msg_field` | 响应消息字段名 | `msg` |
| `timeout_ms` | 请求超时毫秒 | `5000` |

---

## /coord-status

查看当前联调状态。

### 输出示例

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

---

## /coord-poll

后端/前端会话轮询自己的反馈。

### 行为

1. 读取 `feedback.md`
2. 筛选 `assignee: 当前会话角色` 的未关闭问题
3. 显示待处理问题列表
4. 如果有新增/更新的反馈，提示用户处理

### 触发条件

建议在以下时机运行:
- 完成一个功能开发后
- 等待对方响应时
- 开始新任务前

---

## /coord-test-start

测试会话启动自动化测试。

### 前置条件检查

```
必须满足以下条件才能启动:
✅ backend/api-spec.md 存在
✅ frontend/pages.md 存在
✅ service-info.json 中 backend.status = ready
✅ service-info.json 中 frontend.status = ready
✅ service-info.json 中包含 API 判断规则（api_success_code 等）
```

### API 判断规则缺失时阻断

```
⚠️ 联调测试前置条件未满足

当前状态:
- backend/api-spec.md: ✅ 已就绪
- frontend/pages.md: ✅ 已就绪
- API 判断规则: ❌ 缺失

❌ service-info.json 中缺少 API 成功判断规则。
   后端需要先通过 /coord-backend-config 配置以下字段:
   - api_success_code（成功响应 code 值）
   - api_fail_codes（失败响应 code 值数组）
   - response_data_field（数据字段名）
   - response_code_field（状态码字段名）

请先完成配置，再运行 /coord-test-start
```

### 测试前必读

1. **读取 feedback.md** — 了解所有 open/acknowledged 问题
2. **读取 service-info.json** — 确认 API 成功判断规则

### 测试流程

1. 读取 `service-info.json` 获取 URL 和 API 判断规则
2. 读取 `feedback.md` 了解未解决问题
3. 读取 `backend/api-spec.md` 了解 API 接口
4. 读取 `frontend/pages.md` 了解需要测试的页面
5. 启动 Playwright 浏览器
6. 遍历测试用例执行：
   - **页面加载测试** — 检查页面元素是否正常显示
   - **数据完整性测试** — 检查 API 响应字段是否有真实数据（不仅是 HTTP 200）
   - **点击交互测试** — 测试按钮、Tab、卡片等交互是否正常
7. 遇到问题 → 登记 `feedback.md`
8. 遇到阻塞 → 登记 `feedback.md`，assignee = 对应方
9. 持续运行直到所有测试通过或用户手动停止

### 测试检查项（必须覆盖）

| 检查项 | 说明 |
|--------|------|
| 页面加载 | 页面能打开，核心元素存在 |
| 接口返回数据 | API 响应字段是否有真实内容（不是 `[]`/`{}`/`null`） |
| 接口字段完整性 | api-spec 定义字段是否都有值 |
| 点击交互 | 按钮、导航、Tab 切换 |
| 页面显示数据 | 页面数据与 API 返回是否一致 |

### 接口成功判断规则（从 service-info.json 读取）

```json
{
  "api_success_code": 0,
  "api_fail_codes": [30001, 30002, 40001],
  "response_data_field": "data",
  "response_code_field": "code",
  "response_msg_field": "msg"
}
```

判断逻辑：
1. 检查 `code` 字段是否等于 `api_success_code`
2. 检查 `data` 字段是否有真实内容（不是 `[]`/`{}`/`null`）
3. 任意一项不满足 → 登记 issue

---

## /coord-resolve

标记反馈问题已解决，移入 closed.md。

```
/coord-resolve <编号> [解决方案]

示例:
/coord-resolve 1 已修复空指针异常
/coord-resolve 3
```

### 执行流程

1. 读取 `feedback.md` 中指定编号的问题
2. 将 `status` 从 `resolved` 改为 `closed`
3. 将该问题从 `feedback.md` 移动到 `closed.md`（保留完整记录）
4. 在 `feedback.md` 中删除该条目
5. `closed.md` 追加新条目（包含 resolved_at 和 resolution）

### Feedback 链式流转

```
测试发现 Bug → 提交给前端 (#1)
     ↓
前端定位到根因在后端 → 新建 #2 (assignee: backend, related: #1)
     ↓
前端暂时搁置 #1，等待 #2 解决
     ↓
后端处理 #2 → /coord-resolve 2
     ↓
前端检测到 #2 closed → 处理 #1 → /coord-resolve 1
     ↓
#1 移入 closed.md
```

---

## /coord-done

测试会话生成最终报告，完成联调。

### 条件

所有测试通过 + 所有反馈已 resolved/closed

### 输出

- `testing/reports/final-report.md` - 最终测试报告
- 更新 `service-info.json` → `testing.status = completed`

---

## Feedback 格式（feedback.md）

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

---

## Closed 格式（closed.md）

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

---

## Service-info.json 格式

```json
{
  "requirement_id": "{REQ-XXX}",
  "created_at": "{ISO时间戳}",
  "backend": {
    "url": "http://localhost:8080",
    "health_url": "http://localhost:8080/health",
    "api_doc_url": "http://localhost:8080/api/docs",
    "api_success_code": 0,
    "api_fail_codes": [30001, 30002, 40001],
    "response_data_field": "data",
    "response_code_field": "code",
    "response_msg_field": "msg",
    "timeout_ms": 5000,
    "status": "pending"
  },
  "frontend": {
    "url": "http://localhost:5173",
    "status": "pending"
  },
  "testing": {
    "status": "pending"
  }
}
```

### status 值

| 服务 | 可选值 |
|------|--------|
| backend | pending → ready → completed |
| frontend | pending → ready → completed |
| testing | pending → running → completed |

---

## 核心理念

> **"Thinking time is more valuable than coding time"**
> **想清楚比写代码更重要**

在动手之前，先规划、先评审、先想清楚。

---

## 文件监控

不要用死循环轮询。建议:

1. **人工触发**: 在关键节点手动运行 `/coord-poll`
2. **CI 集成**: 在 git hooks 中触发状态检查
3. **可选定时**: 设置轻量级定时检查 (每 5-10 分钟)

---

## 遇到问题？

1. 检查 `{需求编号}/README.md`
2. 运行 `/coord-status` 查看当前状态
3. 确认 `service-info.json` 配置正确（特别是 API 判断规则）
4. 确认各会话产出的文件已就绪