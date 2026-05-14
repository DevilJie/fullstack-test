---
name: coord-start
description: >
  初始化联调测试项目 - 用于前后端分离项目的联调测试工作流。

  触发关键词：初始化项目、开始联调、coord-start、coord start、新建项目

  功能：
  - 询问项目根目录和需求编号
  - 创建项目目录结构
  - 注册角色（后端/前端/测试）
  - 初始化 service-info.json

  首次使用必须先运行此命令。

  配合使用：coord-status（查看状态）、coord-poll（轮询反馈）
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - init
---

# /coord-start - 初始化联调测试项目

**首次使用，必须先运行此命令**

## 流程

```
1. 询问项目根目录 (默认当前工作目录)
2. 询问需求编号 (例如: REQ-001)
3. 询问角色:
   - 后端开发
   - 前端开发
   - 测试
4. 根据角色询问不同内容
```

## 选择项目根目录

```
当前工作目录: /path/to/your/project
是否使用当前目录作为项目根目录? (y/n)

→ 选择 y: 项目文件将创建在 /path/to/your/project/REQ-001/
→ 选择 n: 请输入自定义目录路径
```

## 后端开发

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

## 前端开发

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

## 测试

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

## 目录结构

项目文件将创建在 `{项目根目录}/{需求编号}/` 下:

```
{项目根目录}/{需求编号}/
├── README.md                 # 项目协调手册
├── service-info.json        # 服务配置（URL、状态、API规则）
├── feedback.md             # 统一问题追踪（未关闭）
├── closed.md               # 已关闭问题归档
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

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-backend-config` - 后端配置（查看/修改 API 规则）