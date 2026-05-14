#!/bin/bash
# fullstack-test 安装脚本

echo "安装 fullstack-test 依赖..."

cd "$(dirname "$0")"

# 安装 Playwright
npm install playwright 2>&1

# 安装浏览器
npx playwright install chromium 2>&1

echo ""
echo "安装完成!"
echo ""
echo "用法:"
echo "  node scripts/coord.js start    - 初始化项目"
echo "  node scripts/coord.js status   - 查看状态"
echo "  node scripts/coord.js poll     - 轮询反馈"
echo "  node scripts/coord.js resolve  - 标记已解决"
echo ""
echo "或在 Claude Code 中使用 /coord-start 等命令"
