#!/usr/bin/env node

/**
 * fullstack-test Coordination Script
 * 前后端联调测试协调工具
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BASE_DIR = path.join(process.env.HOME, 'requirements');
const WORKING_DIR = process.env.INIT_CWD || process.cwd();

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function info(msg) { log(colors.blue, 'INFO', msg); }
function success(msg) { log(colors.green, 'SUCCESS', msg); }
function warn(msg) { log(colors.yellow, 'WARN', msg); }
function error(msg) { log(colors.red, 'ERROR', msg); }

// 读取用户输入
function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(`${colors.cyan}? ${question}: ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// 选择菜单
async function selectMenu(question, options) {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt.label}`);
  });
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`${colors.cyan}? 选择 (1-${options.length}): ${colors.reset}`, async (answer) => {
    rl.close();
    const idx = parseInt(answer) - 1;
    if (idx >= 0 && idx < options.length) {
      return options[idx].value;
    }
    return null;
  });
  // 简化版本
  const answer = await ask(`选择 (1-${options.length})`);
  const idx = parseInt(answer) - 1;
  if (idx >= 0 && idx < options.length) {
    return options[idx].value;
  }
  return null;
}

// 确保目录存在
// 查找需求目录的函数
function findReqDir(base) {
  const searchDir = base || WORKING_DIR;
  try {
    const entries = fs.readdirSync(searchDir).filter(d => d.startsWith('REQ'));
    if (entries.length > 0) {
      entries.sort().reverse();
      return { dir: path.join(searchDir, entries[0]), name: entries[0] };
    }
  } catch {}
  return null;
}

// 读取 JSON 文件
function readJson(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (e) {}
  return null;
}

// 写入 JSON 文件
function writeJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// 初始化目录结构
function initDirectoryStructure(reqId) {
  const reqDir = path.join(BASE_DIR, reqId);
  const dirs = [
    path.join(reqDir, 'backend'),
    path.join(reqDir, 'frontend'),
    path.join(reqDir, 'testing', 'reports'),
  ];
  
  dirs.forEach(ensureDir);
  
  return reqDir;
}

// 检查前置条件文件
function checkPrerequisites(reqDir) {
  const apiSpec = path.join(reqDir, 'backend', 'api-spec.md');
  const pagesMd = path.join(reqDir, 'frontend', 'pages.md');
  
  return {
    apiSpecExists: fs.existsSync(apiSpec),
    pagesMdExists: fs.existsSync(pagesMd),
    apiSpecPath: apiSpec,
    pagesMdPath: pagesMd,
  };
}

// 生成 README
function generateReadme(reqDir, role, urls) {
  const readme = `# ${reqDir.split('/').pop()} - 协调手册

## 角色配置
- 后端: ${urls.backend || '(待配置)'}
- 前端: ${urls.frontend || '(待配置)'}
- 测试: 已注册

## 目录结构
\`\`\`
${path.basename(reqDir)}/
├── README.md
├── service-info.json
├── feedback.md
├── backend/
│   ├── spec.md
│   ├── plan.md
│   └── api-spec.md
├── frontend/
│   ├── spec.md
│   ├── plan.md
│   └── pages.md
└── testing/
    └── reports/
\`\`\`

## 命令说明

| 命令 | 说明 |
|------|------|
| /coord-status | 查看联调状态 |
| /coord-poll | 轮询反馈 (后端/前端) |
| /coord-test-start | 启动测试 (测试会话) |
| /coord-resolve | 标记问题已解决 |

## 注意事项
1. 后端完成开发后更新 api-spec.md
2. 前端完成开发后更新 pages.md
3. 测试会话需等待两者都就绪
`;
  
  fs.writeFileSync(path.join(reqDir, 'README.md'), readme, 'utf-8');
}

// 生成空的 service-info.json
function generateServiceInfo(reqDir, role, url) {
  const info = {
    requirement_id: reqDir.split('/').pop(),
    created_at: new Date().toISOString(),
    backend: {
      url: role === 'backend' ? url : '',
      health_url: role === 'backend' ? `${url}/health` : '',
      status: 'pending'
    },
    frontend: {
      url: role === 'frontend' ? url : '',
      status: 'pending'
    },
    testing: {
      status: 'pending'
    }
  };
  
  writeJson(path.join(reqDir, 'service-info.json'), info);
}

// 生成空的 feedback.md
function generateFeedback(reqDir) {
  const reqId = reqDir.split('/').pop();
  const feedback = `# Feedback Log - ${reqId}

## Items

| # | assignee | from | priority | status | title |
|---|----------|------|----------|--------|-------|
`;
  
  fs.writeFileSync(path.join(reqDir, 'feedback.md'), feedback, 'utf-8');
}

// 协调 start 命令
async function coordStart() {
  console.log('\n=== 联调测试初始化 ===\n');
  
  // 0. 显示当前工作目录
  console.log(`\n当前工作目录: ${WORKING_DIR}`);
  const useCurrentDir = await ask('是否使用当前目录作为项目根目录? (y/n, 默认y)');
  const useCurrent = useCurrentDir.toLowerCase() !== 'n';
  
  let projectRoot;
  if (useCurrent) {
    projectRoot = WORKING_DIR;
  } else {
    projectRoot = await ask('请输入项目根目录路径');
  }
  
  if (!projectRoot) {
    error('项目根目录不能为空');
    return;
  }
  
  // 1. 询问需求编号
  const reqId = await ask('请输入需求编号 (例如: REQ-001)');
  if (!reqId) {
    error('需求编号不能为空');
    return;
  }
  
  const reqDir = path.join(projectRoot, reqId);
  
  // 2. 检查是否已初始化
  const serviceInfoPath = path.join(reqDir, 'service-info.json');
  const existingInfo = readJson(serviceInfoPath);
  
  if (existingInfo) {
    info(`检测到 ${reqId} 已存在`);
    // 更新现有配置
  } else {
    // 创建目录结构
    initDirectoryStructure(reqId);
    generateFeedback(reqDir);
    info(`已创建 ${reqId} 目录结构`);
  }
  
  // 3. 询问角色
  const role = await selectMenu('请选择当前会话角色:', [
    { label: '后端开发', value: 'backend' },
    { label: '前端开发', value: 'frontend' },
    { label: '测试', value: 'testing' },
  ]);
  
  if (!role) {
    error('未选择角色');
    return;
  }
  
  // 4. 根据角色询问不同内容
  let urls = { backend: '', frontend: '' };
  let info = readJson(serviceInfoPath) || {};
  
  if (role === 'backend' || role === 'frontend') {
    const url = await ask(`请输入${role === 'backend' ? '后端' : '前端'}服务 URL (例如: http://localhost:8080)`);
    
    if (role === 'backend') {
      info.backend = {
        url: url,
        health_url: `${url}/health`,
        status: 'pending'
      };
      urls.backend = url;
    } else {
      info.frontend = {
        url: url,
        status: 'pending'
      };
      urls.frontend = url;
    }
    
    writeJson(serviceInfoPath, info);
    success(`${role === 'backend' ? '后端' : '前端'} URL 已配置: ${url}`);
    
    // 5. 询问设计文档
    const docChoice = await selectMenu('请提供设计文档和开发计划:', [
      { label: '输入已有文件路径', value: 'file' },
      { label: '使用自然语言描述', value: 'natural' },
    ]);
    
    if (docChoice === 'file') {
      const filePath = await ask('请输入文件路径');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const targetDir = path.join(reqDir, role);
        fs.writeFileSync(path.join(targetDir, 'spec.md'), content, 'utf-8');
        success(`已复制设计文档到 ${role}/spec.md`);
      } else {
        warn(`文件不存在: ${filePath}`);
      }
    } else {
      console.log('\n请描述你的开发内容(按 Ctrl+D 结束输入):');
      // 简化处理
      const description = await ask('开发内容描述 (简短版)');
      const targetDir = path.join(reqDir, role);
      
      // 生成 spec.md
      const specContent = `# ${role === 'backend' ? '后端' : '前端'}设计文档 - ${reqId}

## 开发内容
${description}

## 技术栈
(待补充)

## 核心功能
(待补充)
`;
      fs.writeFileSync(path.join(targetDir, 'spec.md'), specContent, 'utf-8');
      
      // 生成 plan.md
      const planContent = `# ${role === 'backend' ? '后端' : '前端'}开发计划 - ${reqId}

## 任务列表
1. (待规划)

## 时间估算
(待补充)
`;
      fs.writeFileSync(path.join(targetDir, 'plan.md'), planContent, 'utf-8');
      success('已生成设计文档和开发计划');
    }
    
    // 后端特殊：生成 api-spec.md 模板
    if (role === 'backend') {
      const apiSpecContent = `# API 接口规范 - ${reqId}

## 接口列表

### 登录
- POST /api/login
  - 请求: { email, password }
  - 响应: { token, user }

### 用户列表
- GET /api/users
  - Headers: Authorization: Bearer {token}
  - 响应: { users: [], total }

(按实际开发补充)
`;
      fs.writeFileSync(path.join(reqDir, 'backend', 'api-spec.md'), apiSpecContent, 'utf-8');
      success('已生成接口规范模板 backend/api-spec.md');
    }
    
    // 前端特殊：生成 pages.md 模板
    if (role === 'frontend') {
      const pagesContent = `# 测试页面清单 - ${reqId}

## 页面列表

### /login
- 测试用例: 正常登录、密码错误、无效账号
- 需要认证: 否

### /dashboard
- 测试用例: 数据加载、刷新
- 需要认证: 是

### /users
- 测试用例: 列表加载、分页、搜索
- 需要认证: 是

(按实际开发补充)
`;
      fs.writeFileSync(path.join(reqDir, 'frontend', 'pages.md'), pagesContent, 'utf-8');
      success('已生成页面清单模板 frontend/pages.md');
    }
    
  } else {
    // 测试角色
    info.testing = { status: 'pending' };
    writeJson(serviceInfoPath, info);
  }
  
  // 生成 README
  generateReadme(reqDir, role, urls);
  
  // 完成
  console.log('\n' + '='.repeat(40));
  success('初始化完成!');
  console.log('='.repeat(40));
  console.log(`\n需求目录: ${reqDir}`);
  console.log('\n下一步:');
  if (role === 'testing') {
    console.log('  - 运行 /coord-test-start 启动测试(需等待前后端就绪)');
  } else {
    console.log(`  - 完成开发后，更新 ${role}/api-spec.md 或 ${role}/pages.md`);
    console.log('  - 运行 /coord-poll 轮询反馈');
  }
  console.log('  - 运行 /coord-status 查看状态\n');
}

// 协调 status 命令
async function coordStatus() {
  // 查找需求目录
  const found = findReqDir(WORKING_DIR) || findReqDir(BASE_DIR);
  if (!found) {
    error('未找到任何需求目录，请先运行 /coord-start');
    return;
  }
  
  const reqId = found.name;
  const reqDir = found.dir;
  
  const info = readJson(path.join(reqDir, 'service-info.json'));
  const prereqs = checkPrerequisites(reqDir);
  
  console.log(`\n=== ${reqId} 联调状态 ===\n`);
  
  // 服务状态
  console.log('服务就绪:');
  if (info) {
    const backendOk = info.backend?.status === 'ready';
    const frontendOk = info.frontend?.status === 'ready';
    console.log(`  ${backendOk ? '✅' : '⏳'} backend: ${info.backend?.url || '(未配置)'} (${info.backend?.status || 'pending'})`);
    console.log(`  ${frontendOk ? '✅' : '⏳'} frontend: ${info.frontend?.url || '(未配置)'} (${info.frontend?.status || 'pending'})`);
    console.log(`  ${info.testing?.status === 'running' ? '🔄' : '⏳'} testing: (${info.testing?.status || 'pending'})`);
  } else {
    console.log('  ❌ service-info.json 不存在');
  }
  
  // 前置条件
  console.log('\n前置条件:');
  console.log(`  ${prereqs.apiSpecExists ? '✅' : '❌'} backend/api-spec.md`);
  console.log(`  ${prereqs.pagesMdExists ? '✅' : '❌'} frontend/pages.md`);
  
  if (prereqs.apiSpecExists && prereqs.pagesMdExists) {
    console.log('\n✅ 联调测试前置条件已满足');
  } else {
    console.log('\n⚠️ 联调测试前置条件未满足，请等待');
  }
  
  // 反馈摘要
  if (fs.existsSync(path.join(reqDir, 'feedback.md'))) {
    const feedback = fs.readFileSync(path.join(reqDir, 'feedback.md'), 'utf-8');
    const openCount = (feedback.match(/\*\*status\*\*: open/gi) || []).length;
    const resolvedCount = (feedback.match(/\*\*status\*\*: resolved/gi) || []).length;
    console.log(`\n反馈状态: ${openCount} 待处理, ${resolvedCount} 已解决`);
  }
  
  console.log('');
}

// 协调 poll 命令
async function coordPoll() {
  const found = findReqDir(WORKING_DIR) || findReqDir(BASE_DIR);
  if (!found) {
    error('未找到需求目录');
    return;
  }
  
  const reqId = found.name;
  const reqDir = found.dir;
  const feedbackPath = path.join(reqDir, 'feedback.md');
  
  if (!fs.existsSync(feedbackPath)) {
    info('暂无反馈');
    return;
  }
  
  const feedback = fs.readFileSync(feedbackPath, 'utf-8');
  
  console.log(`\n=== ${reqId} 反馈轮询 ===\n`);
  
  // 简单解析反馈
  const lines = feedback.split('\n');
  let currentItem = null;
  let items = [];
  
  for (const line of lines) {
    if (line.startsWith('### #')) {
      currentItem = { raw: line };
      items.push(currentItem);
    }
    if (currentItem && line.includes('**assignee**')) {
      currentItem.assignee = line.split('**assignee****:')[1].trim();
    }
    if (currentItem && line.includes('**status**')) {
      currentItem.status = line.split('**status**:**')[1].trim();
    }
  }
  
  // 显示 open 的项
  const openItems = items.filter(i => i.status === 'open' || i.status === 'acknowledged');
  
  if (openItems.length === 0) {
    success('暂无待处理的反馈');
  } else {
    console.log('待处理反馈:');
    openItems.forEach(item => {
      console.log(`  - ${item.raw.replace('### #', '#')} [${item.assignee}]`);
    });
  }
  
  console.log('');
}

// 协调 resolve 命令
async function coordResolve(args) {
  if (!args || args.length === 0) {
    error('请指定要解决的反馈编号');
    console.log('用法: /coord-resolve <编号> [解决方案]');
    return;
  }
  
  const id = args[0];
  const resolution = args.slice(1).join(' ') || '(已修复)';
  
  const found = findReqDir(WORKING_DIR) || findReqDir(BASE_DIR);
  if (!found) {
    error('未找到需求目录');
    return;
  }
  
  const reqDir = found.dir;
  const feedbackPath = path.join(reqDir, 'feedback.md');
  
  if (!fs.existsSync(feedbackPath)) {
    error('feedback.md 不存在');
    return;
  }
  
  let feedback = fs.readFileSync(feedbackPath, 'utf-8');
  
  // 查找并更新指定的反馈
  const pattern = new RegExp(`(### #${id}.*?\\*\\*status\\*\\*: )(\\w+)`, 's');
  
  if (pattern.test(feedback)) {
    feedback = feedback.replace(pattern, `$1resolved`);
    
    // 添加 resolution
    const resolvedAt = new Date().toISOString();
    const resPattern = new RegExp(`(### #${id}.*?)(## Items|$)`, 's');
    feedback = feedback.replace(resPattern, `$1**resolved_at**: ${resolvedAt}\n**resolution**: ${resolution}\n\n$2`);
    
    fs.writeFileSync(feedbackPath, feedback, 'utf-8');
    success(`#${id} 已标记为 resolved: ${resolution}`);
  } else {
    error(`未找到 #${id}`);
  }
}

// 主函数
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'start':
      await coordStart();
      break;
    case 'status':
      await coordStatus();
      break;
    case 'poll':
      await coordPoll();
      break;
    case 'resolve':
      await coordResolve(args);
      break;
    default:
      console.log(`
=== fullstack-test 协调工具 ===

用法:
  node coord.js start     初始化项目
  node coord.js status    查看状态
  node coord.js poll      轮询反馈
  node coord.js resolve   标记已解决

或者在 Claude Code 中使用:
  /coord-start
  /coord-status
  /coord-poll
  /coord-resolve
`);
  }
}

main().catch(console.error);
