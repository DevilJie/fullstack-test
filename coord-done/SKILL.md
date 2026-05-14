---
name: coord-done
description: >
  完成联调测试 - 用于前后端分离项目的联调测试工作流。

  触发关键词：完成联调、测试完成、coord-done、done、联调结束

  ⚠️ 重要：执行任务前必须先加载角色规范
version: 1.1.0
tags:
  - integration
  - testing
  - coordination
  - workflow
  - done
---

# /coord-done

## ⚠️ 重要：执行前必须加载角色规范

**角色规范文件：**
- 后端开发 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/backend.md`
- 前端开发 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/frontend.md`
- 测试 → `/home/czy/workspace/ai/skills/fullstack-test/templates/roles/testing.md`

**在完成联调之前，可以选择性阅读角色规范文件。**

**核心要点（来自规范文件）：**

Backend Architect: API < 200ms, 安全优先, 可用性 > 99.9%
Frontend Developer: Lighthouse > 90, WCAG 2.1 AA, 移动端优先
API Tester: 覆盖率 > 95%, OWASP 安全测试, 性能 SLA

**确认理解后，继续执行。**

### 步骤 1：检查联调状态

```
🔍 检查联调状态...

检查各角色是否完成：
- 后端状态: {backend.status}
- 前端状态: {frontend.status}
- 测试状态: {testing.status}
```

如果还有未完成的工作：
```
⚠️  还有角色未完成：

{列出未完成的状态}

建议：
1️⃣  完成剩余工作后再执行 /coord-done
2️⃣  如需查看详细状态: /coord-status
```

### 步骤 2：检查问题

检查 feedback.md 和 closed.md：
```bash
cat {工作目录}/{需求编号}/feedback.md
cat {工作目录}/{需求编号}/closed.md
```

显示问题汇总：
```
📋 问题汇总：

反馈中的问题: {数量}
已关闭的问题: {数量}
未解决的问题: {数量}
```

### 步骤 3：生成最终报告

生成最终联调报告：

```bash
# 创建最终报告目录
mkdir -p {工作目录}/{需求编号}/testing/reports/final

# 创建最终报告
cat > {工作目录}/{需求编号}/testing/reports/final/report.md << 'EOF'
# {需求编号} 联调测试最终报告

## 测试概览
- 需求编号: {需求编号}
- 完成时间: {当前时间}
- 测试案例数: {数量}
- 发现问题数: {数量}
- 已解决问题数: {数量}
- 未解决问题数: {数量}

## 测试执行记录

{测试执行记录摘要}

## 问题汇总

### 未关闭的问题（feedback.md）
{列出未解决的问题}

### 已关闭的问题（closed.md）
{列出已关闭的问题}

## 结论

✅ 联调完成
或
⚠️  联调未完成，还有问题需要处理
EOF
```

### 步骤 4：确认完成

```
✅ 联调完成！

📄 最终报告: {工作目录}/{需求编号}/testing/reports/final/report.md

📊 联调总结：
- 测试案例: {数量}
- 发现问题: {数量}
- 已解决: {数量}
- 未解决: {数量}

感谢使用 Fullstack Test 工作流！
```