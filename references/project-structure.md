# 项目目录结构

## 目录布局

```
{项目根目录}/
├── service-info.json        # ⭐ 项目级（所有需求共享同一份服务配置）
├── {需求编号1}/
│   ├── README.md            # 需求协调手册
│   ├── feedback.md         # 需求级问题追踪
│   ├── closed.md           # 需求级已关闭问题
│   ├── backend/            # 后端开发文件
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── api-spec.md    # 联调必需
│   ├── frontend/            # 前端开发文件
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── pages.md        # 联调必需
│   └── testing/
│       ├── test-plan.md
│       ├── session.ts
│       └── reports/
│           └── final-report.md
├── {需求编号2}/
│   └── ...
```

## 关键说明

- **service-info.json** 放在**项目根目录**，所有需求共享同一份服务配置
- 每个需求有独立的 `feedback.md` 和 `closed.md`
- `backend/api-spec.md` 和 `frontend/pages.md` 是联调测试的前置条件

## 服务状态说明

| 服务 | 状态 | 说明 |
|------|------|------|
| backend | pending → ready → completed | 后端服务联调状态 |
| frontend | pending → ready → completed | 前端服务联调状态 |
| testing | pending → running → completed | 测试执行状态 |

## 三个角色

- **后端开发 (backend)**: 提供 API 接口，配置联调规则
- **前端开发 (frontend)**: 对接后端 API，实现页面功能
- **测试 (testing)**: 验证前后端集成，执行自动化测试