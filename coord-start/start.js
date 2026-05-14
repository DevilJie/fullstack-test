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

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  Fullstack Test - 初始化联调项目");
  console.log("=".repeat(50) + "\n");

  // Step 1: 工作目录
  const { workDirChoice, customWorkDir } = await prompt([
    {
      type: "list",
      name: "workDirChoice",
      message: "📁 请选择工作目录:",
      choices: [
        { name: `A. 使用当前目录: ${CWD}`, value: "current" },
        { name: "B. 自行输入其他目录", value: "custom" },
      ],
    },
  ]);

  let workDir = CWD;
  if (workDirChoice === "custom") {
    const { inputDir } = await prompt([
      {
        type: "input",
        name: "inputDir",
        message: "请输入工作目录路径:",
        default: CWD,
      },
    ]);
    workDir = inputDir.trim();
  }

  // Step 2: 需求编号
  const { reqId } = await prompt([
    {
      type: "input",
      name: "reqId",
      message: "🏷️  请输入需求编号:",
      default: "REQ-001",
    },
  ]);

  // Step 3: 检查配置策略
  const serviceInfoPath = path.join(workDir, "service-info.json");
  const hasExistingConfig = fs.existsSync(serviceInfoPath);

  let useProjectLevel = true;

  if (hasExistingConfig) {
    const existingInfo = JSON.parse(fs.readFileSync(serviceInfoPath, "utf-8"));
    console.log(`\n${"=".repeat(50)}`);
    console.log("  📋 检测到已有服务配置");
    console.log("=".repeat(50));
    console.log(`  后端 URL: ${existingInfo.backend?.url}`);
    console.log(`  前端 URL: ${existingInfo.frontend?.url}`);

    const { configStrategy } = await prompt([
      {
        type: "list",
        name: "configStrategy",
        message: "🔧 请选择配置策略:",
        choices: [
          { name: "A. 沿用已有配置（推荐）", value: "project" },
          { name: "B. 创建独立配置", value: "independent" },
        ],
      },
    ]);

    useProjectLevel = configStrategy === "project";
  }

  // Step 4: 角色
  const { role } = await prompt([
    {
      type: "list",
      name: "role",
      message: "👤 请选择你的角色:",
      choices: [
        { name: "A. 后端开发 (backend)", value: "backend" },
        { name: "B. 前端开发 (frontend)", value: "frontend" },
        { name: "C. 测试 (testing)", value: "testing" },
      ],
    },
  ]);

  // Step 5: 根据角色和配置策略配置
  let backendUrl = "http://localhost:8080";
  let frontendUrl = "http://localhost:5173";
  let apiSuccessCode = 0;
  let dataField = "data";
  let codeField = "code";

  if (!useProjectLevel || !hasExistingConfig) {
    if (role === "backend") {
      const { url, successCode, data, code } = await prompt([
        {
          type: "input",
          name: "url",
          message: "🔗 后端服务 URL:",
          default: backendUrl,
        },
        {
          type: "input",
          name: "successCode",
          message: "🔧 成功响应的 code 值:",
          default: String(apiSuccessCode),
        },
        {
          type: "input",
          name: "data",
          message: "🔧 数据字段名:",
          default: dataField,
        },
        {
          type: "input",
          name: "code",
          message: "🔧 状态码字段名:",
          default: codeField,
        },
      ]);

      backendUrl = url;
      apiSuccessCode = parseInt(successCode, 10) || 0;
      dataField = data;
      codeField = code;
    } else if (role === "frontend") {
      const { url } = await prompt([
        {
          type: "input",
          name: "url",
          message: "🔗 前端服务 URL:",
          default: frontendUrl,
        },
      ]);
      frontendUrl = url;
    }
  } else {
    if (role === "backend") {
      console.log("\n  ✅ 后端将沿用已有配置中的 URL 和 API 规则");
    } else if (role === "frontend") {
      console.log("\n  ✅ 前端将沿用已有配置中的 URL");
    }
  }

  // Step 6: 确认
  const { confirm } = await prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "确认创建项目?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log("\n  已取消。\n");
    return;
  }

  // 创建项目
  const projectPath = path.join(workDir, reqId);
  const dirs = [
    path.join(projectPath, "backend"),
    path.join(projectPath, "frontend"),
    path.join(projectPath, "testing", "reports"),
  ];

  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  // 创建或更新 service-info.json
  let finalServiceInfoPath;
  if (useProjectLevel) {
    finalServiceInfoPath = serviceInfoPath;
  } else {
    finalServiceInfoPath = path.join(projectPath, "service-info.json");
  }

  const serviceInfo = {
    requirement_id: reqId,
    created_at: new Date().toISOString(),
    backend: {
      url: backendUrl,
      health_url: `${backendUrl}/health`,
      api_success_code: apiSuccessCode,
      response_data_field: dataField,
      response_code_field: codeField,
      status: "pending",
    },
    frontend: {
      url: frontendUrl,
      status: "pending",
    },
    testing: {
      status: "pending",
    },
  };

  fs.writeFileSync(finalServiceInfoPath, JSON.stringify(serviceInfo, null, 2), "utf-8");

  // 创建 README.md
  const readmeContent = `# ${reqId} 联调测试协调手册

## 项目信息
- 工作目录: ${workDir}
- 需求编号: ${reqId}
- 服务配置: ${finalServiceInfoPath}

## 命令
- /coord-status - 查看状态
- /coord-poll - 轮询反馈
- /coord-test-start - 启动测试
- /coord-resolve - 关闭问题
- /coord-done - 完成联调
- /coord-backend-config - 后端配置
`;

  fs.writeFileSync(path.join(projectPath, "README.md"), readmeContent, "utf-8");

  // 创建 feedback.md
  fs.writeFileSync(
    path.join(projectPath, "feedback.md"),
    `# Feedback Log - ${reqId}\n\n## Items\n\n`,
    "utf-8"
  );

  console.log("\n" + "=".repeat(50));
  console.log("  ✅ 初始化完成！");
  console.log("=".repeat(50));
  console.log(`\n  📁 工作目录: ${workDir}`);
  console.log(`  📋 需求目录: ${projectPath}`);
  console.log(`  📄 服务配置: ${finalServiceInfoPath}`);
  console.log(`  👤 角色: ${role}`);
  if (role === "backend") {
    console.log(`  🔗 后端 URL: ${backendUrl}`);
    console.log(`  🔧 API 规则: code=${apiSuccessCode}, data=${dataField}`);
  } else if (role === "frontend") {
    console.log(`  🔗 前端 URL: ${frontendUrl}`);
  }
  console.log("\n" + "-".repeat(50));
  console.log("  下一步:");
  console.log("  1. /coord-backend-config - 后端配置");
  console.log("  2. /coord-status - 查看状态");
  console.log("  3. 开始开发/测试工作");
  console.log("-".repeat(50) + "\n");
}

main().catch(console.error);