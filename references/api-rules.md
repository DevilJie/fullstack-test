# API 判断规则

## service-info.json 格式

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

## 必填字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `api_success_code` | 成功响应 code 值 | `0` 或 `200` |
| `api_fail_codes` | 失败响应 code 值数组 | `[30001, 40001]` |
| `response_data_field` | 响应数据字段名 | `data` |
| `response_code_field` | 响应状态码字段名 | `code` |
| `response_msg_field` | 响应消息字段名 | `msg` |

## API 判断逻辑

判断一个 API 调用是否成功：

1. 检查 `code` 字段是否等于 `api_success_code`
2. 检查 `data` 字段是否有真实内容（不是 `[]`/`{}`/`null`）

两个条件都满足 → API 调用成功
任意一项不满足 → 登记 issue 到 feedback.md

## 配置示例

```json
{
  "api_success_code": 0,
  "api_fail_codes": [30001, 30002, 40001, 50000],
  "response_data_field": "data",
  "response_code_field": "code",
  "response_msg_field": "message"
}
```