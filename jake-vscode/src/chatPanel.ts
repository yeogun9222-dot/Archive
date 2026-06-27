import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

function getApiBase(): string {
  const cfg = vscode.workspace.getConfiguration('jakeSquad');
  return cfg.get<string>('apiBaseUrl', 'http://localhost:8000');
}

function httpRequest(url: string, method: string, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const options: http.RequestOptions = {
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
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export class ChatPanel {
  static readonly viewType = 'jakeSquadChat';
  private static panels: Map<string, ChatPanel> = new Map();

  private readonly _panel: vscode.WebviewPanel;
  private readonly _persona: string;
  private _messages: ChatMessage[] = [];
  private _isGroupChat = false;

  static createOrShow(persona: string, isGroup = false) {
    const key = isGroup ? '__group__' : persona;
    const existing = ChatPanel.panels.get(key);
    if (existing) {
      existing._panel.reveal(vscode.ViewColumn.One);
      return;
    }
    const title = isGroup ? '전체 회의' : `${persona}`;
    const panel = vscode.window.createWebviewPanel(
      ChatPanel.viewType,
      title,
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    const cp = new ChatPanel(panel, persona, isGroup);
    ChatPanel.panels.set(key, cp);
  }

  private constructor(panel: vscode.WebviewPanel, persona: string, isGroup: boolean) {
    this._panel = panel;
    this._persona = persona;
    this._isGroupChat = isGroup;

    this._panel.onDidDispose(() => {
      const key = isGroup ? '__group__' : persona;
      ChatPanel.panels.delete(key);
    });

    this._panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'send') {
        await this._handleSend(msg.text);
      } else if (msg.type === 'ready') {
        await this._loadHistory();
      }
    });

    this._panel.webview.html = this._getHtml();
  }


  private async _loadHistory() {
    if (this._isGroupChat) {
      this._postMessages([]);
      return;
    }
    try {
      const base = getApiBase();
      const data = await httpRequest(`${base}/history/${encodeURIComponent(this._persona)}`, 'GET');
      this._messages = (data.messages || []) as ChatMessage[];
      this._postMessages(this._messages);
    } catch {
      this._postMessages([]);
    }
  }

  private async _handleSend(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    this._messages.push(userMsg);
    this._panel.webview.postMessage({ type: 'addMessage', message: userMsg });
    this._panel.webview.postMessage({ type: 'thinking', value: true });

    try {
      const base = getApiBase();
      let data: any;
      if (this._isGroupChat) {
        data = await httpRequest(`${base}/chat`, 'POST', { message: text, source: 'vscode' });
      } else {
        data = await httpRequest(
          `${base}/chat/persona/${encodeURIComponent(this._persona)}`,
          'POST',
          { message: text, persona: this._persona, source: 'vscode' }
        );
      }
      const reply: ChatMessage = { role: 'assistant', content: data.response || '응답 없음' };
      this._messages.push(reply);
      this._panel.webview.postMessage({ type: 'thinking', value: false });
      this._panel.webview.postMessage({ type: 'addMessage', message: reply });
    } catch (e: any) {
      this._panel.webview.postMessage({ type: 'thinking', value: false });
      const errMsg: ChatMessage = { role: 'assistant', content: `오류: ${e.message}` };
      this._panel.webview.postMessage({ type: 'addMessage', message: errMsg });
    }
  }

  private _postMessages(messages: ChatMessage[]) {
    this._panel.webview.postMessage({ type: 'loadHistory', messages });
  }

  private _getHtml(): string {
    const title = this._isGroupChat ? '전체 회의' : this._persona;
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  #header {
    padding: 10px 16px;
    background: var(--vscode-sideBarSectionHeader-background);
    border-bottom: 1px solid var(--vscode-panel-border);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  #header h2 { font-size: 13px; font-weight: 600; }
  #header .role { font-size: 11px; color: var(--vscode-descriptionForeground); }
  #messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .msg { display: flex; flex-direction: column; max-width: 85%; gap: 2px; }
  .msg.user { align-self: flex-end; align-items: flex-end; }
  .msg.assistant { align-self: flex-start; align-items: flex-start; }
  .msg-label {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
    padding: 0 4px;
  }
  .msg-bubble {
    padding: 8px 12px;
    border-radius: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .msg.user .msg-bubble {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-bottom-right-radius: 4px;
  }
  .msg.assistant .msg-bubble {
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border);
    border-bottom-left-radius: 4px;
  }
  #thinking {
    display: none;
    padding: 8px 16px;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }
  #input-area {
    display: flex;
    gap: 8px;
    padding: 10px 16px;
    border-top: 1px solid var(--vscode-panel-border);
    background: var(--vscode-editor-background);
    flex-shrink: 0;
  }
  #input {
    flex: 1;
    padding: 7px 10px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    resize: none;
    outline: none;
    min-height: 36px;
    max-height: 120px;
  }
  #input:focus { border-color: var(--vscode-focusBorder); }
  #send-btn {
    padding: 7px 14px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    align-self: flex-end;
  }
  #send-btn:hover { background: var(--vscode-button-hoverBackground); }
  #send-btn:disabled { opacity: 0.5; cursor: default; }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    color: var(--vscode-descriptionForeground);
    font-size: 13px;
  }
  .empty-state .icon { font-size: 32px; }
</style>
</head>
<body>
<div id="header">
  <div>
    <h2>${title}</h2>
    <div class="role">${this._isGroupChat ? 'Alpha Squad 전체' : (this._persona)}</div>
  </div>
</div>
<div id="messages">
  <div class="empty-state" id="empty-state">
    <div class="icon">💬</div>
    <div>대화를 시작해보세요</div>
  </div>
</div>
<div id="thinking">응답 중...</div>
<div id="input-area">
  <textarea id="input" placeholder="메시지 입력 (Shift+Enter: 줄바꿈, Enter: 전송)" rows="1"></textarea>
  <button id="send-btn">전송</button>
</div>
<script>
  const vscode = acquireVsCodeApi();
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const sendBtn = document.getElementById('send-btn');
  const thinkingEl = document.getElementById('thinking');
  const emptyState = document.getElementById('empty-state');

  function addMessage(msg) {
    if (emptyState) emptyState.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'msg ' + msg.role;
    const label = msg.role === 'user' ? '대표님' : '${title}';
    div.innerHTML = \`
      <div class="msg-label">\${label}</div>
      <div class="msg-bubble">\${escapeHtml(msg.content)}</div>
    \`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg.type === 'loadHistory') {
      messagesEl.innerHTML = '';
      if (msg.messages.length === 0) {
        messagesEl.innerHTML = '<div class="empty-state" id="empty-state"><div class="icon">💬</div><div>대화를 시작해보세요</div></div>';
      } else {
        msg.messages.forEach(addMessage);
      }
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
