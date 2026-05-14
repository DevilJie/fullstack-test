#!/usr/bin/env node
/**
 * coord-done 交互式脚本
 * 完成联调测试
 */

const fs = require("fs");
const path = require("path");

const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();

const CWD = process.cwd();

function findWorkDir(startPath) {
  let dir = startPath;
  for (let i = 0; i < 10; i++) {
    const serviceInfo = path.join(dir, "service-info.json");
    if (fs.existsSync(serviceInfo)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startPath;
}

function findAllReqDirs(workDir) {
  const items = fs.readdirSync(workDir);
  return items
    .filter(item => {
      const itemPath = path.join(workDir, item);
      return fs.statSync(itemPath).isDirectory() &&
             item !== "node_modules" &&
             item !== ".git" &&
             fs.existsSync(path.join(itemPath, "feedback.md"));
    })
    .sort();
}

function loadFeedback(reqPath) {
  const feedbackPath = path.join(reqPath, "feedback.md");
  if (!fs.existsSync(feedbackPath)) {
    return [];
  }
  const content = fs.readFileSync(feedbackPath, "utf-8");
  const items = [];
  const lines = content.split("\n");
  let currentItem = null;

  for (const line of lines) {
    const itemMatch = line.match(/^-\s+\[#(\d+)\]\s*\[(\w+)\]/);
    if (itemMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        id: itemMatch[1],
        status: itemMatch[2],
        line: 0
      };
      currentItem.line = lines.indexOf(line);
    }
  }
  if (currentItem) items.push(currentItem);
  return items;
}

function loadClosed(reqPath) {
  const closedPath = path.join(reqPath, "closed.md");
  if (!fs.existsSync(closedPath)) {
    return [];
  }
  const content = fs.readFileSync(closedPath, "utf-8");
  const items = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^-\s+\[closed\]\s+#(\d+)/);
    if (match) {
      items.push({ id: match[1] });
    }
  }
  return items;
}

function saveServiceInfo(workDir, serviceInfo) {
  const serviceInfoPath = path.join(workDir, "service-info.json");
  fs.writeFileSync(serviceInfoPath, JSON.stringify(serviceInfo, null, 2), "utf-8");
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 完成联调");
  console.log("=".repeat(50) + "\n");

  const workDir = findWorkDir(CWD);
  const serviceInfoPath = path.join(workDir, "service-info.json");

  if (!fs.existsSync(serviceInfoPath)) {
    console.log("  ❌ 未找到 service-info.json");
    console.log("  请先运行 /coord-start 初始化项目\n");
    return;
  }

  console.log(`  📁 工作目录: ${workDir}\n`);

  // 查找所有需求目录
  const reqDirs = findAllReqDirs(workDir);

  if (reqDirs.length === 0) {
    console.log("  ❌ 未找到任何需求目录\n");
    return;
  }

  // 检查每个需求的问题关闭状态
  let totalOpen = 0;
  const results = [];

  for (const reqId of reqDirs) {
    const reqPath = path.join(workDir, reqId);
    const feedbackItems = loadFeedback(reqPath);
    const closedItems = loadClosed(reqPath);

    const openItems = feedbackItems.filter(item => item.status !== "closed");
    totalOpen += openItems.length;

    results.push({
      reqId,
      openCount: openItems.length,
      closedCount: closedItems.length,
      openItems
    });
  }

  // 显示检查结果
  console.log("  📋 问题关闭状态检查:\n");
  for (const r of results) {
    const status = r.openCount === 0 ? "✅" : "❌";
    console.log(`  ${status} ${r.reqId}: ${r.closedCount} 已关闭 / ${r.openCount} 待处理`);
  }
  console.log("");

  if (totalOpen > 0) {
    console.log(`  ❌ 仍有 ${totalOpen} 条问题未关闭`);
    console.log("  请先关闭所有问题后再运行 /coord-done\n");

    // 显示待关闭的问题
    for (const r of results) {
      if (r.openItems.length > 0) {
        console.log(`  📋 ${r.reqId} 待关闭问题:`);
        for (const item of r.openItems) {
          console.log(`     #${item.id} [${item.status}]`);
        }
        console.log("");
      }
    }
    return;
  }

  // 所有问题已关闭，生成报告
  console.log("  ✅ 所有问题已关闭\n");

  const { selectedReq } = await prompt([
    {
      type: "list",
      name: "selectedReq",
      message: "请选择要生成报告的需求:",
      choices: reqDirs.map(req => ({ name: `📋 ${req}`, value: req })),
    },
  ]);

  const reqPath = path.join(workDir, selectedReq);
  const closedItems = loadClosed(reqPath);

  // 生成最终报告
  const reportContent = `# 测试最终报告 - ${selectedReq}

## 测试结果
- 总关闭问题数: ${closedItems.length}
- 状态: ✅ 全部关闭

## 已关闭问题
${closedItems.map(item => `- #${item.id}`).join("\n")}

## 结论
所有测试通过，联调完成。
生成时间: ${new Date().toISOString()}
`;

  const reportPath = path.join(reqPath, "testing", "reports", "final-report.md");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent, "utf-8");

  // 更新 service-info.json
  const serviceInfo = JSON.parse(fs.readFileSync(serviceInfoPath, "utf-8"));
  serviceInfo.testing = serviceInfo.testing || {};
  serviceInfo.testing.status = "completed";
  saveServiceInfo(workDir, serviceInfo);

  console.log("  ✅ 最终报告已生成:");
  console.log(`     ${reportPath}`);
  console.log("  ✅ testing.status 已设为 completed\n");
}

main().catch(console.error);