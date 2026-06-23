#!/usr/bin/env node

/**
 * Telegram Command Receiver & Auto-Executor v2.0
 * Receives messages and IMMEDIATELY EXECUTES TASKS with real results
 *
 * Features:
 * - Real-time message polling
 * - INSTANT TASK EXECUTION (not just acknowledgment)
 * - Web search integration for information gathering
 * - Report generation and sending
 * - Real-time progress updates
 * - Auto-restart on failure
 *
 * Usage: node scripts/telegram_receiver.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const AUTHORIZED_CHAT_ID = parseInt(TELEGRAM_CHAT_ID);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

let lastUpdateId = 0;
let isRunning = true;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function validateConfig() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error(`${colors.red}❌ Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Web search function - fetches detailed data from DuckDuckGo
 */
async function performWebSearch(query) {
  return new Promise((resolve) => {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

    https.get(searchUrl, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          let searchData = {
            query: query,
            abstractText: result.AbstractText || '',
            abstractUrl: result.AbstractURL || '',
            results: []
          };

          // Extract detailed results
          if (result.Results && Array.isArray(result.Results)) {
            searchData.results = result.Results.slice(0, 5).map(r => ({
              title: r.Result || '',
              text: r.Text || '',
              url: r.FirstURL || ''
            }));
          }

          // Extract related topics
          if (result.RelatedTopics && Array.isArray(result.RelatedTopics)) {
            searchData.relatedTopics = result.RelatedTopics.slice(0, 3).map(t => ({
              name: t.FirstURL ? t.FirstURL.split('/')[2] : 'Unknown',
              text: t.Text || ''
            }));
          }

          resolve(searchData);
        } catch (error) {
          resolve({ query: query, abstractText: '', results: [] });
        }
      });
    }).on('error', () => {
      resolve({ query: query, abstractText: '', results: [] });
    });
  });
}

/**
 * Generate AI-powered answer using Claude API
 */
