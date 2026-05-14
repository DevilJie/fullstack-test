#!/usr/bin/env node
/**
 * coord-resolve 交互式脚本
 * 标记反馈问题已解决
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
    return { items: [], content: "" };
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
        assignee: "",
        resolution: "",
        line: 0
      };
      currentItem.line = lines.indexOf(line);
    } else if (line.includes("[acknowledged]")) {
      if (currentItem) currentItem.status = "acknowledged";
    } else if (line.includes("[in_progress]")) {
      if (currentItem) currentItem.status = "in_progress";
    } else if (line.includes("[resolved]")) {
      if (currentItem) currentItem.status = "resolved";
    } else if (line.includes("assignee:")) {
      const assigneeMatch = line.match(/assignee:\s*(\w+)/);
      if (assigneeMatch && currentItem) {
        currentItem.assignee = assigneeMatch[1];
      }
    }
  }
  if (currentItem) items.push(currentItem);
  return { items, content };
}

function updateFeedbackContent(content, itemId, newStatus, resolution) {
  const lines = content.split("\n");
  const updatedLines = [];

  for (const line of lines) {
    const itemMatch = line.match(/^-\s+\[#(\d+)\]/);
    if (itemMatch && itemMatch[1] === itemId) {
      // 找到目标行，更新状态
      updatedLines.push(line.replace(/\[(\w+)\]/, `[${newStatus}]`));
      // 添加解决方案
      if (resolution) {
        updatedLines.push(`  resolution: ${resolution}`);
      }
    } else {
      updatedLines.push(line);
    }
  }

  return updatedLines.join("\n");
}

async function selectIssue(items) {
  if (items.length === 0) {
    console.log("  ❌ 没有可关闭的问题\n");
    return null;
  }

  const choices = items
    .filter(item => item.status === "resolved")
    .map(item => ({
      name: `#${item.id} [${item.status}] ${item.desc.substring(0, 40)}...`,
      value: item.id
    }));

  if (choices.length === 0) {
    console.log("  ❌ 没有状态为 resolved 的问题可以关闭");
    console.log("  只有状态为 resolved（对方已修复，等待验证）的问题才能关闭\n");
    return null;
  }

  const { selectedId } = await prompt([
    {
      type: "list",
      name: "selectedId",
      message: "请选择要关闭的问题:",
      choices,
    },
  ]);

  return selectedId;
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 关闭问题");
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

  // 收集所有 resolved 状态的问题
  let allResolvedItems = [];
  for (const reqId of reqDirs) {
    const reqPath = path.join(workDir, reqId);
    const { items } = loadFeedback(reqPath);
    allResolvedItems = allResolvedItems.concat(
      items.filter(item => item.status === "resolved").map(item => ({ ...item, reqId }))
    );
  }

  if (allResolvedItems.length === 0) {
    console.log("  ❌ 没有状态为 resolved 的问题");
    console.log("  只有状态为 resolved（对方已修复，等待验证）的问题才能关闭\n");
    return;
  }

  // 显示所有可关闭的问题
  console.log(`  找到 ${allResolvedItems.length} 个可关闭的问题:\n`);
  for (const item of allResolvedItems) {
    console.log(`  📋 ${item.reqId}/#${item.id} [${item.status}] ${item.desc}`);
  }
  console.log("");

  // 选择要关闭的问题
  const { selectedReq } = await prompt([
    {
      type: "list",
      name: "selectedReq",
      message: "请选择需求:",
      choices: reqDirs.map(req => ({ name: `📋 ${req}`, value: req })),
    },
  ]);

  const reqPath = path.join(workDir, selectedReq);
  const { items, content } = loadFeedback(reqPath);

  const selectedId = await selectIssue(items);
  if (!selectedId) return;

  // 询问解决方案
  const { resolution } = await prompt([
    {
      type: "input",
      name: "resolution",
      message: "请输入解决方案（可选）:",
      default: "",
    },
  ]);

  // 更新 feedback.md
  const newContent = updateFeedbackContent(content, selectedId, "closed", resolution);
  fs.writeFileSync(path.join(reqPath, "feedback.md"), newContent, "utf-8");

  // 追加到 closed.md
  const closedPath = path.join(reqPath, "closed.md");
  const timestamp = new Date().toISOString();
  const closedEntry = `\n- [closed] #${selectedId} [${timestamp}] ${resolution || "已验证关闭"}\n`;

  if (fs.existsSync(closedPath)) {
    fs.appendFileSync(closedPath, closedEntry, "utf-8");
  } else {
    fs.writeFileSync(closedPath, `# Closed Issues - ${selectedReq}\n${closedEntry}`, "utf-8");
  }

  console.log("\n  ✅ 问题已关闭并归档到 closed.md\n");
}

main().catch(console.error);