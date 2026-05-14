#!/usr/bin/env node
/**
 * coord-start 交互式初始化脚本
 * 使用 inquirer 提供终端菜单式交互
 *
 * 用法: node start.js
 */

const fs = require("fs");
const path = require("path");

const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();

const CWD = process.cwd();

function createServiceInfo(projectRoot, reqId, useProjectLevel, customServiceInfo) {
  // service-info.json 放在项目根目录
  const serviceInfoPath = path.join(projectRoot, "service-info.json");

  let serviceInfo;

  if (useProjectLevel && fs.existsSync(serviceInfoPath)) {
    // 沿用项目级配置
    serviceInfo = JSON.parse(fs.readFileSync(serviceInfoPath, "utf-8"));
    // 添加 requirement_id 标记
    serviceInfo.requirement_id = reqId;
    // 将 backend/frontend/testing 状态重置为 pending（新需求开始）
    serviceInfo.backend.status = "pending";
    serviceInfo.frontend.status = "pending";
    serviceInfo.testing.status = "pending";
  } else {
    // 创建新配置（项目级或需求级）
    serviceInfo = {
      requirement_id: reqId,
      created_at: new Date().toISOString(),
      backend: {
        url: customServiceInfo?.backend?.url || "http://localhost:8080",
        health_url: customServiceInfo?.backend?.health_url || "http://localhost:8080/health",
        api_doc_url: customServiceInfo?.backend?.api_doc_url || "",
        api_success_code: customServiceInfo?.backend?.api_success_code ?? 0,
        api_fail_codes: customServiceInfo?.backend?.api_fail_codes || [],
        response_data_field: customServiceInfo?.backend?.response_data_field || "data",
        response_code_field: customServiceInfo?.backend?.response_code_field || "code",
        response_msg_field: customServiceInfo?.backend?.response_msg_field || "msg",
        timeout_ms: customServiceInfo?.backend?.timeout_ms || 5000,
        status: "pending",
      },
      frontend: {
        url: customServiceInfo?.frontend?.url || "http://localhost:5173",
        status: "pending",
      },
      testing: {
        status: "pending",
      },
    };
  }

  return serviceInfo;
}