async function generateAIAnswer(query, searchData) {
  // If no API key, return best effort answer from search data
  if (!ANTHROPIC_API_KEY) {
    return formatSearchDataAsAnswer(searchData);
  }

  return new Promise((resolve) => {
    const searchContext = JSON.stringify(searchData, null, 2);

    const prompt = `사용자의 질문: "${query}"

검색 결과 데이터:
${searchContext}

이 검색 결과 데이터를 분석하여 사용자의 질문에 대한 직접적이고 명확한 답변을 한 문장 또는 짧은 문단으로 생성하세요.
답변에는 구체적인 수치, 거리, 시간 등의 정보를 포함하세요.
예를 들어: "순천에서 여수까지는 약 30km이며 고속도로 이용 시 30분 내외가 소요됩니다"
불필요한 형식이나 마크다운 없이 순수 텍스트로만 답변하세요.`;

    const requestBody = JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.content && response.content[0] && response.content[0].text) {
            resolve(response.content[0].text.trim());
          } else {
            resolve(formatSearchDataAsAnswer(searchData));
          }
        } catch (error) {
          resolve(formatSearchDataAsAnswer(searchData));
        }
      });
    });

    req.on('error', () => {
      resolve(formatSearchDataAsAnswer(searchData));
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * Format search data as answer when API is not available
 */
function formatSearchDataAsAnswer(searchData) {
  let answer = '';

  if (searchData.abstractText) {
    answer = searchData.abstractText;
  } else if (searchData.results && searchData.results.length > 0) {
    answer = searchData.results[0].text || searchData.results[0].title;
  }

  return answer || `"${searchData.query}"에 대한 정보를 찾지 못했습니다.`;
}

/**
 * Generate report from search results
 */
async function generateReport(query, searchResults) {
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const report = `📋 *검색 보고서*

🔍 *검색 주제*: ${query}

📅 *생성일시*: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*검색 결과*:
${searchResults}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 보고서 생성 완료
🕐 처리 시간: 실시간 (즉시 실행)
📊 정보 출처: 웹 검색 데이터

---
_Alpha Squad 자동 실행 시스템_`;

  return report;
}

/**
 * Send message to Telegram
 */
function sendToTelegram(message) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const postData = JSON.stringify({
      chat_id: AUTHORIZED_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            resolve(response);
          } else {
            reject(new Error(response.description || 'Telegram API error'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * MAIN EXECUTION FUNCTION - Performs web search and generates AI answer
 */
async function executeTask(query) {
  console.log(`${colors.blue}⚙️  작업 실행 시작: "${query}"${colors.reset}`);

  try {
    // Step 1: Send "작업을 시작합니다" message
    await sendToTelegram(`⏳ *작업을 시작합니다*\n\n질문: ${query}\n상태: 데이터 수집 중...`);

    // Step 2: Perform actual web search
    console.log(`${colors.cyan}🔍 웹 검색 수행 중...${colors.reset}`);
    const searchData = await performWebSearch(query);

    // Step 3: Generate AI-powered answer
    console.log(`${colors.cyan}🤖 AI 답변 생성 중...${colors.reset}`);
    const aiAnswer = await generateAIAnswer(query, searchData);

    // Step 4: Send direct answer immediately
    console.log(`${colors.green}✅ 답변 전송 중...${colors.reset}`);
    await sendToTelegram(`*📌 답변:*\n\n${aiAnswer}`);

    // Step 5: Send completion message
    await sendToTelegram(`✅ *작업 완료*\n\n질문: ${query}\n상태: 답변 생성 및 전송 완료`);

    console.log(`${colors.green}✓ 작업 완료: "${query}"${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}작업 실행 오류: ${error.message}${colors.reset}`);
    try {
      await sendToTelegram(`❌ *작업 실패*\n\n오류: ${error.message}\n다시 시도해주세요.`);
    } catch (sendError) {
      console.error(`${colors.red}오류 메시지 전송 실패${colors.reset}`);
    }
  }
}

/**
 * Parse and execute commands
 */
async function parseAndExecuteCommand(message) {
  const text = message.text || '';
  const chatId = message.chat.id;

  // Security check
  if (chatId !== AUTHORIZED_CHAT_ID) {
    console.log(`${colors.yellow}⚠️  무단 접근: Chat ID ${chatId}${colors.reset}`);
    return;
  }

  console.log(`${colors.cyan}📨 명령 수신: ${text}${colors.reset}`);

  // Handle slash commands
  if (text.startsWith('/')) {
    const command = text.substring(1).toLowerCase().split(' ')[0];

    if (command === 'status') {
      await sendToTelegram('🟢 Alpha Squad 시스템 정상 운영\n\n✅ 명령 대기 중\n✅ 자동 실행 루틴 활성화\n✅ 웹 검색 기능 활성화');
    } else if (command === 'help') {
      await sendToTelegram(`*명령어 사용법*\n\n1️⃣ /status - 시스템 상태 확인\n\n2️⃣ 자연어 질문\n예: "순천에서 여수까지 거리"\n예: "현재 환율"\n예: "날씨 정보"\n\n3️⃣ 프로젝트 명령\n예: "새 프로젝트 시작: 채팅앱"`);
    } else {
      await sendToTelegram(`❓ 명령을 인식하지 못했습니다: /${command}\n/help를 입력하세요.`);
    }
  } else {
    // IMMEDIATELY EXECUTE natural language commands
    // Don't just acknowledge - actually do the work!
    await executeTask(text);
  }
}

/**
 * Fetch updates from Telegram
 */
function getUpdates() {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Main polling loop
 */
async function startListening() {
  console.log(`${colors.green}🎯 Alpha Squad 자동 실행 시스템 시작${colors.reset}`);
  console.log(`${colors.green}🔐 인증 Chat ID: ${AUTHORIZED_CHAT_ID}${colors.reset}`);
  console.log(`${colors.cyan}⚡ 즉시 실행 모드 활성화${colors.reset}`);
  console.log(`${colors.cyan}🔍 웹 검색 기능 활성화${colors.reset}\n`);

  try {
    await sendToTelegram('🟢 *Alpha Squad 자동 실행 시스템 가동*\n\n명령 대기 중입니다. 이제 모바일로 지시를 내려주십시오.\n\n💡 질문 예: "순천에서 여수까지 거리"\n💡 명령: /help');
  } catch (error) {
    console.error(`${colors.red}초기 메시지 전송 실패: ${error.message}${colors.reset}`);
  }

  // Continuous polling loop
  while (isRunning) {
    try {
      const response = await getUpdates();

      if (response.ok && response.result && response.result.length > 0) {
        for (const update of response.result) {
          lastUpdateId = update.update_id;

          if (update.message) {
            const message = update.message;
            const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

            console.log(`${colors.green}✓${colors.reset} [${timestamp}] 메시지 수신 (Chat ID: ${message.chat.id})`);

            // Execute immediately - don't wait
            parseAndExecuteCommand(message).catch(error => {
              console.error(`${colors.red}명령 실행 오류: ${error.message}${colors.reset}`);
            });
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`${colors.red}❌ 폴링 오류: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}⚠️  30초 후 재시도...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}

/**
 * Graceful shutdown
 */
function setupGracefulShutdown() {
  process.on('SIGINT', async () => {
    console.log(`\n${colors.yellow}⏹️  시스템 종료 신호 수신${colors.reset}`);
    isRunning = false;

    try {
      await sendToTelegram('🔴 Alpha Squad 자동 실행 시스템이 종료되었습니다.');
    } catch (error) {
      console.error(`${colors.red}종료 메시지 전송 실패${colors.reset}`);
    }

    console.log(`${colors.green}👋 시스템 정상 종료${colors.reset}`);
    process.exit(0);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  Alpha Squad - 자동 실행 명령 시스템 v2.0              ║${colors.reset}`);
  console.log(`${colors.cyan}║  웹 검색 + 즉시 실행 + 실시간 보고                   ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

  validateConfig();
  setupGracefulShutdown();

  try {
    await startListening();
  } catch (error) {
    console.error(`${colors.red}❌ 시스템 오류: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
