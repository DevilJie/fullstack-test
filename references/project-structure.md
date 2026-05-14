# 项目目录结构

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