async function createProject(projectRoot, reqId, useProjectLevel, serviceInfo) {
  const projectPath = path.join(projectRoot, reqId);

  // Create directories
  const dirs = [
    path.join(projectPath, "backend"),
    path.join(projectPath, "frontend"),
    path.join(projectPath, "testing", "reports"),
  ];

  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  // service-info.json - 根据 useProjectLevel 决定位置
  let serviceInfoPath;
  if (useProjectLevel) {
    // 放在项目根目录
    serviceInfoPath = path.join(projectRoot, "service-info.json");
    // 更新项目级配置
    fs.writeFileSync(serviceInfoPath, JSON.stringify(serviceInfo, null, 2), "utf-8");
  } else {
    // 放在需求目录下
    serviceInfoPath = path.join(projectPath, "service-info.json");
    fs.writeFileSync(serviceInfoPath, JSON.stringify(serviceInfo, null, 2), "utf-8");
  }

  // README.md - 放在需求目录下
  const configNote = useProjectLevel
    ? `服务配置: ${projectRoot}/service-info.json (项目级，所有需求共享)`
    : `服务配置: ${projectPath}/service-info.json (需求级，独立配置)`;

  const readmeContent = `# ${reqId} 联调测试协调手册

## 项目信息
- 项目根目录: ${projectRoot}
- 需求编号: ${reqId}
- ${configNote}

## 角色
- 后端开发 (backend)
- 前端开发 (frontend)
- 测试 (testing)

## 命令
- \`/coord-start\` - 初始化项目
- \`/coord-status\` - 查看状态
- \`/coord-poll\` - 轮询反馈
- \`/coord-test-start\` - 启动测试
- \`/coord-resolve\` - 关闭问题
- \`/coord-done\` - 完成联调
- \`/coord-backend-config\` - 后端配置

## 文件
- service-info.json - 服务配置（${useProjectLevel ? "项目级" : "需求级"}）
- feedback.md - 问题追踪
- closed.md - 已关闭问题
`;

  fs.writeFileSync(path.join(projectPath, "README.md"), readmeContent, "utf-8");

  // feedback.md
  fs.writeFileSync(
    path.join(projectPath, "feedback.md"),
    `# Feedback Log - ${reqId}\n\n## Items\n\n`,
    "utf-8"
  );

  return { projectPath, serviceInfoPath };
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 初始化联调项目");
  console.log("=".repeat(50) + "\n");

  // Step 1: 选择项目根目录
  const { useCurrentDir } = await prompt([
    {
      type: "list",
      name: "useCurrentDir",
      message: "📁 项目根目录:",
      default: 0,
      choices: [
        { name: `✅ 使用当前目录: ${CWD}`, value: true },
        { name: "❌ 输入自定义目录", value: false },
      ],
    },
  ]);

  let projectRoot = CWD;

  if (!useCurrentDir) {
    const { dirPath } = await prompt([
      {
        type: "input",
        name: "dirPath",
        message: "请输入项目根目录路径:",
        validate: (input) => {
          if (!input.trim()) return "路径不能为空";
          return true;
        },
      },
    ]);
    projectRoot = dirPath.trim();
  }

  // 检查项目根目录是否已有 service-info.json
  const projectServiceInfo = path.join(projectRoot, "service-info.json");
  const hasProjectServiceInfo = fs.existsSync(projectServiceInfo);

  // Step 2: 输入需求编号
  const { reqId } = await prompt([
    {
      type: "input",
      name: "reqId",
      message: "🏷️  请输入需求编号:",
      default: "REQ-001",
      validate: (input) => {
        if (!input.trim()) return "需求编号不能为空";
        return true;
      },
    },
  ]);

  const projectPath = path.join(projectRoot, reqId);

  if (fs.existsSync(projectPath)) {
    const { overwrite } = await prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `⚠️  目录已存在: ${projectPath}，是否覆盖?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log("已取消。");
      return;
    }
  }

  // Step 3: 选择服务配置策略（仅当项目已有 service-info.json 时）
  let useProjectLevel = true;
  let serviceInfo;

  if (hasProjectServiceInfo) {
    console.log(`\n${"=".repeat(50)}`);
    console.log("  📋 检测到项目级服务配置");
    console.log("=".repeat(50));
    console.log(`  位置: ${projectServiceInfo}`);

    const projectInfo = JSON.parse(fs.readFileSync(projectServiceInfo, "utf-8"));
    console.log(`  后端 URL: ${projectInfo.backend?.url || "未设置"}`);
    console.log(`  前端 URL: ${projectInfo.frontend?.url || "未设置"}`);

    const { configStrategy } = await prompt([
      {
        type: "list",
        name: "configStrategy",
        message: "🔧 需求目录的服务配置策略:",
        default: 0,
        choices: [
          { name: "✅ 沿用项目级配置（推荐） - 所有需求共用同一份配置", value: "project" },
          { name: "📝 创建独立配置 - 本需求使用单独的 service-info.json", value: "independent" },
        ],
      },
    ]);

    useProjectLevel = configStrategy === "project";

    if (useProjectLevel) {
      serviceInfo = createServiceInfo(projectRoot, reqId, true, null);
    } else {
      // 读取项目配置作为默认值，让用户可以自定义
      const defaultInfo = JSON.parse(fs.readFileSync(projectServiceInfo, "utf-8"));
      serviceInfo = createServiceInfo(projectRoot, reqId, false, defaultInfo);
    }
  } else {
    // 没有项目级配置，创建新的（作为项目级）
    serviceInfo = createServiceInfo(projectRoot, reqId, true, null);
  }

  // Step 4: 选择角色
  const { role } = await prompt([
    {
      type: "list",
      name: "role",
      message: "👤  请选择你的角色:",
      choices: [
        {
          name: "🔧 后端开发 (backend) - 配置 API 规则，提供接口文档",
          value: "backend",
        },
        {
          name: "🎨 前端开发 (frontend) - 对接后端 API，实现页面功能",
          value: "frontend",
        },
        {
          name: "🧪 测试 (testing) - 执行自动化测试，验证前后端集成",
          value: "testing",
        },
      ],
    },
  ]);

  // Step 5: 根据角色输入服务 URL
  if (role === "backend") {
    const { url } = await prompt([
      {
        type: "input",
        name: "url",
        message: "🔗  请输入后端服务 URL:",
        default: serviceInfo.backend.url,
      },
    ]);
    serviceInfo.backend.url = url;
  } else if (role === "frontend") {
    const { url } = await prompt([
      {
        type: "input",
        name: "url",
        message: "🔗  请输入前端服务 URL:",
        default: serviceInfo.frontend.url,
      },
    ]);
    serviceInfo.frontend.url = url;
  }

  // Step 6: 后端需要配置 API 规则
  if (role === "backend") {
    console.log("\n  🔧 API 成功判断规则配置:");

    const { api_success_code } = await prompt([
      {
        type: "input",
        name: "api_success_code",
        message: "  成功响应的 code 值:",
        default: String(serviceInfo.backend.api_success_code),
      },
    ]);

    const { response_data_field } = await prompt([
      {
        type: "input",
        name: "response_data_field",
        message: "  数据字段名 (data):",
        default: serviceInfo.backend.response_data_field,
      },
    ]);

    const { response_code_field } = await prompt([
      {
        type: "input",
        name: "response_code_field",
        message: "  状态码字段名 (code):",
        default: serviceInfo.backend.response_code_field,
      },
    ]);

    serviceInfo.backend.api_success_code = parseInt(api_success_code, 10) || 0;
    serviceInfo.backend.response_data_field = response_data_field || "data";
    serviceInfo.backend.response_code_field = response_code_field || "code";
  }

  // Create project
  try {
    const { serviceInfoPath } = await createProject(projectRoot, reqId, useProjectLevel, serviceInfo);

    console.log("\n" + "=".repeat(50));
    console.log("  ✅ 项目初始化完成！");
    console.log("=".repeat(50));
    console.log(`\n  📂 项目根目录: ${projectRoot}`);
    console.log(`  📋 需求目录: ${projectPath}`);
    console.log(`  📄 服务配置: ${serviceInfoPath}`);
    console.log(`  🔧 配置策略: ${useProjectLevel ? "项目级（所有需求共享）" : "需求级（独立配置）"}`);
    console.log(`  👤 角色: ${role}`);
    if (serviceInfo.backend.url) {
      console.log(`  🔗 后端 URL: ${serviceInfo.backend.url}`);
    }
    if (serviceInfo.frontend.url) {
      console.log(`  🔗 前端 URL: ${serviceInfo.frontend.url}`);
    }
    if (role === "backend") {
      console.log(`  ✅ API 成功判断: code=${serviceInfo.backend.api_success_code}, data=${serviceInfo.backend.response_data_field}`);
    }
    console.log("\n" + "-".repeat(50));
    console.log("  下一步:");
    console.log("  1. 后端配置 API 规则: /coord-backend-config");
    console.log("  2. 查看状态: /coord-status");
    console.log("  3. 开始开发/测试工作");
    console.log("-".repeat(50) + "\n");
  } catch (err) {
    console.error(`\n❌ 创建失败: ${err.message}`);
  }
}

main().catch(console.error);