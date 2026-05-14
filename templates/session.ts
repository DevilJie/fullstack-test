/**
 * Playwright 自动化测试脚本模板
 * 
 * 此文件由测试会话自动生成，请勿手动修改
 * 每次 /coord-test-start 启动时会重新生成
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  headless: false, // 设置为 true 可隐藏浏览器
  slowMo: 100, // 慢动作，方便观察
  timeout: 30000,
};

// 反馈文件路径
let FEEDBACK_PATH;
let SERVICE_INFO;

// 工具函数：添加反馈
async function addFeedback(feedback) {
  const content = fs.readFileSync(FEEDBACK_PATH, 'utf-8');
  
  // 找到最后一条反馈的编号
  const matches = content.match(/### #(\d+)/g);
  const lastId = matches ? parseInt(matches[matches.length - 1].replace('### #', '')) : 0;
  const newId = lastId + 1;
  
  const now = new Date().toISOString();
  
  const newFeedback = `

### #${newId} - ${feedback.title}
**assignee**: ${feedback.assignee}
**from**: testing
**priority**: ${feedback.priority || 'medium'}
**status**: open
**title**: ${feedback.title}
**description**: ${feedback.description}
**needed**: ${feedback.needed || ''}
**created_at**: ${now}
`;
  
  // 在 Items 表格后添加
  const insertPoint = content.indexOf('\n## Items\n\n|');
  const lines = content.split('\n');
  const tableEnd = lines.findIndex((l, i) => i > 5 && l.match(/^\|/));
  
  fs.writeFileSync(FEEDBACK_PATH, content + newFeedback, 'utf-8');
  console.log(`📝 已登记反馈 #${newId}: ${feedback.title}`);
}

// 工具函数：检查是否需要登录
async function checkLogin(page) {
  try {
    await page.waitForSelector('#login, .login, [type="email"]', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// 登录流程
async function login(page, credentials) {
  if (!credentials) {
    await addFeedback({
      assignee: 'frontend',
      from: 'testing',
      priority: 'high',
      title: '需要登录凭证',
      description: '测试需要登录账号密码',
      needed: '请在 feedback 中提供测试账号密码'
    });
    
    // 轮询等待登录信息
    console.log('⏳ 等待登录凭证...');
    while (!credentials) {
      await new Promise(r => setTimeout(r, 5000));
      // 读取 feedback 中的登录信息
      try {
        const feedback = fs.readFileSync(FEEDBACK_PATH, 'utf-8');
        const loginMatch = feedback.match(/\*\*needed\*\*:.*?username:\s*(\S+).*?password:\s*(\S+)/s);
        if (loginMatch) {
          credentials = { username: loginMatch[1], password: loginMatch[2] };
        }
      } catch {}
    }
  }
  
  try {
    await page.fill('#email, [type="email"]', credentials.username);
    await page.fill('#password, [type="password"]', credentials.password);
    await page.click('button[type="submit"], .login-btn, button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('✅ 登录成功');
  } catch (e) {
    await addFeedback({
      assignee: 'frontend',
      from: 'testing',
      priority: 'high',
      title: '登录失败',
      description: e.message
    });
  }
}

// 测试用例执行器
async function runTest(page, testCase, pageInfo) {
  try {
    console.log(`  🔍 测试: ${testCase.name}`);
    
    if (testCase.action) {
      await testCase.action(page);
    }
    
    if (testCase.waitForSelector) {
      await page.waitForSelector(testCase.waitForSelector, { timeout: testCase.timeout || 10000 });
    }
    
    console.log(`  ✅ ${testCase.name} 通过`);
    return true;
  } catch (e) {
    console.log(`  ❌ ${testCase.name} 失败: ${e.message}`);
    
    // 根据测试类型决定 assignee
    const isApiTest = testCase.type === 'api';
    await addFeedback({
      assignee: isApiTest ? 'backend' : 'frontend',
      from: 'testing',
      priority: 'high',
      title: `${pageInfo.path} - ${testCase.name} 失败`,
      description: e.message
    });
    
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('\n=== 联调自动化测试 ===\n');
  
  // 加载配置
  const reqDir = Object.keys(require('os').userInfo()).length > 0 
    ? path.join(process.env.HOME, 'requirements')
    : path.join(__dirname, '..', '..');
  
  const reqDirs = fs.readdirSync(reqDir).filter(d => d.startsWith('REQ'));
  if (reqDirs.length === 0) {
    console.error('❌ 未找到需求目录');
    return;
  }
  
  const reqId = reqDirs.sort().reverse()[0];
  const baseDir = path.join(reqDir, reqId);
  
  FEEDBACK_PATH = path.join(baseDir, 'feedback.md');
  
  // 读取服务信息
  const serviceInfo = JSON.parse(fs.readFileSync(path.join(baseDir, 'service-info.json'), 'utf-8'));
  const backendUrl = serviceInfo.backend?.url;
  const frontendUrl = serviceInfo.frontend?.url;
  
  if (!backendUrl || !frontendUrl) {
    console.error('❌ 服务 URL 未配置');
    return;
  }
  
  // 读取页面清单
  const pagesPath = path.join(baseDir, 'frontend', 'pages.md');
  if (!fs.existsSync(pagesPath)) {
    console.error('❌ frontend/pages.md 不存在');
    return;
  }
  
  // 简单解析 pages.md
  const pagesContent = fs.readFileSync(pagesPath, 'utf-8');
  console.log('📄 已加载页面清单');
  
  // 启动浏览器
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  // 全局错误监听
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  ⚠️ 控制台错误: ${msg.text()}`);
    }
  });
  
  let credentials = null;
  let passed = 0;
  let failed = 0;
  
  // 遍历测试页面
  // 这里需要根据实际的 pages.md 内容动态生成测试用例
  // 简化版本：测试基本导航
  
  try {
    console.log(`\n🌐 测试前端: ${frontendUrl}`);
    
    // 1. 访问首页
    await page.goto(frontendUrl, { timeout: CONFIG.timeout });
    await page.waitForLoadState('networkidle');
    console.log('✅ 首页加载成功');
    passed++;
    
    // 2. 检查登录状态
    const needsLogin = await checkLogin(page);
    if (needsLogin) {
      console.log('🔐 需要登录');
      // 简化：使用默认测试账号或等待
      credentials = { username: 'test@example.com', password: 'Test123456' };
      await login(page, credentials);
    }
    
    // 3. 模拟更多测试...
    // TODO: 根据 pages.md 动态生成测试用例
    
    console.log('\n=== 测试完成 ===');
    console.log(`通过: ${passed}`);
    console.log(`失败: ${failed}`);
    
  } catch (e) {
    console.error(`❌ 测试异常: ${e.message}`);
    await addFeedback({
      assignee: 'frontend',
      from: 'testing',
      priority: 'high',
      title: '测试执行异常',
      description: e.message
    });
  } finally {
    await browser.close();
  }
  
  // 生成报告
  const reportPath = path.join(baseDir, 'testing', 'reports', `report-${Date.now()}.md`);
  const report = `# 测试报告 - ${new Date().toISOString()}

## 测试结果
- 通过: ${passed}
- 失败: ${failed}
- 时间: ${new Date().toISOString()}

## 详情
见 feedback.md
`;
  
  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📊 报告已生成: ${reportPath}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 运行
runTests().catch(console.error);
