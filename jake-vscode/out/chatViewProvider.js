"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
function getApiBase() {
    return vscode.workspace.getConfiguration('jakeSquad').get('apiBaseUrl', 'http://localhost:8000');
}
function httpRequest(url, method, body) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const lib = parsed.protocol === 'https:' ? https : http;
        const bodyStr = body ? JSON.stringify(body) : undefined;
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
            path: parsed.pathname + parsed.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
            },
        };
        const req = lib.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch {
                    resolve(data);
                }
            });
        });
        req.on('error', reject);
        if (bodyStr)
            req.write(bodyStr);
        req.end();
    });
}
class ChatViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._currentPersona = '제이크';
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this._getHtml();
        webviewView.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === 'send') {
                await this._handleSend(msg.text);
            }
            else if (msg.type === 'ready') {
                await this._loadHistory(this._currentPersona);
            }
        });
    }
    async switchPersona(name) {
        this._currentPersona = name;
        if (this._view) {
            this._view.show(true);
            this._view.webview.postMessage({ type: 'switchPersona', name });
            await this._loadHistory(name);
        }
    }
    async _loadHistory(persona) {
        if (!this._view)
            return;
        try {
            const base = getApiBase();
            const historyKey = persona.includes('Alpha Squad') ? 'alpha-squad' : encodeURIComponent(persona);
            const data = await httpRequest(`${base}/history/${historyKey}`, 'GET');
            this._view.webview.postMessage({ type: 'loadHistory', messages: data.messages || [], persona });
        }
        catch {
            this._view.webview.postMessage({ type: 'loadHistory', messages: [], persona });
        }
    }
    async _handleSend(text) {
        if (!this._view || !text.trim())
            return;
        const persona = this._currentPersona;
        this._view.webview.postMessage({ type: 'addMessage', message: { role: 'user', content: text } });
        this._view.webview.postMessage({ type: 'thinking', value: true });
        try {
            const base = getApiBase();
            const isGroup = persona.includes('Alpha Squad');
            const data = isGroup
                ? await httpRequest(`${base}/chat/group`, 'POST', { message: text, source: 'vscode' })
                : await httpRequest(`${base}/chat/persona/${encodeURIComponent(persona)}`, 'POST', {
                    message: text, persona, source: 'vscode'
                });
            this._view.webview.postMessage({ type: 'thinking', value: false });
            this._view.webview.postMessage({ type: 'addMessage', message: { role: 'assistant', content: data.response || '응답 없음' } });
        }
        catch (e) {
            this._view.webview.postMessage({ type: 'thinking', value: false });
            this._view.webview.postMessage({ type: 'addMessage', message: { role: 'assistant', content: `연결 오류: ${e.message}\n\nSettings에서 API Base URL을 확인하세요.` } });
        }
    }
    _getHtml() {
        return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--vscode-font-family);
  font-size: 12px;
  background: var(--vscode-sideBar-background);
  color: var(--vscode-sideBar-foreground);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
#persona-bar {
  padding: 6px 10px;
  background: var(--vscode-sideBarSectionHeader-background);
  border-bottom: 1px solid var(--vscode-panel-border);
  font-weight: 600;
  font-size: 11px;
  color: var(--vscode-sideBarSectionHeader-foreground);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
#persona-name { color: var(--vscode-textLink-foreground); }
#messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--vscode-descriptionForeground);
  font-size: 11px;
  text-align: center;
  padding: 20px;
}
.msg { display: flex; flex-direction: column; gap: 2px; }
.msg-label { font-size: 10px; color: var(--vscode-descriptionForeground); padding: 0 2px; }
.msg.user .msg-label { text-align: right; }
.msg-bubble {
  padding: 6px 8px;
  border-radius: 8px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
}
.msg.user { align-items: flex-end; }
.msg.user .msg-bubble {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border-bottom-right-radius: 2px;
  max-width: 90%;
}
.msg.assistant { align-items: flex-start; }
.msg.assistant .msg-bubble {
  background: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border, #444);
  border-bottom-left-radius: 2px;
  max-width: 95%;
}
#thinking {
  display: none;
  padding: 4px 10px;
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  font-style: italic;
  flex-shrink: 0;
}
#input-area {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  border-top: 1px solid var(--vscode-panel-border);
  flex-shrink: 0;
}
#input {
  flex: 1;
  padding: 5px 7px;
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border, #444);
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  resize: none;
  outline: none;
  min-height: 28px;
  max-height: 80px;
}
#input:focus { border-color: var(--vscode-focusBorder); }
#send-btn {
  padding: 5px 10px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  align-self: flex-end;
  white-space: nowrap;
}
#send-btn:hover { background: var(--vscode-button-hoverBackground); }
#send-btn:disabled { opacity: 0.5; cursor: default; }
</style>
</head>
<body>
<div id="persona-bar">💬 <span id="persona-name">제이크</span> <span style="color:var(--vscode-descriptionForeground);font-weight:400">와 대화 중</span></div>
<div id="messages"><div class="empty">왼쪽에서 팀원을 선택하세요</div></div>
<div id="thinking">응답 생성 중...</div>
<div id="input-area">
  <textarea id="input" placeholder="메시지 입력 (Enter: 전송)" rows="1"></textarea>
  <button id="send-btn">전송</button>
</div>
<script>
const vscode = acquireVsCodeApi();
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');
const thinkingEl = document.getElementById('thinking');
const personaNameEl = document.getElementById('persona-name');
let currentPersona = '제이크';

function addMessage(msg) {
  const empty = messagesEl.querySelector('.empty');
  if (empty) empty.remove();
  const div = document.createElement('div');
  div.className = 'msg ' + msg.role;
  const label = msg.role === 'user' ? '대표님' : currentPersona;
  div.innerHTML = '<div class="msg-label">' + escapeHtml(label) + '</div><div class="msg-bubble">' + escapeHtml(msg.content) + '</div>';
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function send() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;
  vscode.postMessage({ type: 'send', text });
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
});

window.addEventListener('message', event => {
  const msg = event.data;
  if (msg.type === 'loadHistory') {
    currentPersona = msg.persona;
    personaNameEl.textContent = msg.persona;
    messagesEl.innerHTML = '';
    if (!msg.messages || msg.messages.length === 0) {
      messagesEl.innerHTML = '<div class="empty">' + escapeHtml(msg.persona) + '와 첫 대화를 시작해보세요</div>';
    } else {
      msg.messages.forEach(addMessage);
    }
  } else if (msg.type === 'switchPersona') {
    currentPersona = msg.name;
    personaNameEl.textContent = msg.name;
    messagesEl.innerHTML = '<div class="empty">불러오는 중...</div>';
  } else if (msg.type === 'addMessage') {
    addMessage(msg.message);
    sendBtn.disabled = false;
  } else if (msg.type === 'thinking') {
    thinkingEl.style.display = msg.value ? 'block' : 'none';
    sendBtn.disabled = msg.value;
  }
});

vscode.postMessage({ type: 'ready' });
</script>
</body>
</html>`;
    }
}
exports.ChatViewProvider = ChatViewProvider;
ChatViewProvider.viewType = 'jakeSquadChat';
