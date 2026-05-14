#!/usr/bin/env node
/**
 * coord-status 交互式脚本
 * 查看联调状态
 */

const fs = require("fs");
const path = require("path");

const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();

const CWD = process.cwd();

// 查找工作目录（向上查找 service-info.json）
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

function loadServiceInfo(workDir) {
  const serviceInfoPath = path.join(workDir, "service-info.json");
  if (!fs.existsSync(serviceInfoPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(serviceInfoPath, "utf-8"));
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
  // 简单解析 feedback.md 中的列表项
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
        status: "open"
      };
    } else if (line.includes("[acknowledged]")) {
      if (currentItem) currentItem.status = "acknowledged";
    } else if (line.includes("[in_progress]")) {
      if (currentItem) currentItem.status = "in_progress";
    }
  }
  if (currentItem) items.push(currentItem);
  return items;
}

function displayStatus(workDir, reqId) {
  const reqPath = path.join(workDir, reqId);
  const serviceInfo = loadServiceInfo(workDir);
  const feedbackItems = loadFeedback(reqPath);

  console.log("\n" + "=".repeat(50));
  console.log(`  📊 ${reqId} 联调状态`);
  console.log("=".repeat(50) + "\n");

  if (!serviceInfo) {
    console.log("  ❌ 未找到 service-info.json");
    return;
  }

  // 服务状态
  console.log("  🔧 服务配置:");
  console.log(`     后端: ${serviceInfo.backend?.url || "未设置"} [${serviceInfo.backend?.status || "unknown"}]`);
  console.log(`     前端: ${serviceInfo.frontend?.url || "未设置"} [${serviceInfo.frontend?.status || "unknown"}]`);
  console.log(`     测试: [${serviceInfo.testing?.status || "unknown"}]`);
  console.log("");

  // API 判断规则
  if (serviceInfo.backend) {
    console.log("  📋 API 判断规则:");
    console.log(`     成功 code: ${serviceInfo.backend.api_success_code ?? 0}`);
    console.log(`     data 字段: ${serviceInfo.backend.response_data_field || "data"}`);
    console.log(`     code 字段: ${serviceInfo.backend.response_code_field || "code"}`);
    console.log(`     msg 字段: ${serviceInfo.backend.response_msg_field || "msg"}`);
    console.log("");
  }

  // 前置条件
  const apiSpecExists = fs.existsSync(path.join(reqPath, "backend", "api-spec.md"));
  const pagesExists = fs.existsSync(path.join(reqPath, "frontend", "pages.md"));

  console.log("  📁 前置条件:");
  console.log(`     ${apiSpecExists ? "✅" : "❌"} backend/api-spec.md`);
  console.log(`     ${pagesExists ? "✅" : "❌"} frontend/pages.md`);
  console.log("");

  // 待处理反馈
  if (feedbackItems.length > 0) {
    console.log(`  📝 待处理反馈 (${feedbackItems.length} 项):`);
    for (const item of feedbackItems) {
      const statusIcon = item.status === "open" ? "🔴" : item.status === "acknowledged" ? "🟡" : "🔵";
      console.log(`     ${statusIcon} #${item.id} [${item.priority}] ${item.desc}`);
    }
  } else {
    console.log("  ✅ 暂无待处理反馈");
  }
  console.log("");
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 查看联调状态");
  console.log("=".repeat(50) + "\n");

  // 查找工作目录
  const workDir = findWorkDir(CWD);

  const serviceInfo = loadServiceInfo(workDir);

  if (!serviceInfo) {
    console.log("  ❌ 未找到 service-info.json");
    console.log("  请先运行 /coord-start 初始化项目\n");
    return;
  }

  console.log(`  📁 工作目录: ${workDir}\n`);

  // 查找所有需求目录
  const reqDirs = findAllReqDirs(workDir);

  if (reqDirs.length === 0) {
    console.log("  ❌ 未找到任何需求目录");
    console.log("  请先运行 /coord-start 初始化项目\n");
    return;
  }

  // 如果只有一个需求，直接显示
  if (reqDirs.length === 1) {
    displayStatus(workDir, reqDirs[0]);
    return;
  }

  // 多个需求，让用户选择
  const choices = reqDirs.map(req => ({
    name: `📋 ${req}`,
    value: req
  }));

  const { selectedReq } = await prompt([
    {
      type: "list",
      name: "selectedReq",
      message: "请选择需求:",
      choices,
    },
  ]);

  displayStatus(workDir, selectedReq);
}

main().catch(console.error);