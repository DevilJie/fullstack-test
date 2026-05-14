#!/usr/bin/env node
/**
 * coord-test-start 交互式脚本
 * 启动自动化测试
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

function loadServiceInfo(workDir) {
  const serviceInfoPath = path.join(workDir, "service-info.json");
  if (!fs.existsSync(serviceInfoPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(serviceInfoPath, "utf-8"));
}

function checkPrerequisites(workDir, reqId) {
  const reqPath = path.join(workDir, reqId);
  const results = [];

  // backend/api-spec.md
  const apiSpecExists = fs.existsSync(path.join(reqPath, "backend", "api-spec.md"));
  results.push({
    name: "backend/api-spec.md",
    ok: apiSpecExists,
    msg: apiSpecExists ? "✅ 已就绪" : "❌ 缺失"
  });

  // frontend/pages.md
  const pagesExists = fs.existsSync(path.join(reqPath, "frontend", "pages.md"));
  results.push({
    name: "frontend/pages.md",
    ok: pagesExists,
    msg: pagesExists ? "✅ 已就绪" : "❌ 缺失"
  });

  // service-info.json API rules
  const serviceInfo = loadServiceInfo(workDir);
  const hasApiRules = serviceInfo &&
                      serviceInfo.backend &&
                      serviceInfo.backend.api_success_code !== undefined &&
                      serviceInfo.backend.response_data_field;

  results.push({
    name: "API 判断规则",
    ok: !!hasApiRules,
    msg: hasApiRules
      ? `✅ api_success_code=${serviceInfo.backend.api_success_code}, data=${serviceInfo.backend.response_data_field}`
      : "❌ 缺失（请先运行 /coord-backend-config 配置）"
  });

  // backend status
  const backendReady = serviceInfo && serviceInfo.backend && serviceInfo.backend.status === "ready";
  results.push({
    name: "backend.status",
    ok: !!backendReady,
    msg: backendReady ? "✅ ready" : `❌ ${serviceInfo?.backend?.status || "unknown"}`
  });

  // frontend status
  const frontendReady = serviceInfo && serviceInfo.frontend && serviceInfo.frontend.status === "ready";
  results.push({
    name: "frontend.status",
    ok: !!frontendReady,
    msg: frontendReady ? "✅ ready" : `❌ ${serviceInfo?.frontend?.status || "unknown"}`
  });

  return results;
}

function displayPrerequisites(results) {
  console.log("\n" + "=".repeat(50));
  console.log("  🔍 前置条件检查");
  console.log("=".repeat(50) + "\n");

  for (const r of results) {
    console.log(`  ${r.msg} - ${r.name}`);
  }
  console.log("");
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 启动测试");
  console.log("=".repeat(50) + "\n");

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
    console.log("  ❌ 未找到任何需求目录\n");
    return;
  }

  // 让用户选择需求
  let selectedReq;
  if (reqDirs.length === 1) {
    selectedReq = reqDirs[0];
  } else {
    const { req } = await prompt([
      {
        type: "list",
        name: "req",
        message: "请选择需求:",
        choices: reqDirs.map(req => ({ name: `📋 ${req}`, value: req })),
      },
    ]);
    selectedReq = req;
  }

  // 检查前置条件
  const prereqs = checkPrerequisites(workDir, selectedReq);
  displayPrerequisites(prereqs);

  // 检查是否全部通过
  const allPassed = prereqs.every(r => r.ok);

  if (!allPassed) {
    const missingRules = prereqs.find(r => r.name === "API 判断规则" && !r.ok);
    if (missingRules) {
      console.log("  ❌ service-info.json 中缺少 API 成功判断规则");
      console.log("  后端需要先通过 /coord-backend-config 配置以下字段:");
      console.log("  - api_success_code（成功响应 code 值）");
      console.log("  - response_data_field（数据字段名）");
      console.log("  - response_code_field（状态码字段名）");
      console.log("\n  请先完成配置，再运行 /coord-test-start\n");
      return;
    }

    console.log("  ❌ 前置条件未满足，无法启动测试\n");
    return;
  }

  // 全部通过，提示可以启动测试
  console.log("  ✅ 前置条件全部满足！");
  console.log("\n  📝 测试启动说明:");
  console.log("  请在 Claude Code 中运行 /coord-test-start 来启动自动化测试");
  console.log("  或使用 Playwright 脚本来执行测试\n");

  console.log("  📋 测试将覆盖:");
  console.log("  - 页面加载测试");
  console.log("  - API 数据完整性测试");
  console.log("  - 点击交互测试\n");
}

main().catch(console.error);