---
name: coord-backend-config
description: >
  后端服务配置管理 - 用于前后端分离项目的联调测试工作流。

  触发关键词：后端配置、服务配置、coord-backend-config、backend config、API规则

  功能：
  - 查看当前 service-info.json 中的后端配置
  - 修改后端配置字段（URL、API规则等）
  - 配置 API 成功/失败判断规则

  适用角色：后端开发
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - backend
  - config
---

# /coord-backend-config - 后端服务配置

## 查看当前配置

```
/coord-backend-config
```

输出当前 service-info.json 中的后端配置：

```
=== 后端配置 ===

url: http://localhost:8080
health_url: http://localhost:8080/health
api_doc_url: http://localhost:8080/api/docs
api_success_code: 0
api_fail_codes: [30001, 30002, 40001]
response_data_field: data
response_code_field: code
response_msg_field: msg
status: ready

修改示例：/coord-backend-config set api_success_code 0
```

## 修改配置

```
/coord-backend-config set <字段> <值>

示例:
/coord-backend-config set url http://localhost:9090
/coord-backend-config set api_success_code 0
/coord-backend-config set api_doc_url http://localhost:8080/docs
```

## 可配置字段

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

## 重要性

**API 判断规则是测试启动的前置条件！**

如果没有配置 `api_success_code`、`response_data_field` 等字段，
`/coord-test-start` 会被阻断，无法启动测试。

## 相关命令

- `/coord-start` - 初始化项目
- `/coord-status` - 查看联调状态
- `/coord-test-start` - 启动测试（测试角色）