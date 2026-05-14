#!/usr/bin/env node
/**
 * coord-poll 交互式脚本
 * 轮询反馈问题
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
    const itemMatch = line.match(/^-\s+\[#(\d+)\]\s*\[(\w+)\]\s*(.+)/);
    if (itemMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        id: itemMatch[1],
        priority: itemMatch[2],
        desc: itemMatch[3].trim(),
        status: "open",
        assignee: ""
      };
    } else if (line.includes("[acknowledged]")) {
      if (currentItem) currentItem.status = "acknowledged";
    } else if (line.includes("[in_progress]")) {
      if (currentItem) currentItem.status = "in_progress";
    } else if (line.includes("[resolved]")) {
      if (currentItem) currentItem.status = "resolved";
    } else {
      const assigneeMatch = line.match(/assignee:\s*(\w+)/);
      if (assigneeMatch && currentItem) {
        currentItem.assignee = assigneeMatch[1];
      }
    }
  }
  if (currentItem) items.push(currentItem);
  return items;
}

async function selectRole() {
  const { role } = await prompt([
    {
      type: "list",
      name: "role",
      message: "👤 请选择你的角色:",
      choices: [
        { name: "🔧 后端开发 (backend)", value: "backend" },
        { name: "🎨 前端开发 (frontend)", value: "frontend" },
        { name: "🧪 测试 (testing)", value: "testing" },
      ],
    },
  ]);
  return role;
}

function displayPollResults(role, reqId, items) {
  const myItems = items.filter(item => item.assignee === role || item.assignee === "");

  console.log("\n" + "=".repeat(50));
  console.log(`  📬 ${reqId} - 你的待处理反馈`);
  console.log("=".repeat(50) + "\n");

  if (myItems.length === 0) {
    console.log("  ✅ 暂无分配给你的问题");
    return;
  }

  console.log(`  共 ${myItems.length} 项待处理:\n`);

  for (const item of myItems) {
    const statusIcon = item.status === "open" ? "🔴" :
                       item.status === "acknowledged" ? "🟡" :
                       item.status === "in_progress" ? "🔵" : "✅";
    console.log(`  ${statusIcon} #${item.id} [${item.priority}] ${item.desc}`);
    console.log(`      状态: ${item.status} | assignee: ${item.assignee || "未指定"}\n`);
  }
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 轮询反馈");
  console.log("=".repeat(50) + "\n");

  const workDir = findWorkDir(CWD);
  const serviceInfoPath = path.join(workDir, "service-info.json");

  if (!fs.existsSync(serviceInfoPath)) {
    console.log("  ❌ 未找到 service-info.json");
    console.log("  请先运行 /coord-start 初始化项目\n");
    return;
  }

  console.log(`  📁 工作目录: ${workDir}\n`);

  // 选择角色
  const role = await selectRole();

  // 查找所有需求目录
  const reqDirs = findAllReqDirs(workDir);

  if (reqDirs.length === 0) {
    console.log("  ❌ 未找到任何需求目录\n");
    return;
  }

  // 显示所有需求的问题
  for (const reqId of reqDirs) {
    const reqPath = path.join(workDir, reqId);
    const feedbackItems = loadFeedback(reqPath);
    displayPollResults(role, reqId, feedbackItems);
  }
}

main().catch(console.error);