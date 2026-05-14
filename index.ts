import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import * as fs from "node:fs";
import * as path from "node:path";

// ============================================================
// 核心逻辑（共享给 tools 和 commands）
// ============================================================

interface ServiceInfo {
  requirement_id: string;
  created_at: string;
  backend: {
    url: string;
    health_url: string;
    api_doc_url?: string;
    api_success_code: number;
    api_fail_codes?: number[];
    response_data_field: string;
    response_code_field: string;
    response_msg_field: string;
    timeout_ms?: number;
    status: string;
  };
  frontend: {
    url: string;
    status: string;
  };
  testing: {
    status: string;
  };
}

interface FeedbackItem {
  id: string;
  assignee: string;
  from: string;
  priority: string;
  status: string;
  title: string;
  description?: string;
  related?: string;
  needed?: string;
  created_at: string;
  resolved_at?: string;
  resolution?: string;
}

// 查找项目目录（需求编号目录）
function findProjectDir(cwd: string, reqId?: string): string | null {
  if (reqId) {
    const dir = path.join(cwd, reqId);
    if (fs.existsSync(dir)) return dir;
  }
  // 扫描当前目录下的目录，找最可能的
  try {
    const entries = fs.readdirSync(cwd, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory() && e.name.match(/^(REQ|req|26RM|26rm)/));
    if (dirs.length === 1) return path.join(cwd, dirs[0].name);
    if (dirs.length > 1) return path.join(cwd, dirs[0].name); // 取第一个
  } catch {}
  return null;
}

