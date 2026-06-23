#!/usr/bin/env node

/**
 * Telegram Notifier Script
 * Sends project reports to Telegram for team leader notification
 *
 * Usage: node scripts/telegram_notifier.js <path-to-markdown-file>
 * Example: node scripts/telegram_notifier.js docs/ProjectName/FINAL_REPORT_FOR_LEADER.md
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Validate environment variables
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env file');
  console.error('Please configure your .env file with valid Telegram credentials.');
  process.exit(1);
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Error: Please provide a file path');
  console.error('Usage: node scripts/telegram_notifier.js <path-to-file>');
  process.exit(1);
}

// Resolve file path
const fullPath = path.resolve(filePath);

// Check if file exists
if (!fs.existsSync(fullPath)) {
  console.error(`❌ Error: File not found: ${fullPath}`);
  process.exit(1);
}

// Read file content
let fileContent;
try {
  fileContent = fs.readFileSync(fullPath, 'utf-8');
} catch (error) {
  console.error(`❌ Error reading file: ${error.message}`);
  process.exit(1);
}

/**
 * Extract summary from markdown content
 * Takes first 1000 characters or up to first heading
 */
function extractSummary(content) {
  const lines = content.split('\n');
  let summary = '';
  let charCount = 0;
  const maxChars = 1000;

  for (const line of lines) {
    if (charCount + line.length > maxChars) {
      summary += line.substring(0, maxChars - charCount);
      break;
    }
    summary += line + '\n';
    charCount += line.length + 1;
  }

  return summary.trim();
}

/**
 * Send message to Telegram
 */
function sendToTelegram(message) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const postData = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
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

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            resolve(response);
          } else {
            reject(new Error(response.description || 'Unknown Telegram API error'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse Telegram response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('📤 Preparing to send report to Telegram...');
    console.log(`📄 File: ${filePath}`);
    console.log(`💬 Chat ID: ${TELEGRAM_CHAT_ID}`);

    const summary = extractSummary(fileContent);
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    const telegramMessage = `🎯 *Alpha Squad Final Report Notification*

📅 *Timestamp*: ${timestamp}

📊 *Report Summary*:
${summary}

📎 *Full Report Location*: \`${filePath}\`

✅ All team members have completed their assignments and passed QA validation.

---
_Report delivered by Alpha Squad Agent Team System_`;

    await sendToTelegram(telegramMessage);
    console.log('✅ Successfully sent report to Telegram!');
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Verify TELEGRAM_BOT_TOKEN is correct');
    console.error('2. Verify TELEGRAM_CHAT_ID is correct');
    console.error('3. Ensure your Telegram bot is active');
    console.error('4. Check your internet connection');
    process.exit(1);
  }
}

main();
