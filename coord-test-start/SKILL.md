---
name: coord-test-start
description: >
  启动自动化测试 - 用于前后端分离项目的联调测试工作流。

  触发关键词：启动测试、测试开始、coord-test-start、start testing、开始联调测试

  ⚠️ 重要：执行任务前必须先加载测试角色规范
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - playwright
  - workflow
  - testing
---

# /coord-test-start

## ⚠️ 重要：执行前必须加载角色规范

**API Tester 规范文件：**
```
/home/czy/workspace/ai/skills/fullstack-test/templates/roles/testing.md
```

**在启动测试之前，必须先阅读规范文件。**

**核心要点（来自规范文件）：**
- 🔒 安全测试优先：OWASP API Security Top 10
- ⚡ 性能验证：95百分位响应 < 200ms
- 📊 负载测试：验证 10倍正常流量
- 🎯 测试覆盖率目标 > 95%

**确认理解后，继续执行测试。**

### 步骤 1：检查前置条件

```
🧪 检查测试前置条件...

1️⃣  检查 service-info.json 是否存在
2️⃣  检查后端状态是否为 ready
3️⃣  检查前端状态是否为 ready
```

如果前置条件不满足：
```
⚠️  前置条件不满足：

{列出具体问题}

请先完成以下步骤：
1️⃣  运行 /coord-start 初始化项目（如未初始化）
2️⃣  运行 /coord-backend-config 配置后端（如未配置）
3️⃣  确保 backend 和 frontend 状态都是 ready
```

### 步骤 2：确认测试范围

```
🔍 确认测试范围：

请选择要执行的测试类型：

1️⃣  📋 完整测试（功能 + 性能 + 安全）
2️⃣  ⚡ 性能测试（仅测试 API 响应时间和负载能力）
3️⃣  🔒 安全测试（仅测试认证、授权、OWASP 漏洞）
4️⃣  ✅ 功能测试（仅测试 API 功能正确性）
```

### 步骤 3：显示测试配置

根据 service-info.json 中的配置显示测试设置：
```
📊 测试配置：

后端 URL: {backend.url}
API成功判断: code={api_success_code}, data={response_data_field}
超时设置: {timeout_ms}ms

前端 URL: {frontend.url}
```

### 步骤 4：询问是否有新的测试内容

**重要：测试案例可以持续累加**

```
📝 是否有新的测试内容需要补充？

说明：测试案例文档会持续累加，每次启动测试都可以补充新的测试场景。

输入方式：
1️⃣  提供文档路径（如：/path/to/new-tests.md）
2️⃣  自然语言描述新的测试内容
3️⃣  直接回车跳过（使用现有测试案例）

你的输入：
```

如果用户提供了新内容，更新测试案例文档：

```bash
# 读取现有测试案例
cat {工作目录}/{需求编号}/testing/test-cases.md

# 追加新内容到测试案例
cat >> {工作目录}/{需求编号}/testing/test-cases.md << 'EOF'

## 补充测试案例 - {时间戳}

{新增的测试内容}
EOF
```

### 步骤 5：检查复测需求

检查 feedback.md 中是否有待复测的问题（状态为 resolved）：
```bash
# 读取 feedback.md
cat {工作目录}/{需求编号}/feedback.md
```

如果有待复测的问题：
```
🔍 检测到待复测的问题：

{列出所有 resolved 状态的问题}

请先执行复测验证：
- 如果问题已真正修复 → 移动到 closed.md
- 如果问题未修复 → 状态改回 in_progress
```

### 步骤 6：执行复测验证

对于每个待复测的问题：
```
🔬 复测验证：

问题: {description}
原解决方案: {solution}

测试结果：
1️⃣  ✅ 验证通过（问题已修复）→ 移动到 closed.md
2️⃣  ❌ 验证失败（问题仍存在）→ 状态改回 in_progress
```

执行复测后，更新文档：

**验证通过**（严格按照 feedback-format.md 格式）：
```bash
# 1. 从 feedback.md 复制该问题到 closed.md
# 2. 在 closed.md 的 Items 表格中添加一行
# 3. 在 closed.md 中添加问题详情（包含 resolved_at 和 resolution）
# 4. 从 feedback.md 删除该问题条目及其详情
```

**验证失败**：
```bash
# 在 feedback.md 中：
# 1. 将该问题的 status 从 resolved 改回 in_progress
# 2. 添加或更新 description 说明仍存在的问题
# 3. resolved_at 和 resolution 保持空白
```

### 步骤 7：执行新测试

根据选择的测试类型执行对应的测试：

#### 功能测试
```bash
# 使用 Playwright 或其他工具执行功能测试
# 测试所有 API 端点的正确性
# 验证前后端集成是否正常
```

#### 性能测试
```bash
# 执行性能测试
# 验证 API 响应时间 < 200ms (95百分位)
# 验证负载能力（10倍正常流量）
```

#### 安全测试
```bash
# 执行安全测试
# 测试 OWASP API Security Top 10
# 验证认证、授权、数据加密
```

### 步骤 8：生成测试报告

测试完成后，生成测试报告：
```bash
# 生成测试报告到
{工作目录}/{需求编号}/testing/reports/{timestamp}/report.md
```

报告内容应包含：
```
# 测试报告 - {需求编号}

## 测试概览
- 测试类型: {功能/性能/安全/完整}
- 测试时间: {timestamp}
- 测试结果: {PASS/FAIL}

## 测试详情
{详细的测试结果}

## 发现的问题
{如果有的话}

## 建议
{改进建议}
```

### 步骤 9：确认完成

```
✅ 测试完成！

📊 测试结果: {PASS/FAIL}
📄 报告位置: {报告路径}

下一步：
1️⃣  查看详细报告: cat {报告路径}
2️⃣  处理发现的问题: /coord-poll
3️⃣  标记问题已解决: /coord-resolve
4️⃣  完成联调: /coord-done
```