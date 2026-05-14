# 项目目录结构

## 目录布局

```
{工作目录}/
├── service-info.json        # ⭐ 项目级（所有需求共享同一份服务配置）
├── {需求编号1}/
│   ├── README.md            # 需求协调手册
│   ├── feedback.md          # 问题追踪（open/acknowledged/in_progress）
│   ├── closed.md            # 已验证通过的问题归档
│   ├── backend/             # 后端工作目录（可选）
│   ├── frontend/            # 前端工作目录（可选）
│   └── testing/
│       ├── test-cases.md    # 测试案例（持续累加）
│       └── reports/         # 测试报告目录
│           └── final/       # 最终报告
├── {需求编号2}/
│   └── ...
```

## 问题流转机制

1. **测试发现缺陷** → 登记在 `feedback.md`（状态：open）
2. **前端/后端认领** → 状态变为 `acknowledged` 或 `in_progress`
3. **缺陷修复** → 开发标记为已修复
4. **测试复测验证** → 验证通过后，将相关内容转移到 `closed.md` 归档

## 关键说明

- **service-info.json** 放在**工作目录**根目录，所有需求共享同一份服务配置
- 每个需求有独立的 `feedback.md` 和 `closed.md`
- `feedback.md` 记录未关闭问题
- `closed.md` 归档已验证通过的问题
- `testing/test-cases.md` 用于测试案例，会持续累加

## 服务状态说明

| 服务 | 状态 | 说明 |
|------|------|------|
| backend | pending → ready | 后端服务联调状态 |
| frontend | pending → ready | 前端服务联调状态 |
| testing | pending → running → completed | 测试执行状态 |

## 三个角色

- **后端开发 (backend)**: 提供 API 接口，配置联调规则
- **前端开发 (frontend)**: 对接后端 API，实现页面功能
- **测试 (testing)**: 验证前后端集成，执行自动化测试