// 加载 service-info.json
function loadServiceInfo(projectDir: string): ServiceInfo | null {
  const file = path.join(projectDir, "service-info.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

// 保存 service-info.json
function saveServiceInfo(projectDir: string, info: ServiceInfo): void {
  const file = path.join(projectDir, "service-info.json");
  fs.writeFileSync(file, JSON.stringify(info, null, 2), "utf-8");
}

// 加载 feedback.md
function loadFeedback(projectDir: string): FeedbackItem[] {
  const file = path.join(projectDir, "feedback.md");
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, "utf-8");
  return parseFeedback(content);
}

// 解析 feedback.md 内容
function parseFeedback(content: string): FeedbackItem[] {
  const items: FeedbackItem[] = [];
  const itemMatches = content.match(/### #(\d+) - (.+?)(?=\n### #|\n## Items|$)/gs);
  if (!itemMatches) return [];

  for (const match of itemMatches) {
    const idMatch = match.match(/^### #(\d+)/);
    if (!idMatch) continue;
    const id = idMatch[1];
    const titleMatch = match.match(/^### #\d+ - (.+)$/m);
    const title = titleMatch ? titleMatch[1] : "";
    const assigneeMatch = match.match(/\*\*assignee\*\*:\s*(.+)/);
    const fromMatch = match.match(/\*\*from\*\*:\s*(.+)/);
    const priorityMatch = match.match(/\*\*priority\*\*:\s*(.+)/);
    const statusMatch = match.match(/\*\*status\*\*:\s*(.+)/);
    const descMatch = match.match(/\*\*description\*\*:\s*(.+)/);
    const relatedMatch = match.match(/\*\*related\*\*:\s*(.+)/);
    const neededMatch = match.match(/\*\*needed\*\*:\s*(.+)/);
    const createdMatch = match.match(/\*\*created_at\*\*:\s*(.+)/);
    const resolvedMatch = match.match(/\*\*resolved_at\*\*:\s*(.+)/);
    const resolutionMatch = match.match(/\*\*resolution\*\*:\s*(.+)/);

    items.push({
      id,
      title,
      assignee: assigneeMatch ? assigneeMatch[1].trim() : "",
      from: fromMatch ? fromMatch[1].trim() : "",
      priority: priorityMatch ? priorityMatch[1].trim() : "",
      status: statusMatch ? statusMatch[1].trim() : "",
      description: descMatch ? descMatch[1].trim() : "",
      related: relatedMatch ? relatedMatch[1].trim() : "",
      needed: neededMatch ? neededMatch[1].trim() : "",
      created_at: createdMatch ? createdMatch[1].trim() : "",
      resolved_at: resolvedMatch ? resolvedMatch[1].trim() : "",
      resolution: resolutionMatch ? resolutionMatch[1].trim() : "",
    });
  }
  return items;
}

// 保存 feedback.md
function saveFeedback(projectDir: string, items: FeedbackItem[]): void {
  const file = path.join(projectDir, "feedback.md");
  const reqIdMatch = path.basename(projectDir).match(/^(REQ|req|26RM|26rm[\w-]+)/i);
  const reqId = reqIdMatch ? reqIdMatch[0].toUpperCase() : path.basename(projectDir);

  let content = `# Feedback Log - ${reqId}\n\n## Items\n\n`;
  content += "| # | assignee | from | priority | status | title |\n";
  content += "|---|----------|------|----------|--------|-------|\n";

  for (const item of items) {
    content += `| ${item.id} | ${item.assignee} | ${item.from} | ${item.priority} | ${item.status} | ${item.title} |\n`;
  }

  for (const item of items) {
    content += `\n### #${item.id} - ${item.title}\n`;
    content += `**assignee**: ${item.assignee}\n`;
    content += `**from**: ${item.from}\n`;
    content += `**priority**: ${item.priority}\n`;
    content += `**status**: ${item.status}\n`;
    content += `**title**: ${item.title}\n`;
    if (item.description) content += `**description**: ${item.description}\n`;
    if (item.related) content += `**related**: ${item.related}\n`;
    if (item.needed) content += `**needed**: ${item.needed}\n`;
    content += `**created_at**: ${item.created_at}\n`;
    if (item.resolved_at) content += `**resolved_at**: ${item.resolved_at}\n`;
    if (item.resolution) content += `**resolution**: ${item.resolution}\n`;
  }

  fs.writeFileSync(file, content, "utf-8");
}

// 追加到 closed.md
function appendClosed(projectDir: string, item: FeedbackItem): void {
  const file = path.join(projectDir, "closed.md");
  const reqIdMatch = path.basename(projectDir).match(/^(REQ|req|26RM|26rm[\w-]+)/i);
  const reqId = reqIdMatch ? reqIdMatch[0].toUpperCase() : path.basename(projectDir);

  let exists = fs.existsSync(file);
  let content = "";

  if (!exists) {
    content = `# Closed Issues - ${reqId}\n\n## Items\n\n`;
    content += "| # | assignee | from | priority | resolved_at | title |\n";
    content += "|---|----------|------|----------|-------------|-------|\n";
  }

  content += `| ${item.id} | ${item.assignee} | ${item.from} | ${item.priority} | ${item.resolved_at || ""} | ${item.title} |\n`;

  content += `\n### #${item.id} - ${item.title}\n`;
  content += `**assignee**: ${item.assignee}\n`;
  content += `**from**: ${item.from}\n`;
  content += `**priority**: ${item.priority}\n`;
  content += `**title**: ${item.title}\n`;
  if (item.description) content += `**description**: ${item.description}\n`;
  if (item.related) content += `**related**: ${item.related}\n`;
  content += `**created_at**: ${item.created_at}\n`;
  if (item.resolved_at) content += `**resolved_at**: ${item.resolved_at}\n`;
  if (item.resolution) content += `**resolution**: ${item.resolution}\n`;

  if (exists) {
    fs.appendFileSync(file, content, "utf-8");
  } else {
    fs.writeFileSync(file, content, "utf-8");
  }
}

// 创建初始目录结构
function createProjectStructure(projectDir: string, reqId: string): void {
  const dirs = [
    path.join(projectDir, "backend"),
    path.join(projectDir, "frontend"),
    path.join(projectDir, "testing", "reports"),
  ];
  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  // 初始化 service-info.json
  const serviceInfo: ServiceInfo = {
    requirement_id: reqId,
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
  saveServiceInfo(projectDir, serviceInfo);

  // 初始化 feedback.md
  saveFeedback(projectDir, []);

  // 初始化 README.md
  const readme = `# ${reqId} 联调测试协调手册

## 角色
- 后端开发 (backend)
- 前端开发 (frontend)
- 测试 (testing)

## 命令
- \`/coord-start\` - 初始化项目
- \`/coord-status\` - 查看状态
- \`/coord-poll\` - 轮询反馈
- \`/coord-test-start\` - 启动测试
- \`/coord-resolve <编号>\` - 关闭问题
- \`/coord-done\` - 完成联调
- \`/coord-backend-config\` - 后端配置

## 文件
- service-info.json - 服务配置
- feedback.md - 问题追踪
- closed.md - 已关闭问题
`;
  fs.writeFileSync(path.join(projectDir, "README.md"), readme, "utf-8");
}

// ============================================================
// 工具/命令执行函数
// ============================================================

async function handleCoordStart(params: {
  projectDir?: string;
  reqId?: string;
  role?: string;
}, cwd: string): Promise<string> {
  const projectDir = params.projectDir
    ? path.join(cwd, params.projectDir)
    : cwd;
  const reqId = params.reqId;
  const role = params.role;

  if (!reqId) {
    return `[coord-start] 需要参数 reqId（需求编号）\n\n请提供需求编号，例如：/coord-start --reqId REQ-001`;
  }

  const fullPath = path.join(projectDir, reqId);

  if (!fs.existsSync(fullPath)) {
    createProjectStructure(fullPath, reqId);
    return `[coord-start] ✅ 项目已初始化\n\n目录：${fullPath}\n\n请补充以下信息：\n1. 后端：backend/spec.md、backend/plan.md、backend/api-spec.md\n2. 前端：frontend/spec.md、frontend/plan.md、frontend/pages.md\n3. 更新 service-info.json 中的 URL 和 API 判断规则`;
  }

  return `[coord-start] 项目已存在：${fullPath}\n\n当前状态请使用 /coord-status 查看`;
}

async function handleCoordStatus(params: object, cwd: string): Promise<string> {
  const projectDir = findProjectDir(cwd);
  if (!projectDir) {
    return `[coord-status] 未找到项目目录\n\n请先运行 /coord-start 初始化项目，或确认当前目录结构`;
  }

  const serviceInfo = loadServiceInfo(projectDir);
  if (!serviceInfo) {
    return `[coord-status] 未找到 service-info.json\n\n请确认目录结构是否正确`;
  }

  const feedback = loadFeedback(projectDir);
  const reqId = serviceInfo.requirement_id;

  let status = `=== ${reqId} 联调状态 ===\n\n`;
  status += `服务就绪:\n`;
  status += `${serviceInfo.backend.status === "ready" ? "✅" : "⚠️"} backend: ${serviceInfo.backend.url} (${serviceInfo.backend.status})\n`;
  status += `${serviceInfo.frontend.status === "ready" ? "✅" : "⚠️"} frontend: ${serviceInfo.frontend.url} (${serviceInfo.frontend.status})\n`;
  status += `${serviceInfo.testing.status === "running" ? "🔄" : serviceInfo.testing.status === "completed" ? "✅" : "⏳"} testing: ${serviceInfo.testing.status}\n`;

  // API 判断规则
  if (serviceInfo.backend.api_success_code !== undefined) {
    status += `\nAPI 判断规则:\n`;
    status += `✅ 成功 code: ${serviceInfo.backend.api_success_code}\n`;
    status += `✅ data 字段: ${serviceInfo.backend.response_data_field}\n`;
    status += `✅ code 字段: ${serviceInfo.backend.response_code_field}\n`;
  } else {
    status += `\n❌ API 判断规则: 未配置\n`;
  }

  // 前置条件
  const apiSpecExists = fs.existsSync(path.join(projectDir, "backend", "api-spec.md"));
  const pagesExists = fs.existsSync(path.join(projectDir, "frontend", "pages.md"));
  status += `\n前置条件:\n`;
  status += `${apiSpecExists ? "✅" : "❌"} backend/api-spec.md ${apiSpecExists ? "已就绪" : "不存在"}\n`;
  status += `${pagesExists ? "✅" : "❌"} frontend/pages.md ${pagesExists ? "已就绪" : "不存在"}\n`;

  // 待处理反馈
  const backendIssues = feedback.filter(f => f.assignee === "backend" && f.status !== "closed");
  const frontendIssues = feedback.filter(f => f.assignee === "frontend" && f.status !== "closed");
  if (backendIssues.length > 0) {
    status += `\n待处理反馈 (后端):\n`;
    for (const issue of backendIssues) {
      status += `  - #${issue.id} [${issue.priority}] ${issue.title} (${issue.status})\n`;
    }
  }
  if (frontendIssues.length > 0) {
    status += `\n待处理反馈 (前端):\n`;
    for (const issue of frontendIssues) {
      status += `  - #${issue.id} [${issue.priority}] ${issue.title} (${issue.status})\n`;
    }
  }

  return status;
}

async function handleCoordPoll(params: object, cwd: string): Promise<string> {
  const projectDir = findProjectDir(cwd);
  if (!projectDir) {
    return `[coord-poll] 未找到项目目录`;
  }

  const feedback = loadFeedback(projectDir);
  const openIssues = feedback.filter(f => f.status !== "closed");

  if (openIssues.length === 0) {
    return `[coord-poll] 当前没有待处理的问题\n\n所有问题已关闭或无反馈记录`;
  }

  let result = `[coord-poll] 待处理问题 ${openIssues.length} 条:\n\n`;
  for (const issue of openIssues) {
    result += `#${issue.id} [${issue.priority}] ${issue.title}\n`;
    result += `  assignee: ${issue.assignee} | status: ${issue.status}\n`;
    if (issue.needed) result += `  needed: ${issue.needed}\n`;
    result += `\n`;
  }

  return result;
}

async function handleCoordTestStart(params: object, cwd: string): Promise<string> {
  const projectDir = findProjectDir(cwd);
  if (!projectDir) {
    return `[coord-test-start] 未找到项目目录\n\n请先运行 /coord-start 初始化项目`;
  }

  const serviceInfo = loadServiceInfo(projectDir);
  if (!serviceInfo) {
    return `[coord-test-start] 未找到 service-info.json\n\n请确认目录结构是否正确`;
  }

  // 检查 API 判断规则
  if (serviceInfo.backend.api_success_code === undefined) {
    return `❌ [coord-test-start] API 判断规则缺失\n\n当前状态:\n- backend/api-spec.md: ${fs.existsSync(path.join(projectDir, "backend", "api-spec.md")) ? "✅" : "❌"}\n- frontend/pages.md: ${fs.existsSync(path.join(projectDir, "frontend", "pages.md")) ? "✅" : "❌"}\n- API 判断规则: ❌ 缺失\n\n后端需要先配置 API 判断规则（通过 /coord-backend-config），包括：\n- api_success_code（成功响应 code 值）\n- api_fail_codes（失败响应 code 值数组）\n- response_data_field（数据字段名）\n- response_code_field（状态码字段名）`;
  }

  // 检查前置条件
  const apiSpecExists = fs.existsSync(path.join(projectDir, "backend", "api-spec.md"));
  const pagesExists = fs.existsSync(path.join(projectDir, "frontend", "pages.md"));
  const backendReady = serviceInfo.backend.status === "ready";
  const frontendReady = serviceInfo.frontend.status === "ready";

  if (!apiSpecExists || !pagesExists || !backendReady || !frontendReady) {
    return `⚠️ [coord-test-start] 前置条件未满足\n\n当前状态:\n- backend/api-spec.md: ${apiSpecExists ? "✅" : "❌"}\n- frontend/pages.md: ${pagesExists ? "✅" : "❌"}\n- backend.status: ${backendReady ? "✅ ready" : "❌ " + serviceInfo.backend.status}\n- frontend.status: ${frontendReady ? "✅ ready" : "❌ " + serviceInfo.frontend.status}\n\n请等待前置条件满足后再运行 /coord-test-start`;
  }

  // 更新 testing 状态
  serviceInfo.testing.status = "running";
  saveServiceInfo(projectDir, serviceInfo);

  return `✅ [coord-test-start] 前置条件检查通过\n\n项目目录: ${projectDir}\nAPI 规则: code=${serviceInfo.backend.api_success_code}, data=${serviceInfo.backend.response_data_field}\n\n请按 SKILL.md 流程执行测试：\n1. 读取 feedback.md 了解未解决问题\n2. 读取 backend/api-spec.md 和 frontend/pages.md\n3. 启动 Playwright 浏览器执行测试\n4. 发现问题登记 feedback.md\n5. 完成后使用 /coord-done`;
}

async function handleCoordResolve(params: {
  id: string;
  resolution?: string;
}, cwd: string): Promise<string> {
  const projectDir = findProjectDir(cwd);
  if (!projectDir) {
    return `[coord-resolve] 未找到项目目录`;
  }

  const feedback = loadFeedback(projectDir);
  const item = feedback.find(f => f.id === params.id);

  if (!item) {
    return `[coord-resolve] 未找到问题 #${params.id}\n\n当前 feedback.md 中有以下问题：\n${feedback.map(f => `#${f.id} ${f.title} (${f.status})`).join("\n")}`;
  }

  if (item.status !== "resolved") {
    return `[coord-resolve] 问题 #${item.id} 状态为 ${item.status}\n\n只有状态为 resolved 的问题才能执行 /coord-resolve\n（即对方已修复，等待测试验证后才能关闭）`;
  }

  // 更新状态并归档
  item.status = "closed";
  item.resolved_at = new Date().toISOString();
  item.resolution = params.resolution || "已验证通过";

  // 从 feedback.md 移除（先过滤，再保存）
  const remaining = feedback.filter(f => f.id !== params.id);
  saveFeedback(projectDir, remaining);

  // 追加到 closed.md
  appendClosed(projectDir, item);

  return `✅ [coord-resolve] 问题 #${item.id} 已关闭并归档到 closed.md\n\n标题: ${item.title}\n解决方案: ${item.resolution}`;
}

async function handleCoordDone(params: object, cwd: string): Promise<string> {
  const projectDir = findProjectDir(cwd);
  if (!projectDir) {
    return `[coord-done] 未找到项目目录`;
  }

  const feedback = loadFeedback(projectDir);
  const openIssues = feedback.filter(f => f.status !== "closed");

  if (openIssues.length > 0) {
    return `❌ [coord-done] 仍有 ${openIssues.length} 条问题未关闭\n\n待处理问题：\n${openIssues.map(f => `#${f.id} [${f.priority}] ${f.title} (${f.status})`).join("\n")}\n\n请先关闭所有问题后再运行 /coord-done`;
  }

  // 生成最终报告
  const reportsDir = path.join(projectDir, "testing", "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const reportContent = `# 测试最终报告 - ${new Date().toLocaleString("zh-CN")}\n\n## 测试结果\n\n所有测试通过，所有反馈已关闭。\n\n---\n\n详见 testing/ 目录下的测试脚本和报告。\n`;
  fs.writeFileSync(path.join(reportsDir, "final-report.md"), reportContent, "utf-8");

  // 更新 service-info.json
  const serviceInfo = loadServiceInfo(projectDir);
  if (serviceInfo) {
    serviceInfo.testing.status = "completed";
    saveServiceInfo(projectDir, serviceInfo);
  }

  return `✅ [coord-done] 联调测试完成\n\n最终报告已生成: testing/reports/final-report.md\nservice-info.json 已更新: testing.status = completed`;
}

async function handleCoordBackendConfig(params: {
  action?: string;
  field?: string;
  value?: string;
}, cwd: string): Promise<string> {
  const projectDir = findProjectDir(cwd);
  if (!projectDir) {
    return `[coord-backend-config] 未找到项目目录`;
  }

  const serviceInfo = loadServiceInfo(projectDir);
  if (!serviceInfo) {
    return `[coord-backend-config] 未找到 service-info.json`;
  }

  if (params.action === "set" && params.field && params.value !== undefined) {
    // 解析值（如果是数字或数组）
    let value: string | number | number[] = params.value;
    if (/^\d+$/.test(params.value)) {
      value = parseInt(params.value, 10);
    } else if (params.value.startsWith("[") && params.value.endsWith("]")) {
      try {
        value = JSON.parse(params.value);
      } catch {}
    }

    // 写入对应字段
    if (params.field in serviceInfo.backend) {
      (serviceInfo.backend as Record<string, unknown>)[params.field] = value;
    } else {
      return `[coord-backend-config] 未知字段: ${params.field}\n\n可配置字段：\n${Object.keys(serviceInfo.backend).join(", ")}`;
    }

    saveServiceInfo(projectDir, serviceInfo);
    return `✅ [coord-backend-config] ${params.field} = ${params.value}\n\n已更新 service-info.json`;
  }

  // 查看当前配置
  let result = `=== 后端配置 ===\n\n`;
  result += `url: ${serviceInfo.backend.url}\n`;
  result += `health_url: ${serviceInfo.backend.health_url}\n`;
  result += `api_doc_url: ${serviceInfo.backend.api_doc_url || "未设置"}\n`;
  result += `api_success_code: ${serviceInfo.backend.api_success_code ?? "❌ 未设置"}\n`;
  result += `api_fail_codes: ${JSON.stringify(serviceInfo.backend.api_fail_codes || [])}\n`;
  result += `response_data_field: ${serviceInfo.backend.response_data_field || "❌ 未设置"}\n`;
  result += `response_code_field: ${serviceInfo.backend.response_code_field || "❌ 未设置"}\n`;
  result += `response_msg_field: ${serviceInfo.backend.response_msg_field || "❌ 未设置"}\n`;
  result += `status: ${serviceInfo.backend.status}\n`;
  result += `\n修改示例：/coord-backend-config set api_success_code 0`;
  return result;
}

// ============================================================
// Plugin 入口
// ============================================================

export default definePluginEntry({
  id: "fullstack-test",
  name: "Fullstack Test",
  description: "全流程测试协调 - 前后端分离项目的联调测试工作流",
  register(api) {
    const toolOptions = { optional: false as const };

    // ========== Tools（Claude Code / Codex 等）==========

    api.registerTool({
      name: "coord_start",
      description: "初始化联调测试项目，注册角色（后端/前端/测试）",
      parameters: Type.Object({
        projectDir: Type.Optional(Type.String()),
        reqId: Type.Optional(Type.String()),
        role: Type.Optional(Type.String()),
      }),
      async execute(_id, params) {
        const result = await handleCoordStart(params as { projectDir?: string; reqId?: string; role?: string }, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    }, toolOptions);

    api.registerTool({
      name: "coord_status",
      description: "查看当前联调状态",
      async execute(_id) {
        const result = await handleCoordStatus({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    }, toolOptions);

    api.registerTool({
      name: "coord_poll",
      description: "后端/前端轮询自己的反馈",
      async execute(_id) {
        const result = await handleCoordPoll({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    }, toolOptions);

    api.registerTool({
      name: "coord_test_start",
      description: "测试会话启动自动化测试",
      async execute(_id) {
        const result = await handleCoordTestStart({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    }, toolOptions);

    api.registerTool({
      name: "coord_resolve",
      description: "标记反馈问题已解决，移入 closed.md",
      parameters: Type.Object({
        id: Type.String(),
        resolution: Type.Optional(Type.String()),
      }),
      async execute(_id, params) {
        const result = await handleCoordResolve(params as { id: string; resolution?: string }, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    }, toolOptions);

    api.registerTool({
      name: "coord_done",
      description: "测试会话生成最终报告，完成联调",
      async execute(_id) {
        const result = await handleCoordDone({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    }, toolOptions);

    api.registerTool({
      name: "coord_backend_config",
      description: "后端查看/修改服务配置",
      parameters: Type.Object({
        action: Type.Optional(Type.String()),
        field: Type.Optional(Type.String()),
        value: Type.Optional(Type.String()),
      }),
      async execute(_id, params) {
        const result = await handleCoordBackendConfig(params as { action?: string; field?: string; value?: string }, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    }, toolOptions);

    // ========== Commands（OpenClaw native）==========

    api.registerCommand({
      name: "coord-start",
      description: "初始化联调测试项目",
      parameters: Type.Object({
        projectDir: Type.Optional(Type.String()),
        reqId: Type.Optional(Type.String()),
        role: Type.Optional(Type.String()),
      }),
      async execute(_id, params, _ctx) {
        const result = await handleCoordStart(params as { projectDir?: string; reqId?: string; role?: string }, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    });

    api.registerCommand({
      name: "coord-status",
      description: "查看当前联调状态",
      async execute(_id, _params, _ctx) {
        const result = await handleCoordStatus({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    });

    api.registerCommand({
      name: "coord-poll",
      description: "后端/前端轮询反馈",
      async execute(_id, _params, _ctx) {
        const result = await handleCoordPoll({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    });

    api.registerCommand({
      name: "coord-test-start",
      description: "启动自动化测试",
      async execute(_id, _params, _ctx) {
        const result = await handleCoordTestStart({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    });

    api.registerCommand({
      name: "coord-resolve",
      description: "标记问题已解决",
      parameters: Type.Object({
        id: Type.String(),
        resolution: Type.Optional(Type.String()),
      }),
      async execute(_id, params, _ctx) {
        const result = await handleCoordResolve(params as { id: string; resolution?: string }, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    });

    api.registerCommand({
      name: "coord-done",
      description: "生成最终报告",
      async execute(_id, _params, _ctx) {
        const result = await handleCoordDone({}, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    });

    api.registerCommand({
      name: "coord-backend-config",
      description: "后端配置",
      parameters: Type.Object({
        action: Type.Optional(Type.String()),
        field: Type.Optional(Type.String()),
        value: Type.Optional(Type.String()),
      }),
      async execute(_id, params, _ctx) {
        const result = await handleCoordBackendConfig(params as { action?: string; field?: string; value?: string }, process.cwd());
        return { content: [{ type: "text", text: result }] };
      },
    });
  },
});