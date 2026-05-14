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

async function createProject(projectRoot, reqId) {
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

  // service-info.json - 放在项目根目录（所有需求共享）
  const serviceInfo = {
    created_at: new Date().toISOString(),
    backend: {
      url: "http://localhost:8080",
      health_url: "http://localhost:8080/health",
      api_success_code: 0,
      response_data_field: "data",
      response_code_field: "code",
      response_msg_field: "msg",
      status: "pending",
    },
    frontend: {
      url: "http://localhost:5173",
      status: "pending",
    },
    testing: {
      status: "pending",
    },
  };

  // 放在项目根目录
  const serviceInfoPath = path.join(projectRoot, "service-info.json");
  fs.writeFileSync(serviceInfoPath, JSON.stringify(serviceInfo, null, 2), "utf-8");

  // README.md - 放在需求目录下
  const readmeContent = `# ${reqId} 联调测试协调手册

## 项目信息
- 项目根目录: ${projectRoot}
- 需求编号: ${reqId}
- 服务配置: ${projectRoot}/service-info.json

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
- ${projectRoot}/service-info.json - 服务配置（项目级，所有需求共享）
- feedback.md - 问题追踪
- closed.md - 已关闭问题
`;

  fs.writeFileSync(path.join(projectPath, "README.md"), readmeContent, "utf-8");

  // feedback.md - 放在需求目录下
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

  // Step 3: 选择角色
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

  // Step 4: 根据角色输入服务 URL
  let serviceUrl = "";
  if (role === "backend") {
    const { url } = await prompt([
      {
        type: "input",
        name: "url",
        message: "🔗  请输入后端服务 URL:",
        default: "http://localhost:8080",
      },
    ]);
    serviceUrl = url;
  } else if (role === "frontend") {
    const { url } = await prompt([
      {
        type: "input",
        name: "url",
        message: "🔗  请输入前端服务 URL:",
        default: "http://localhost:5173",
      },
    ]);
    serviceUrl = url;
  }

  // Create project
  try {
    const { serviceInfoPath } = await createProject(projectRoot, reqId);

    // Update service-info.json with URL if provided (放在项目根目录)
    if (serviceUrl) {
      const info = JSON.parse(fs.readFileSync(serviceInfoPath, "utf-8"));
      if (role === "backend") {
        info.backend.url = serviceUrl;
      } else if (role === "frontend") {
        info.frontend.url = serviceUrl;
      }
      fs.writeFileSync(serviceInfoPath, JSON.stringify(info, null, 2), "utf-8");
    }

    console.log("\n" + "=".repeat(50));
    console.log("  ✅ 项目初始化完成！");
    console.log("=".repeat(50));
    console.log(`\n  📂 项目根目录: ${projectRoot}`);
    console.log(`  📋 需求目录: ${projectPath}`);
    console.log(`  📄 服务配置: ${serviceInfoPath}`);
    console.log(`  👤 角色: ${role}`);
    if (serviceUrl) {
      console.log(`  🔗 服务 URL: ${serviceUrl}`);
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