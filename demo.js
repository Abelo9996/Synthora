#!/usr/bin/env node

/**
 * Synthora Demo Script
 * Interactive demonstration of the platform's capabilities
 */

const readline = require('readline');
const axios = require('axios');

const API_URL = process.env.SYNTHORA_API_URL || 'http://localhost:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let sessionId = null;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function prompt(question) {
  return new Promise(resolve => {
    rl.question(`${colors.cyan}${question}${colors.reset}`, answer => {
      resolve(answer);
    });
  });
}

async function startSession() {
  try {
    log('\n🚀 Starting Synthora session...', 'bright');
    const response = await axios.post(`${API_URL}/api/conversation/start`, {
      userId: `demo_${Date.now()}`
    });
    sessionId = response.data.sessionId;
    log(`✅ Session created: ${sessionId}\n`, 'green');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function sendMessage(message) {
  try {
    const response = await axios.post(`${API_URL}/api/conversation/message`, {
      sessionId,
      message
    });
    return response.data;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function generateApp() {
  try {
    log('\n🏗️  Generating your app...', 'yellow');
    const response = await axios.post(`${API_URL}/api/apps/generate`, {
      sessionId
    });
    
    if (response.data.success) {
      log(`\n✅ App generated successfully!`, 'green');
      log(`📁 Location: ${response.data.appPath}`, 'cyan');
      log(`\n🎯 Your app includes:`, 'bright');
      log(`   • Full-stack code (React + FastAPI)`, 'blue');
      log(`   • Database models and migrations`, 'blue');
      log(`   • REST APIs with auto-documentation`, 'blue');
      log(`   • Event tracking and analytics`, 'blue');
      log(`   • Docker setup for deployment`, 'blue');
      return response.data;
    }
  } catch (error) {
    log(`❌ Error generating app: ${error.message}`, 'red');
    return null;
  }
}

async function demoScenario1() {
  log('\n' + '='.repeat(60), 'bright');
  log('📊 SCENARIO 1: CRM with Churn Prediction', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('You: "I need a CRM for my agency..."', 'magenta');
  
  const result1 = await sendMessage(
    `Create a CRM application for a marketing agency. Include:
    - Client records (name, company, email, phone, status)
    - Deal pipeline with Kanban view
    - Activity log for tracking interactions
    - Dashboard with key metrics
    - Email integration capabilities`
  );

  if (result1) {
    log('\n🤖 Synthora:', 'green');
    log(result1.response.substring(0, 500) + '...', 'reset');
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  log('\n\nYou: "Add churn prediction..."', 'magenta');
  
  const result2 = await sendMessage(
    `Add a machine learning model to predict which clients are at risk of churning. 
    Use factors like days since last contact, deal value, activity frequency, and response rates.
    Show a risk score on each client's profile.`
  );

  if (result2) {
    log('\n🤖 Synthora:', 'green');
    log(result2.response.substring(0, 500) + '...', 'reset');
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const generate = await prompt('\n📦 Would you like to generate this app now? (yes/no): ');
  
  if (generate.toLowerCase() === 'yes') {
    await generateApp();
  }
}

async function demoScenario2() {
  log('\n' + '='.repeat(60), 'bright');
  log('🛒 SCENARIO 2: E-commerce with Recommendations', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('You: "Build an e-commerce platform..."', 'magenta');
  
  const result1 = await sendMessage(
    `Create an e-commerce platform with:
    - Product catalog with categories and search
    - Shopping cart and checkout
    - Order management
    - Customer accounts
    - Admin dashboard for inventory`
  );

  if (result1) {
    log('\n🤖 Synthora:', 'green');
    log(result1.response.substring(0, 500) + '...', 'reset');
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  log('\n\nYou: "Add smart recommendations..."', 'magenta');
  
  const result2 = await sendMessage(
    `Add product recommendations based on:
    - User's browsing history
    - Past purchases
    - Similar users' behavior
    Show "Recommended for you" section on homepage and "You might also like" on product pages.`
  );

  if (result2) {
    log('\n🤖 Synthora:', 'green');
    log(result2.response.substring(0, 500) + '...', 'reset');
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const generate = await prompt('\n📦 Would you like to generate this app now? (yes/no): ');
  
  if (generate.toLowerCase() === 'yes') {
    await generateApp();
  }
}

async function demoScenario3() {
  log('\n' + '='.repeat(60), 'bright');
  log('🎫 SCENARIO 3: Support Ticketing with Auto-Priority', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('You: "Create a support ticket system..."', 'magenta');
  
  const result1 = await sendMessage(
    `Build a customer support ticketing system with:
    - Ticket submission form
    - Ticket queue with filtering
    - Agent assignment
    - Status tracking (open, in-progress, resolved)
    - Customer communication thread
    - Knowledge base integration`
  );

  if (result1) {
    log('\n🤖 Synthora:', 'green');
    log(result1.response.substring(0, 500) + '...', 'reset');
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  log('\n\nYou: "Auto-predict ticket priority..."', 'magenta');
  
  const result2 = await sendMessage(
    `Add ML to automatically predict ticket priority and estimated resolution time.
    Analyze the ticket content, customer tier, issue type, and historical data.
    Automatically route high-priority tickets to senior agents.`
  );

  if (result2) {
    log('\n🤖 Synthora:', 'green');
    log(result2.response.substring(0, 500) + '...', 'reset');
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const generate = await prompt('\n📦 Would you like to generate this app now? (yes/no): ');
  
  if (generate.toLowerCase() === 'yes') {
    await generateApp();
  }
}

async function customDemo() {
  log('\n' + '='.repeat(60), 'bright');
  log('💡 CUSTOM: Build Your Own App', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('Describe your app in natural language.', 'cyan');
  log('Be as detailed as you want!\n', 'cyan');

  const appDescription = await prompt('📝 Your app idea: ');
  
  log('\n🤖 Processing your request...', 'yellow');
  const result1 = await sendMessage(appDescription);

  if (result1) {
    log('\n🤖 Synthora:', 'green');
    log(result1.response, 'reset');
  }

  const wantML = await prompt('\n🧠 Would you like to add ML capabilities? (yes/no): ');

  if (wantML.toLowerCase() === 'yes') {
    const mlDescription = await prompt('📝 Describe the ML feature you want: ');
    
    log('\n🤖 Processing ML request...', 'yellow');
    const result2 = await sendMessage(mlDescription);

    if (result2) {
      log('\n🤖 Synthora:', 'green');
      log(result2.response, 'reset');
    }
  }

  const generate = await prompt('\n📦 Generate this app? (yes/no): ');
  
  if (generate.toLowerCase() === 'yes') {
    await generateApp();
  }
}

async function interactiveMode() {
  log('\n' + '='.repeat(60), 'bright');
  log('💬 INTERACTIVE MODE', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('Chat with Synthora freely. Type "generate" to create the app, "exit" to quit.\n', 'cyan');

  let chatting = true;
  while (chatting) {
    const message = await prompt('You: ');

    if (message.toLowerCase() === 'exit') {
      chatting = false;
      continue;
    }

    if (message.toLowerCase() === 'generate') {
      await generateApp();
      chatting = false;
      continue;
    }

    const result = await sendMessage(message);
    if (result) {
      log('\n🤖 Synthora:', 'green');
      log(result.response + '\n', 'reset');
    }
  }
}

async function main() {
  log('\n' + '█'.repeat(60), 'bright');
  log('█                                                          █', 'bright');
  log('█   🚀 SYNTHORA PLATFORM DEMO                             █', 'bright');
  log('█                                                          █', 'bright');
  log('█   AI-Native App Builder + ML Copilot                    █', 'bright');
  log('█                                                          █', 'bright');
  log('█'.repeat(60) + '\n', 'bright');

  await startSession();

  log('Choose a demo scenario:\n', 'bright');
  log('1. CRM with Churn Prediction', 'cyan');
  log('2. E-commerce with Recommendations', 'cyan');
  log('3. Support Ticketing with Auto-Priority', 'cyan');
  log('4. Build Your Own App (Custom)', 'cyan');
  log('5. Interactive Chat Mode', 'cyan');
  log('6. Exit\n', 'cyan');

  const choice = await prompt('Select option (1-6): ');

  switch (choice) {
    case '1':
      await demoScenario1();
      break;
    case '2':
      await demoScenario2();
      break;
    case '3':
      await demoScenario3();
      break;
    case '4':
      await customDemo();
      break;
    case '5':
      await interactiveMode();
      break;
    case '6':
      log('\n👋 Thank you for trying Synthora!\n', 'green');
      break;
    default:
      log('\n❌ Invalid option', 'red');
  }

  rl.close();
  
  log('\n' + '='.repeat(60), 'bright');
  log('Demo completed! Check your generated_apps folder.', 'green');
  log('='.repeat(60) + '\n', 'bright');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Run the demo
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('\n❌ Synthora server is not running!', 'red');
    log(`\nPlease start the server first:\n`, 'yellow');
    log(`   npm run dev\n`, 'cyan');
    log(`Then run this demo again.\n`, 'yellow');
    process.exit(1);
  }

  await main();
  process.exit(0);
})();
