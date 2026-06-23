# ============================================================
#  LONGRISE AI MASTER ROADMAP — Flask + Gemini AI App
#  실행: python app.py  →  http://localhost:5000
# ============================================================
#  설치: pip install flask google-genai
# ============================================================

from flask import Flask, render_template_string, request, jsonify, Response, stream_with_context
from google import genai
from google.genai import types
import json, os, re

app = Flask(__name__)
app.secret_key = "longrise-secret-2026"

# ── Gemini 설정 ──────────────────────────────────────────────
GEMINI_API_KEY = "AIzaSyAaZk34tU1VPKqVjiV34PWx88O6FxKzBxc"  # ← 환경변수 또는 직접 입력
client = genai.Client(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-3-flash-preview"

# ── 초기 태스크 데이터 ────────────────────────────────────────
INITIAL_TASKS = [
    {"id":1,  "ph":1,"tr":"PLAN",   "st":"DONE",    "title":"마스터플랜 및 4대 보상 시나리오 확정",    "desc":"수익 캡(400%) 도달 시뮬레이션 및 다이내믹 APY 정책서 작성 완료",          "link":"","progress":100},
    {"id":2,  "ph":1,"tr":"FINANCE","st":"DONE",    "title":"초기 예산 배정 및 80/20 자금 분리",       "desc":"커뮤니티 리저브(80%) 및 마케팅 기금(20%) 물리적 분리 정책 확립 완료",    "link":"https://docs.google.com/document/d/1C9flPSyLE3IXSNOi42AGSePOdJDigipqnNG6bWIbZjY/edit","progress":100},
    {"id":3,  "ph":1,"tr":"SALES",  "st":"DONE",    "title":"공식 백서 확정 및 VVIP 피치덱 완성",      "desc":"일반/VIP 대상 피치덱 배포 및 3,000명 조직 구축 영업 자료 완성",          "link":"https://docs.google.com/document/d/14cJOCW88qGWf-5TzD-4myb5k2BiIRB7i0xEpyDwraeE/edit","progress":100},
    {"id":4,  "ph":1,"tr":"TECH",   "st":"DONE",    "title":"보상 로직 전산화 및 엔진 백테스팅",       "desc":"뉴럴 엔진 거래소 연동 및 10% 낙수 매칭 로직 전산화 검증 완료",           "link":"","progress":100},
    {"id":5,  "ph":1,"tr":"OPSEC",  "st":"DONE",    "title":"오프쇼어 인프라 및 보안 예산 확정",       "desc":"오프쇼어 코어 인프라(Brain) 및 보안 설계 세부 예산(CAPEX) 확정 완료",    "link":"https://docs.google.com/document/d/1x1Jtsm_Vzq9skscdn9vYbzOuBAk6OQfrPI_qCvawK4g/edit","progress":100},
    {"id":6,  "ph":2,"tr":"PLAN",   "st":"DONE",    "title":"공식 플랫폼 웹사이트 배포",               "desc":"다국어 지원 공식 웹사이트 배포 완료 및 리조트 정켓 라운지 이용 규정 수립", "link":"https://lrplat.edgeone.app/","progress":100},
    {"id":7,  "ph":2,"tr":"TECH",   "st":"DONE",    "title":"백오피스 연동 및 CBT 가동",               "desc":"웹 플랫폼 백오피스 연동 및 전산망 실거래(CBT) 테스트 정상 가동 확인",    "link":"https://lrplat.edgeone.app/","progress":100},
    {"id":8,  "ph":2,"tr":"SALES",  "st":"DONE",    "title":"글로벌 공식 홈페이지 배포 및 사전 마케팅","desc":"사전 마케팅용 글로벌 홈페이지 라이브 배포 및 글로벌 앰버서더 영업 개시",  "link":"https://longrisehome.edgeone.app/","progress":100},
    {"id":9,  "ph":2,"tr":"FINANCE","st":"DONE",    "title":"비용 및 예상 수익 마스터 시뮬레이션",     "desc":"26.03~27.12 전체 월별 현금 흐름 및 내/외부 5억 투자 배당 시뮬레이션 완료","link":"https://docs.google.com/document/d/1C9flPSyLE3IXSNOi42AGSePOdJDigipqnNG6bWIbZjY/edit","progress":100},
    {"id":10, "ph":2,"tr":"OPSEC",  "st":"PENDING", "title":"스마트 컨트랙트 오딧 및 자금 익명화 점검","desc":"CertiK 보안 감사 수검 및 믹싱 처리 프로세스 스트레스 테스트",             "link":"","progress":0},
    {"id":11, "ph":3,"tr":"PLAN",   "st":"PENDING", "title":"글로벌 VVIP 킥오프 행사 총괄 기획",       "desc":"마카오/싱가포르 행사 대관, 의전, 식순 등 세부 기획",                      "link":"","progress":0},
    {"id":12, "ph":3,"tr":"TECH",   "st":"PENDING", "title":"디도스 방어망 구축 및 모의 해킹",         "desc":"네트워크 과부하 대비 스케일아웃 및 외부 모의 해킹 방어 테스트",           "link":"","progress":0},
    {"id":13, "ph":3,"tr":"SALES",  "st":"PENDING", "title":"킥오프 행사 개최 및 프리세일 영업",       "desc":"오프라인 행사 진행 및 초기 패키지 전산 등록 채널 1차 오픈",               "link":"","progress":0},
    {"id":14, "ph":3,"tr":"FINANCE","st":"PENDING", "title":"상장 유동성(LP) 예치금 및 마케팅 풀 조성","desc":"프리세일 투자금 수취 및 거래소 상장 예비 자금 물리적 분리 완료",           "link":"","progress":0},
    {"id":15, "ph":3,"tr":"OPSEC",  "st":"PENDING", "title":"거래소 상장 법무 검토 및 시범 연동",      "desc":"상장 컴플라이언스 완료 및 카지노 현장 POS 모듈 시범 연동",               "link":"","progress":0},
    {"id":16, "ph":4,"tr":"PLAN",   "st":"PENDING", "title":"그랜드 오픈 운영 총괄 및 비상 대응",      "desc":"오픈 시나리오 전면 가동 및 글로벌 CS/장애 대응 컨트롤",                   "link":"","progress":0},
    {"id":17, "ph":4,"tr":"TECH",   "st":"PENDING", "title":"HFT 엔진 정식 가동 및 수당 자동 정산",   "desc":"데일리 수익 생성 개시 및 4대 보상 로직 실시간 블록체인 가동",             "link":"","progress":0},
    {"id":18, "ph":4,"tr":"SALES",  "st":"PENDING", "title":"그랜드 오픈 행사 및 미디어 PR 배포",     "desc":"실물 결제망 1차 오픈 영업 독려 및 글로벌 크립토 미디어 기사 송출",       "link":"","progress":0},
    {"id":19, "ph":4,"tr":"FINANCE","st":"PENDING", "title":"1일차 첫 배당금 지급 및 바이백 집행",    "desc":"첫 데일리 수익 실제 재무 계좌 이체 및 15% 소각 예산 집행",               "link":"","progress":0},
    {"id":20, "ph":4,"tr":"OPSEC",  "st":"PENDING", "title":"글로벌 거래소 상장 실행 및 소각 모니터링","desc":"TGE 완료 및 스마트 컨트랙트 기반 자동 소각 상태 대시보드 점검",          "link":"","progress":0},
]

# ── 메모리 상태 (서버 재시작 전까지 유지) ─────────────────────
tasks_store = [t.copy() for t in INITIAL_TASKS]
chat_history = []   # [{role, content}]

# ── Gemini 시스템 프롬프트 ────────────────────────────────────
SYSTEM_PROMPT = """
너는 LONGRISE AI 프로젝트 관리 대시보드의 AI 어시스턴트야.
사용자의 자연어 요청을 받아 태스크 데이터를 JSON 액션으로 응답한다.

## 응답 규칙
항상 아래 JSON 형식으로 응답해. 반드시 ```json ... ``` 블록 안에 넣어.

```json
{
  "message": "사용자에게 보여줄 자연어 응답",
  "actions": [
    {
      "type": "UPDATE_TASK" | "ADD_TASK" | "DELETE_TASK" | "SET_LINK" | "BULK_UPDATE",
      "payload": { ... }
    }
  ]
}
```

## 액션 타입별 payload

### UPDATE_TASK — 태스크 수정
{"id": 1, "st": "DONE", "progress": 100, "title": "...", "desc": "..."}
- st 값: "DONE" | "IN_PROGRESS" | "PENDING"
- 변경할 필드만 포함 (id는 필수)

### ADD_TASK — 새 태스크 추가
{"ph": 1~4, "tr": "PLAN"|"TECH"|"SALES"|"FINANCE"|"OPSEC", "st": "PENDING", "title": "...", "desc": "...", "link": "", "progress": 0}

### DELETE_TASK — 태스크 삭제
{"id": 1}

### SET_LINK — 드라이브 링크 연결
{"id": 1, "link": "https://drive.google.com/..."}

### BULK_UPDATE — 여러 태스크 일괄 수정
{"updates": [{"id":1,"st":"DONE","progress":100}, ...]}

## 현재 트랙
- PLAN: 기획/전략
- TECH: 기술/개발
- SALES: 영업/마케팅
- FINANCE: 재무/예산
- OPSEC: 보안/운영

## 사용자 요청 예시 처리
- "10번 태스크 완료로 바꿔줘" → UPDATE_TASK {id:10, st:"DONE", progress:100}
- "Phase 3 TECH에 새 태스크 추가해줘, 제목은 ..." → ADD_TASK
- "보안 감사 진행률 50%로 업데이트" → UPDATE_TASK {id:10, progress:50, st:"IN_PROGRESS"}
- actions가 없으면 [] 반환
"""

# ── HTML 템플릿 ───────────────────────────────────────────────
HTML = r"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LONGRISE AI MASTER ROADMAP</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0a;color:#d1d5db;font-family:'Noto Sans KR',system-ui,sans-serif;height:100vh;display:flex;flex-direction:column;overflow:hidden}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#c5a880}

/* ── Header ── */
header{background:#111;border-bottom:1px solid #222;padding:14px 20px;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.logo h1{font-size:20px;font-weight:900;color:#fff;letter-spacing:-.5px}
.logo p{font-size:11px;color:#c5a880;font-weight:700;margin-top:2px}
.status{display:flex;align-items:center;gap:6px;font-size:11px;color:#22c55e;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.dot{width:8px;height:8px;background:#22c55e;border-radius:50%;animation:pulse 1.5s infinite}
.filters{display:flex;gap:5px;flex-wrap:wrap}
.fb{padding:5px 12px;border-radius:5px;border:1px solid #333;font-size:11px;font-weight:700;cursor:pointer;background:transparent;transition:all .15s;color:#888}
.fb:hover{background:#1a1a1a;border-color:#555}
.fb.active{background:#c5a880;color:#000;border-color:#c5a880}
.fb-plan{color:#c4b5fd}.fb-tech{color:#93c5fd}.fb-sales{color:#fca5a5}.fb-finance{color:#fcd34d}.fb-opsec{color:#6ee7b7}

/* ── Layout ── */
.main-wrap{flex:1;display:flex;overflow:hidden}
.board-wrap{flex:1;overflow-x:auto;overflow-y:hidden;padding:16px}
.board{height:100%;display:flex;gap:12px;min-width:800px;max-width:1600px;margin:0 auto}
.col{flex:1;display:flex;flex-direction:column;background:rgba(10,10,10,.9);border:1px solid #222;border-radius:10px;overflow:hidden;min-width:180px}
.col-head{background:#1a1a1a;border-bottom:1px solid #2a2a2a;padding:10px 12px;text-align:center;flex-shrink:0}
.col-head h2{font-size:14px;font-weight:900;color:#fff}
.col-head p{font-size:10px;color:#555;font-weight:700;margin-top:2px}
.col-body{padding:10px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
.col-p4{background:rgba(20,10,10,.95);border-color:#3a0a0a}
.col-p4 .col-head{background:#220a0a;border-color:#3a0a0a}
.col-p4 .col-head h2{color:#fbbf24}

/* ── Card ── */
.card{background:#141414;border:1px solid #222;border-left:3px solid #333;border-radius:7px;padding:11px;display:flex;flex-direction:column;gap:7px;transition:all .2s;cursor:default;animation:fadeIn .2s ease-out}
.card:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.4)}
.card.done{opacity:.65}.card.done:hover{opacity:1}
.tl-plan{border-left-color:#8b5cf6!important}.tl-tech{border-left-color:#3b82f6!important}
.tl-sales{border-left-color:#ef4444!important}.tl-finance{border-left-color:#f59e0b!important}.tl-opsec{border-left-color:#10b981!important}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:6px}
.tb{font-size:9px;font-weight:900;letter-spacing:.08em;padding:2px 7px;border-radius:3px}
.tb-plan{color:#c4b5fd;background:rgba(139,92,246,.15)}.tb-tech{color:#93c5fd;background:rgba(59,130,246,.15)}
.tb-sales{color:#fca5a5;background:rgba(239,68,68,.15)}.tb-finance{color:#fcd34d;background:rgba(245,158,11,.15)}.tb-opsec{color:#6ee7b7;background:rgba(16,185,129,.15)}
.sb{display:flex;align-items:center;gap:3px;font-size:9px;font-weight:900;padding:2px 7px;border-radius:3px}
.sb-done{background:rgba(22,101,52,.35);color:#4ade80;border:1px solid rgba(74,222,128,.15)}
.sb-ip{background:rgba(120,60,0,.4);color:#fbbf24;border:1px solid rgba(251,191,36,.3)}
.sb-pending{background:rgba(20,20,20,.6);color:#555;border:1px solid #2a2a2a}
.card-title{font-size:12px;font-weight:700;line-height:1.4;color:#e5e7eb}
.card-title.striked{color:#555;text-decoration:line-through;text-decoration-color:rgba(74,222,128,.35)}
.card-desc{font-size:10px;color:#555;line-height:1.6}
.prog-bar{height:3px;background:#1f1f1f;border-radius:2px;overflow:hidden}
.prog-fill{height:100%;border-radius:2px;transition:width .4s}
.card-link{display:flex;align-items:center;justify-content:center;gap:4px;width:100%;background:#1a1a1a;color:#c5a880;border:1px solid rgba(197,168,128,.2);border-radius:4px;padding:6px;font-size:10px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s}
.card-link:hover{background:#c5a880;color:#000}

/* ── AI Chat ── */
.chat-panel{width:340px;flex-shrink:0;border-left:1px solid #1a1a1a;display:flex;flex-direction:column;background:#080808}
.chat-header{padding:12px 16px;border-bottom:1px solid #1a1a1a;flex-shrink:0}
.chat-header h3{font-size:13px;font-weight:700;color:#fff}
.chat-header p{font-size:10px;color:#555;margin-top:2px}
.chat-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:90%;padding:8px 11px;border-radius:8px;font-size:12px;line-height:1.6;animation:fadeIn .2s}
.msg-user{align-self:flex-end;background:#1a2a1a;color:#d1fae5;border:1px solid #1f3a1f}
.msg-ai{align-self:flex-start;background:#1a1a1a;color:#d1d5db;border:1px solid #2a2a2a}
.msg-system{align-self:center;background:rgba(197,168,128,.08);color:#c5a880;border:1px solid rgba(197,168,128,.15);font-size:10px;padding:5px 10px;border-radius:20px;text-align:center}
.chat-input-wrap{padding:12px;border-top:1px solid #1a1a1a;flex-shrink:0}
.chat-input-row{display:flex;gap:6px}
#chat-input{flex:1;background:#111;border:1px solid #2a2a2a;border-radius:6px;padding:8px 10px;font-size:12px;color:#fff;outline:none;font-family:inherit;resize:none;height:60px}
#chat-input:focus{border-color:#444}
#send-btn{background:#c5a880;color:#000;border:none;border-radius:6px;padding:0 14px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;transition:all .2s}
#send-btn:hover{background:#d4b896}
#send-btn:disabled{background:#333;color:#666;cursor:not-allowed}
.typing{display:flex;gap:4px;align-items:center;padding:8px 12px}
.typing span{width:5px;height:5px;background:#555;border-radius:50%;animation:bounce .8s infinite}
.typing span:nth-child(2){animation-delay:.15s}.typing span:nth-child(3){animation-delay:.3s}
.quick-btns{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.qb{background:#111;border:1px solid #2a2a2a;color:#888;border-radius:4px;padding:4px 8px;font-size:10px;cursor:pointer;transition:all .15s}
.qb:hover{border-color:#c5a880;color:#c5a880}

/* ── Modal ── */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;align-items:center;justify-content:center}
.overlay.open{display:flex}
.modal{background:#111;border:1px solid #333;border-radius:12px;padding:20px;width:90%;max-width:420px;display:flex;flex-direction:column;gap:12px}
.modal h3{font-size:14px;font-weight:700;color:#fff}
.modal-hint{font-size:11px;color:#555;background:#0a0a0a;border:1px solid #1f1f1f;border-radius:5px;padding:8px 10px;word-break:break-all}
.modal input{background:#0a0a0a;border:1px solid #333;border-radius:5px;padding:8px 10px;font-size:12px;color:#fff;outline:none;width:100%}
.modal input:focus{border-color:#c5a880}
.modal-btns{display:flex;gap:8px;justify-content:flex-end}
.btn-cancel{background:transparent;border:1px solid #333;color:#888;border-radius:5px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer}
.btn-confirm{background:#c5a880;border:none;color:#000;border-radius:5px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer}

@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
</style>
</head>
<body>

<header>
  <div class="logo">
    <h1>LONGRISE AI MASTER ROADMAP</h1>
    <p>Interactive Dashboard — Powered by Gemini AI</p>
  </div>
  <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    <div class="status"><span class="dot"></span>In Progress</div>
    <div class="filters" id="filters">
      <button class="fb active" data-f="ALL">ALL</button>
      <button class="fb fb-plan" data-f="PLAN">PLAN</button>
      <button class="fb fb-tech" data-f="TECH">TECH</button>
      <button class="fb fb-sales" data-f="SALES">SALES</button>
      <button class="fb fb-finance" data-f="FINANCE">FINANCE</button>
      <button class="fb fb-opsec" data-f="OPSEC">OPSEC</button>
    </div>
  </div>
</header>

<div class="main-wrap">
  <!-- Board -->
  <div class="board-wrap">
    <div class="board">
      <div class="col"><div class="col-head"><h2>PHASE 1</h2><p>W1-W5 인프라 구축</p></div><div class="col-body" id="p1"></div></div>
      <div class="col"><div class="col-head"><h2>PHASE 2</h2><p>W6-W9 시스템 검증</p></div><div class="col-body" id="p2"></div></div>
      <div class="col"><div class="col-head"><h2>PHASE 3</h2><p>W10-W13 프리 런칭</p></div><div class="col-body" id="p3"></div></div>
      <div class="col col-p4"><div class="col-head"><h2>PHASE 4 🚀</h2><p>W14-W17 그랜드 오픈</p></div><div class="col-body" id="p4"></div></div>
    </div>
  </div>

  <!-- AI Chat Panel -->
  <div class="chat-panel">
    <div class="chat-header">
      <h3>✦ Gemini AI 어시스턴트</h3>
      <p>대화로 대시보드를 실시간 수정하세요</p>
    </div>
    <div class="chat-body" id="chat-body">
      <div class="msg msg-ai">안녕하세요! LONGRISE 프로젝트 AI 어시스턴트예요.<br><br>태스크 추가·수정·삭제, 진행률 업데이트, 드라이브 링크 연결 등을 자연어로 요청하시면 바로 처리해 드릴게요.</div>
    </div>
    <div class="chat-input-wrap">
      <div class="quick-btns">
        <button class="qb" onclick="quickSend('Phase 3 전체 진행률 알려줘')">📊 Phase 3 현황</button>
        <button class="qb" onclick="quickSend('완료된 태스크 몇 개야?')">✅ 완료 현황</button>
        <button class="qb" onclick="quickSend('다음에 해야 할 태스크는?')">▶ 다음 태스크</button>
        <button class="qb" onclick="quickSend('전체 진행률 요약해줘')">📋 전체 요약</button>
      </div>
      <div class="chat-input-row" style="margin-top:8px">
        <textarea id="chat-input" placeholder="예: '10번 태스크 완료로 바꿔줘'&#10;    'Phase 3 OPSEC에 새 태스크 추가해줘'"></textarea>
        <button id="send-btn" onclick="sendMessage()">전송</button>
      </div>
    </div>
  </div>
</div>

<!-- 링크 열기 확인 모달 -->
<div class="overlay" id="link-modal">
  <div class="modal">
    <h3>🔗 외부 링크 열기</h3>
    <div class="modal-hint" id="link-modal-url"></div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal('link-modal')">취소</button>
      <button class="btn-confirm" id="link-confirm-btn">열기 →</button>
    </div>
  </div>
</div>

<!-- 링크 입력 모달 -->
<div class="overlay" id="set-link-modal">
  <div class="modal">
    <h3>📎 드라이브 링크 연결</h3>
    <div style="font-size:11px;color:#c5a880;font-weight:700" id="set-link-title"></div>
    <input type="text" id="set-link-input" placeholder="https://drive.google.com/file/d/..." />
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal('set-link-modal')">취소</button>
      <button class="btn-confirm" id="set-link-confirm">연결</button>
    </div>
  </div>
</div>

<script>
var tasks = [];
var currentFilter = 'ALL';
var currentLinkUrl = '';
var setLinkTaskId = -1;

// ── 데이터 로드 ────────────────────────────────────────────
async function loadTasks() {
  const res = await fetch('/api/tasks');
  tasks = await res.json();
  renderBoard();
}

// ── 보드 렌더링 ────────────────────────────────────────────
function renderBoard() {
  for (var ph = 1; ph <= 4; ph++) {
    var col = document.getElementById('p' + ph);
    col.innerHTML = '';
    var filtered = tasks.filter(t => t.ph === ph && (currentFilter === 'ALL' || t.tr === currentFilter));
    filtered.forEach(t => {
      col.appendChild(makeCard(t));
    });
  }
}

function makeCard(t) {
  var el = document.createElement('div');
  var done = t.st === 'DONE', ip = t.st === 'IN_PROGRESS';
  el.className = 'card tl-' + t.tr.toLowerCase() + (done ? ' done' : '');

  var sb = done
    ? '<span class="sb sb-done">✓ DONE</span>'
    : (ip ? '<span class="sb sb-ip">⟳ IN PROGRESS</span>' : '<span class="sb sb-pending">◷ PENDING</span>');

  var progColor = t.progress >= 100 ? '#22c55e' : t.progress >= 50 ? '#3b82f6' : '#f59e0b';
  var prog = '<div class="prog-bar"><div class="prog-fill" style="width:' + t.progress + '%;background:' + progColor + '"></div></div>';

  var linkArea = t.link
    ? '<a class="card-link" href="#" onclick="openLink(event,\'' + t.link + '\')">🔗 문서 열기</a>'
    : '<a class="card-link" style="color:#444;border-color:#1f1f1f" href="#" onclick="openSetLink(event,' + t.id + ',\'' + (t.title||'').replace(/'/g,"\\'") + '\')">+ 링크 연결</a>';

  el.innerHTML =
    '<div class="card-top"><span class="tb tb-' + t.tr.toLowerCase() + '">' + t.tr + '</span>' + sb + '</div>' +
    '<div class="card-title' + (done ? ' striked' : '') + '">[' + t.id + '] ' + t.title + '</div>' +
    '<div class="card-desc">' + t.desc + '</div>' +
    prog +
    '<div style="font-size:9px;color:#444;text-align:right">' + t.progress + '%</div>' +
    linkArea;
  return el;
}

// ── 링크 열기 ──────────────────────────────────────────────
function openLink(e, url) {
  e.preventDefault();
  currentLinkUrl = url;
  document.getElementById('link-modal-url').textContent = url;
  document.getElementById('link-confirm-btn').onclick = function() {
    window.open(currentLinkUrl, '_blank');
    closeModal('link-modal');
  };
  document.getElementById('link-modal').classList.add('open');
}

function openSetLink(e, id, title) {
  e.preventDefault();
  setLinkTaskId = id;
  document.getElementById('set-link-title').textContent = '[' + id + '] ' + title;
  document.getElementById('set-link-input').value = '';
  document.getElementById('set-link-modal').classList.add('open');
  setTimeout(() => document.getElementById('set-link-input').focus(), 100);
}

document.getElementById('set-link-confirm').addEventListener('click', async function() {
  var url = document.getElementById('set-link-input').value.trim();
  if (!url.startsWith('http')) {
    document.getElementById('set-link-input').style.borderColor = '#ef4444';
    return;
  }
  await fetch('/api/tasks/set_link', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id: setLinkTaskId, link: url})
  });
  closeModal('set-link-modal');
  await loadTasks();
  addMsg('system', '[' + setLinkTaskId + '] 링크 연결 완료');
});

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ── 필터 ──────────────────────────────────────────────────
document.getElementById('filters').addEventListener('click', function(e) {
  var btn = e.target.closest('.fb');
  if (!btn) return;
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.f;
  renderBoard();
});

// ── 채팅 ──────────────────────────────────────────────────
document.getElementById('chat-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

function quickSend(msg) {
  document.getElementById('chat-input').value = msg;
  sendMessage();
}

function addMsg(role, text) {
  var body = document.getElementById('chat-body');
  var div = document.createElement('div');
  div.className = role === 'user' ? 'msg msg-user' : (role === 'system' ? 'msg msg-system' : 'msg msg-ai');
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  return div;
}

function addTyping() {
  var body = document.getElementById('chat-body');
  var div = document.createElement('div');
  div.className = 'msg msg-ai typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

async function sendMessage() {
  var input = document.getElementById('chat-input');
  var msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  document.getElementById('send-btn').disabled = true;
  addMsg('user', msg);
  addTyping();

  // AI 응답 버블 미리 생성 (스트리밍 텍스트 채울 용도)
  var body = document.getElementById('chat-body');
  var aiBubble = null;
  var fullText = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: msg, tasks: tasks})
    });

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';

    while (true) {
      var {done, value} = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {stream: true});
      var lines = buffer.split('\n\n');
      buffer = lines.pop();

      for (var line of lines) {
        if (!line.startsWith('data: ')) continue;
        var payload = JSON.parse(line.slice(6));

        if (payload.type === 'chunk') {
          // 타이핑 인디케이터 제거 후 버블 생성
          var typing = document.getElementById('typing-indicator');
          if (typing) typing.remove();
          if (!aiBubble) {
            aiBubble = document.createElement('div');
            aiBubble.className = 'msg msg-ai';
            body.appendChild(aiBubble);
          }
          fullText += payload.text;
          // ```json 블록은 UI에 표시 안 함
          aiBubble.textContent = fullText.replace(/```json[\s\S]*?```/g, '').trim();
          body.scrollTop = body.scrollHeight;

        } else if (payload.type === 'done') {
          if (aiBubble) aiBubble.textContent = payload.message.replace(/```json[\s\S]*?```/g, '').trim();
          if (payload.actions && payload.actions.length > 0) {
            const applyRes = await fetch('/api/tasks/apply', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({actions: payload.actions})
            });
            const applyData = await applyRes.json();
            tasks = applyData.tasks;
            renderBoard();
            addMsg('system', '✓ ' + payload.actions.length + '개 변경 사항 적용됨');
          }

        } else if (payload.type === 'error') {
          var typing = document.getElementById('typing-indicator');
          if (typing) typing.remove();
          addMsg('ai', payload.message);
        }
      }
    }
  } catch(err) {
    var typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
    addMsg('ai', '연결 오류가 발생했어요: ' + err.message);
  }

  document.getElementById('send-btn').disabled = false;
}

// ── 초기 로드 ─────────────────────────────────────────────
loadTasks();
</script>
</body>
</html>
"""

# ── API 라우트 ────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template_string(HTML)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks_store)

@app.route('/api/tasks/set_link', methods=['POST'])
def set_link():
    data = request.json
    for t in tasks_store:
        if t['id'] == data['id']:
            t['link'] = data['link']
            break
    return jsonify({'ok': True})

@app.route('/api/tasks/apply', methods=['POST'])
def apply_actions():
    data = request.json
    actions = data.get('actions', [])
    next_id = max(t['id'] for t in tasks_store) + 1 if tasks_store else 1

    for action in actions:
        atype = action.get('type')
        payload = action.get('payload', {})

        if atype == 'UPDATE_TASK':
            for t in tasks_store:
                if t['id'] == payload.get('id'):
                    for k, v in payload.items():
                        if k != 'id':
                            t[k] = v
                    break

        elif atype == 'ADD_TASK':
            new_task = {
                'id': next_id, 'ph': payload.get('ph', 1),
                'tr': payload.get('tr', 'PLAN'), 'st': payload.get('st', 'PENDING'),
                'title': payload.get('title', '새 태스크'),
                'desc': payload.get('desc', ''),
                'link': payload.get('link', ''),
                'progress': payload.get('progress', 0)
            }
            tasks_store.append(new_task)
            next_id += 1

        elif atype == 'DELETE_TASK':
            tasks_store[:] = [t for t in tasks_store if t['id'] != payload.get('id')]

        elif atype == 'SET_LINK':
            for t in tasks_store:
                if t['id'] == payload.get('id'):
                    t['link'] = payload.get('link', '')
                    break

        elif atype == 'BULK_UPDATE':
            for upd in payload.get('updates', []):
                for t in tasks_store:
                    if t['id'] == upd.get('id'):
                        for k, v in upd.items():
                            if k != 'id':
                                t[k] = v
                        break

    return jsonify({'tasks': tasks_store})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_msg = data.get('message', '')
    current_tasks = data.get('tasks', tasks_store)

    tasks_summary = json.dumps(current_tasks, ensure_ascii=False)
    full_prompt = SYSTEM_PROMPT + f"\n\n현재 태스크 데이터:\n{tasks_summary}" + "\n\n사용자: " + user_msg

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=full_prompt)],
        )
    ]
    generate_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="HIGH"),
    )

    def stream_response():
        full_text = ""
        try:
            for chunk in client.models.generate_content_stream(
                model=GEMINI_MODEL,
                contents=contents,
                config=generate_config,
            ):
                if chunk.text:
                    full_text += chunk.text
                    # 스트리밍 중 텍스트를 SSE로 전달
                    yield f"data: {json.dumps({'type': 'chunk', 'text': chunk.text}, ensure_ascii=False)}\n\n"

            # 완료 후 JSON 액션 추출
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', full_text)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(1))
                    actions = parsed.get('actions', [])
                    message = parsed.get('message', full_text)
                except json.JSONDecodeError:
                    actions = []
                    message = full_text
            else:
                actions = []
                message = full_text

            chat_history.append({'role': 'user', 'content': user_msg})
            chat_history.append({'role': 'assistant', 'content': message})

            yield f"data: {json.dumps({'type': 'done', 'message': message, 'actions': actions}, ensure_ascii=False)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Gemini 오류: {str(e)}'}, ensure_ascii=False)}\n\n"

    return Response(stream_with_context(stream_response()), mimetype='text/event-stream')

# ── 실행 ──────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 50)
    print("  LONGRISE AI DASHBOARD")
    print("  http://localhost:5000 에서 실행 중")
    print("=" * 50)
    app.run(debug=True, port=5000)