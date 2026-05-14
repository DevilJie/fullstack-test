---
name: coord-test-start
description: >
  启动自动化测试 - 用于前后端分离项目的联调测试工作流。

  触发关键词：启动测试、测试开始、coord-test-start、start testing、开始联调测试

  功能：
  - 前置条件检查（api-spec.md、pages.md、API规则）
  - 读取 service-info.json 获取配置
  - 启动 Playwright 浏览器测试
  - 发现问题登记到 feedback.md

  适用角色：测试
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - playwright
  - workflow
  - testing
---

# /coord-test-start - 启动自动化测试

## 前置条件检查

```
必须满足以下条件才能启动:
✅ backend/api-spec.md 存在
✅ frontend/pages.md 存在
✅ service-info.json 中 backend.status = ready
✅ service-info.json 中 frontend.status = ready
✅ service-info.json 中包含 API 判断规则（api_success_code 等）
```

## API 判断规则缺失时阻断

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

## 测试前必读

1. **读取 feedback.md** — 了解所有 open/acknowledged 问题
2. **读取 service-info.json** — 确认 API 成功判断规则
3. **读取 backend/api-spec.md** — 了解 API 接口
4. **读取 frontend/pages.md** — 了解需要测试的页面

## 测试流程

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

## 测试检查项（必须覆盖）

| 检查项 | 说明 |
|--------|------|
| 页面加载 | 页面能打开，核心元素存在 |
| 接口返回数据 | API 响应字段是否有真实内容（不是 `[]`/`{}`/`null`） |
| 接口字段完整性 | api-spec 定义字段是否都有值 |
| 点击交互 | 按钮、导航、Tab 切换 |
| 页面显示数据 | 页面数据与 API 返回是否一致 |

## API 成功判断规则（从 service-info.json 读取）

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

## 相关命令

- `/coord-status` - 查看联调状态
- `/coord-done` - 完成测试，生成最终报告
- `/coord-resolve` - 关闭已验证的问题