#!/usr/bin/env node
/**
 * coord-backend-config 交互式脚本
 * 后端服务配置管理
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

function loadServiceInfo(workDir) {
  const serviceInfoPath = path.join(workDir, "service-info.json");
  if (!fs.existsSync(serviceInfoPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(serviceInfoPath, "utf-8"));
}

function saveServiceInfo(workDir, serviceInfo) {
  const serviceInfoPath = path.join(workDir, "service-info.json");
  fs.writeFileSync(serviceInfoPath, JSON.stringify(serviceInfo, null, 2), "utf-8");
}

function displayConfig(serviceInfo) {
  console.log("\n" + "=".repeat(50));
  console.log("  🔧 后端服务配置");
  console.log("=".repeat(50) + "\n");

  console.log(`  url: ${serviceInfo.backend?.url || "未设置"}`);
  console.log(`  health_url: ${serviceInfo.backend?.health_url || "未设置"}`);
  console.log(`  api_doc_url: ${serviceInfo.backend?.api_doc_url || "未设置"}`);
  console.log(`  api_success_code: ${serviceInfo.backend?.api_success_code ?? "未设置"}`);
  console.log(`  api_fail_codes: ${JSON.stringify(serviceInfo.backend?.api_fail_codes || [])}`);
  console.log(`  response_data_field: ${serviceInfo.backend?.response_data_field || "未设置"}`);
  console.log(`  response_code_field: ${serviceInfo.backend?.response_code_field || "未设置"}`);
  console.log(`  response_msg_field: ${serviceInfo.backend?.response_msg_field || "未设置"}`);
  console.log(`  timeout_ms: ${serviceInfo.backend?.timeout_ms || "未设置"}`);
  console.log(`  status: ${serviceInfo.backend?.status || "unknown"}`);
  console.log("");
}

async function editConfig(serviceInfo) {
  const backend = serviceInfo.backend || {};

  const fields = [
    { name: "url", label: "后端服务 URL", default: backend.url || "http://localhost:8080" },
    { name: "health_url", label: "健康检查 URL", default: backend.health_url || "http://localhost:8080/health" },
    { name: "api_doc_url", label: "API 文档 URL", default: backend.api_doc_url || "" },
    { name: "api_success_code", label: "成功 code 值", default: String(backend.api_success_code ?? 0) },
    { name: "response_data_field", label: "数据字段名", default: backend.response_data_field || "data" },
    { name: "response_code_field", label: "状态码字段名", default: backend.response_code_field || "code" },
    { name: "response_msg_field", label: "消息字段名", default: backend.response_msg_field || "msg" },
    { name: "timeout_ms", label: "超时毫秒", default: String(backend.timeout_ms || 5000) },
  ];

  const updates = {};

  for (const field of fields) {
    const { value } = await prompt([
      {
        type: "input",
        name: "value",
        message: `${field.label}:`,
        default: field.default,
      },
    ]);
    updates[field.name] = value;
  }

  return updates;
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 后端配置");
  console.log("=".repeat(50) + "\n");

  const workDir = findWorkDir(CWD);
  const serviceInfo = loadServiceInfo(workDir);

  if (!serviceInfo) {
    console.log("  ❌ 未找到 service-info.json");
    console.log("  请先运行 /coord-start 初始化项目\n");
    return;
  }

  console.log(`  📁 工作目录: ${workDir}\n`);

  // 显示当前配置
  displayConfig(serviceInfo);

  // 选择操作
  const { action } = await prompt([
    {
      type: "list",
      name: "action",
      message: "请选择操作:",
      choices: [
        { name: "📝 修改配置", value: "edit" },
        { name: "✅ 标记 ready", value: "ready" },
        { name: "❌ 取消", value: "cancel" },
      ],
    },
  ]);

  if (action === "cancel") {
    console.log("\n  已取消。\n");
    return;
  }

  if (action === "ready") {
    serviceInfo.backend.status = "ready";
    saveServiceInfo(workDir, serviceInfo);
    console.log("\n  ✅ 已将 backend.status 设为 ready\n");
    return;
  }

  if (action === "edit") {
    const updates = await editConfig(serviceInfo);

    // 更新配置
    serviceInfo.backend = serviceInfo.backend || {};
    for (const [key, value] of Object.entries(updates)) {
      if (key === "api_success_code" || key === "timeout_ms") {
        serviceInfo.backend[key] = parseInt(value, 10);
      } else {
        serviceInfo.backend[key] = value;
      }
    }

    saveServiceInfo(workDir, serviceInfo);
    console.log("\n  ✅ 配置已保存\n");
    displayConfig(serviceInfo);
  }
}

main().catch(console.error);