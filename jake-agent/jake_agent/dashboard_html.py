DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1300, initial-scale=0.3, minimum-scale=0.15, maximum-scale=4, user-scalable=yes">
<title>ALPHA SQUAD — Org Chart</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #0a0d14; color: #e6e6e6; font-family: -apple-system, 'Malgun Gothic', sans-serif; height: 100%; overflow-x: hidden; }
  #header {
    padding: 18px 24px 10px; display: flex; align-items: baseline; gap: 14px; position: relative; z-index: 5;
  }
  #header h1 { font-size: 20px; font-weight: 800; color: #5ff0ff; letter-spacing: 1.5px; text-shadow: 0 0 14px rgba(95,240,255,0.5); }
  #header .sub { font-size: 11px; color: #5a7184; letter-spacing: 1px; }
  #header .status { font-size: 11px; color: #4a6577; margin-left: auto; }
  .cost-widget {
    font-size: 11.5px; color: #ffd76a; background: rgba(255,215,106,0.08);
    border: 1px solid rgba(255,215,106,0.25); border-radius: 14px; padding: 4px 12px;
    cursor: pointer; margin-left: auto;
  }
  .cost-widget:hover { background: rgba(255,215,106,0.16); }
  #costPanel {
    position: fixed; top: 60px; right: 20px; width: 300px; max-height: 50vh; overflow-y: auto;
    background: rgba(12,16,24,0.97); border: 1px solid rgba(255,215,106,0.3); border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.6); padding: 14px; display: none; z-index: 50;
  }
  #costPanel.show { display: block; }
  #costPanel h3 { font-size: 12px; color: #ffd76a; margin-bottom: 10px; }
  .cost-row { display: flex; justify-content: space-between; font-size: 12px; color: #c5cdd6; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .cost-row .name { color: #9fb4c4; }
  .cost-row .val { color: #ffd76a; font-weight: 600; }
  #costNote { font-size: 10px; color: #5a7184; margin-top: 10px; line-height: 1.5; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80; display: inline-block; margin-right: 5px; animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  #chart { position: relative; padding: 30px 20px 60px; min-height: calc(100vh - 70px); display: flex; flex-direction: column; align-items: center; }
  svg#lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }

  .level { display: flex; justify-content: center; gap: 24px; position: relative; z-index: 2; margin-bottom: 56px; }
  .level-members { flex-wrap: nowrap; max-width: none; gap: 10px; margin-bottom: 28px; }
  .level-members .card { padding: 8px 10px; gap: 6px; }
  .level-members .avatar { width: 28px; height: 28px; font-size: 13px; }
  .level-members .info .name { font-size: 11px; }
  .level-members .info .role { font-size: 8.5px; }
  .level-subteam { position: relative; height: 56px; width: 100%; margin-bottom: 0; }
  .level-subteam .card { position: absolute; top: 0; transform: translateX(-50%); padding: 9px 14px; white-space: nowrap; }
  .level-subteam .avatar { width: 30px; height: 30px; font-size: 13px; }
  .level-subteam .info .name { font-size: 12px; }
  .level-subteam .info .role { font-size: 9.5px; }
  .level-members .info .name, .level-members .info .role,
  .level-subteam .info .name, .level-subteam .info .role { white-space: nowrap; }
  #chart { overflow-x: visible; }

  .card {
    background: linear-gradient(160deg, rgba(22,28,38,0.95), rgba(14,18,26,0.95));
    border: 1px solid rgba(95,240,255,0.15);
    border-radius: 12px;
    padding: 12px 18px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.4);
    transition: box-shadow 0.4s ease, border-color 0.4s ease, transform 0.4s ease;
  }
  /* 이슈 없을 때는 완전 정적 — 이슈(pending/failed/held) 발생 시에만 glow-* 클래스로 애니메이션 부여 */
  .avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .info .name { font-size: 13.5px; font-weight: 700; line-height: 1.3; }
  .info .role { font-size: 10.5px; color: #6b7d8f; }

  .card.ceo { padding: 16px 26px; border-color: rgba(255,215,106,0.4); }
  .card.ceo .avatar { width: 46px; height: 46px; background: radial-gradient(circle, #ffe9a8, #ffd76a); box-shadow: 0 0 16px rgba(255,215,106,0.5); }
  .card.ceo .info .name { font-size: 16px; color: #ffd76a; }
  .card.ceo .info .role { color: #b89a4e; }

  .card.coo { padding: 14px 22px; border-color: rgba(95,240,255,0.4); }
  .card.coo .avatar { width: 42px; height: 42px; background: radial-gradient(circle, #aef6ff, #5ff0ff); box-shadow: 0 0 16px rgba(95,240,255,0.5); }
  .card.coo .info .name { font-size: 14.5px; color: #5ff0ff; }
  .card.coo .info .role { color: #3f9aa8; }

  .card.member .avatar { background: linear-gradient(160deg, #3a4654, #232b35); border: 1px solid rgba(95,240,255,0.2); }
  .card.member .info .role { color: #5a7184; }

  .card.active {
    border-color: #4ade80 !important;
    box-shadow: 0 4px 18px rgba(0,0,0,0.4), 0 0 26px rgba(74,222,128,0.55) !important;
    transform: translateY(-3px);
    animation: none !important;
  }
  .card.active .avatar { background: radial-gradient(circle, #b7ffcf, #4ade80) !important; box-shadow: 0 0 16px rgba(74,222,128,0.6); }
  .card.active .info .name { color: #4ade80; }

  #log {
    position: fixed; right: 0; top: 0; bottom: 0; width: 320px; z-index: 10;
    background: rgba(8,12,20,0.85); backdrop-filter: blur(10px);
    border-left: 1px solid rgba(95,240,255,0.15);
    overflow-y: auto; padding: 80px 14px 14px;
  }
  #log h2 { font-size: 11px; color: #4a6577; margin-bottom: 10px; letter-spacing: 2px; text-transform: uppercase; }
  #streamTabs { display: flex; gap: 5px; margin-bottom: 12px; flex-wrap: wrap; }
  #streamTabs .tab {
    background: rgba(95,240,255,0.06); border: 1px solid rgba(95,240,255,0.15); color: #6b7d8f;
    border-radius: 14px; padding: 4px 10px; font-size: 10.5px; cursor: pointer; transition: all 0.2s;
  }
  #streamTabs .tab.active { background: rgba(95,240,255,0.18); border-color: rgba(95,240,255,0.5); color: #5ff0ff; }
  #streamTabs .tab:hover { color: #c5cdd6; }
  #events { max-height: 460px; overflow-y: auto; padding-right: 2px; }
  .event { background: rgba(20,28,40,0.7); border: 1px solid rgba(95,240,255,0.12); border-radius: 10px; padding: 11px 13px; margin-bottom: 9px; font-size: 12px; animation: slideIn 0.5s cubic-bezier(.2,.8,.2,1); cursor: pointer; }
  .event.fresh { box-shadow: 0 0 18px rgba(74,222,128,0.35); border-color: rgba(74,222,128,0.4); }
  .event .route { color: #5ff0ff; font-weight: 700; margin-bottom: 5px; font-size: 12.5px; }
  .event .task { color: #c5cdd6; margin-bottom: 5px; line-height: 1.4; }
  .event .task.collapsed { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .event .detail { display: none; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(95,240,255,0.1); color: #9fb4c4; font-size: 11.5px; line-height: 1.5; }
  .event.expanded .detail { display: block; }
  .event .detail .label { color: #5a7184; font-size: 10px; letter-spacing: 0.5px; margin-bottom: 2px; }
  .event .more { color: #3f9aa8; font-size: 10.5px; margin-top: 2px; }
  .event .time { color: #44546a; font-size: 10px; }
  .status-completed { color: #4ade80; } .status-pending { color: #fbbf24; } .status-failed { color: #f87171; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  #empty { color: #34465a; font-size: 12px; text-align: center; padding: 40px 10px; line-height: 1.6; }

  body { padding-right: 320px; }

  .bell-wrap { position: absolute; top: -6px; right: -10px; cursor: pointer; z-index: 6; }
  .bell-icon { font-size: 18px; filter: drop-shadow(0 0 4px rgba(255,215,106,0.5)); }
  .bell-badge {
    position: absolute; top: -4px; right: -6px; min-width: 16px; height: 16px; border-radius: 8px;
    background: #f87171; color: #fff; font-size: 9.5px; font-weight: 700; display: none;
    align-items: center; justify-content: center; padding: 0 4px; box-shadow: 0 0 6px rgba(248,113,113,0.7);
  }
  .bell-badge.show { display: flex; }
  .card { position: relative; }
  .status-badge { display: none; }

  /* 이슈(pending/failed/held)가 있는 동안만 계속 펄스 — 없으면 완전 정적 */
  .card.glow-pending { animation: glowPulse 2.4s ease-in-out infinite; --glow: 251,191,36; }
  .card.glow-failed  { animation: glowPulse 2.4s ease-in-out infinite; --glow: 248,113,113; }
  .card.glow-held    { animation: glowPulse 2.4s ease-in-out infinite; --glow: 148,163,184; }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 4px 18px rgba(0,0,0,0.4), 0 0 10px rgba(var(--glow), 0.25), inset 0 0 14px rgba(var(--glow), 0.06); border-color: rgba(var(--glow), 0.45); }
    50%      { box-shadow: 0 4px 18px rgba(0,0,0,0.4), 0 0 34px rgba(var(--glow), 0.65), inset 0 0 22px rgba(var(--glow), 0.16); border-color: rgba(var(--glow), 0.8); }
  }
  /* completed/approved로 막 전환된 순간만 한 번 반짝 — 이후 완전 정적으로 복귀 */
  .card.flash-once { animation: flashOnce 1.4s ease-out 1; }
  @keyframes flashOnce {
    0%   { box-shadow: 0 4px 18px rgba(0,0,0,0.4), 0 0 6px rgba(var(--glow), 0.1); border-color: rgba(var(--glow), 0.3); }
    35%  { box-shadow: 0 4px 18px rgba(0,0,0,0.4), 0 0 32px rgba(var(--glow), 0.75); border-color: rgba(var(--glow), 0.9); }
    100% { box-shadow: 0 4px 18px rgba(0,0,0,0.4), 0 0 0 rgba(var(--glow), 0); border-color: rgba(95,240,255,0.15); }
  }

  #attentionPanel {
    position: fixed; top: 70px; left: 50%; transform: translateX(-50%) translateY(-10px);
    width: 420px; max-height: 60vh; overflow-y: auto; z-index: 50;
    background: rgba(12,16,24,0.97); border: 1px solid rgba(255,215,106,0.3); border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.6); padding: 16px; display: none; opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  #attentionPanel.show { display: block; opacity: 1; transform: translateX(-50%) translateY(0); }
  #attentionPanel h3 { font-size: 12px; color: #ffd76a; letter-spacing: 1px; margin-bottom: 10px; }
  #bulkActions { display: flex; gap: 7px; margin-bottom: 14px; }
  .bulk-btn { flex: 1; border: none; border-radius: 8px; padding: 8px 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
  .bulk-btn.approve { background: rgba(74,222,128,0.18); color: #4ade80; }
  .bulk-btn.hold { background: rgba(148,163,184,0.18); color: #c5cdd6; }
  .bulk-btn.delete { background: rgba(248,113,113,0.18); color: #f87171; }
  .bulk-btn:hover { filter: brightness(1.25); }
  .bulk-btn:disabled { opacity: 0.35; cursor: default; }
  #attentionPanel .sec-label { font-size: 10.5px; color: #5a7184; margin: 12px 0 6px; letter-spacing: 1px; }
  .att-item { border-radius: 8px; padding: 9px 11px; margin-bottom: 7px; font-size: 12px; }
  .att-item.failed { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.3); }
  .att-item.pending { background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.2); }
  .att-item .route { font-weight: 700; margin-bottom: 4px; font-size: 11.5px; }
  .att-item.failed .route { color: #f87171; }
  .att-item.pending .route { color: #fbbf24; }
  .att-item .text { color: #c5cdd6; line-height: 1.4; }
  .att-item .text.brief { color: #9fb4c4; font-size: 11px; }
  #attentionEmpty { color: #34465a; font-size: 12px; text-align: center; padding: 20px 0; }
  .att-actions { display: flex; gap: 6px; margin-top: 8px; }
  .act-btn { border: none; border-radius: 6px; padding: 5px 10px; font-size: 11px; cursor: pointer; font-weight: 600; }
  .act-btn.approve { background: rgba(74,222,128,0.18); color: #4ade80; }
  .act-btn.hold { background: rgba(107,125,143,0.25); color: #c5cdd6; }
  .act-btn.delete { background: rgba(248,113,113,0.15); color: #f87171; margin-left: auto; }
  .act-btn:hover { filter: brightness(1.3); }
</style>
</head>
<body>
<div id="header">
  <h1>ALPHA SQUAD</h1>
  <div class="sub">ALPHA SQUAD KADE COMPANY · LIVE ORG CHART</div>
  <div class="cost-widget" id="costWidget">💰 <span id="costValue">—</span> 이번달</div>
  <div class="status" id="status"><span class="dot"></span>연결 중...</div>
</div>

<div id="costPanel">
  <h3>💰 이번 달 API 비용</h3>
  <div id="costBody"></div>
  <div id="costNote"></div>
</div>

<div id="chart">
  <svg id="lines"></svg>

  <div class="level level-ceo">
    <div class="card ceo" id="card-대표님">
      <div class="bell-wrap" id="bellWrap">
        <span class="bell-icon">🔔</span>
        <span class="bell-badge" id="bellBadge">0</span>
      </div>
      <div class="status-badge" id="badge-대표님"></div>
      <div class="avatar">🧑‍💼</div>
      <div class="info"><div class="name">Kade YEO</div><div class="role">CEO</div></div>
    </div>
  </div>

  <div class="level level-coo">
    <div class="card coo" id="card-제이크">
      <div class="status-badge" id="badge-제이크"></div>
      <div class="avatar">🧠</div>
      <div class="info"><div class="name">제이크</div><div class="role">COO</div></div>
    </div>
  </div>

  <div class="level level-members" id="members"></div>
  <div class="level level-subteam" id="subteam"></div>
</div>

<div id="log">
  <h2>Activity Stream</h2>
  <div id="streamTabs">
    <button class="tab active" data-status="all">전체</button>
    <button class="tab" data-status="pending">대기</button>
    <button class="tab" data-status="completed">완료</button>
    <button class="tab" data-status="failed">실패</button>
    <button class="tab" data-status="held">보류</button>
  </div>
  <div id="empty">신호 대기 중...<br>팀원 간 위임이 발생하면<br>여기에 표시됩니다.</div>
  <div id="events"></div>
</div>

<div id="attentionPanel">
  <h3>🔔 확인이 필요한 작업</h3>
  <div id="bulkActions">
    <button class="bulk-btn approve" id="bulkApprove">전체 승인</button>
    <button class="bulk-btn hold" id="bulkHold">전체 보류</button>
    <button class="bulk-btn delete" id="bulkDelete">전체 삭제</button>
  </div>
  <div id="attentionEmpty">현재 미완료 작업이 없습니다</div>
  <div id="attentionBody"></div>
</div>

<script>
// 제이크(COO) 직속 11인 — 본부장/CFO급, 전부 동급(피어)
const DIRECT_REPORTS = ["다인","렉스","루나","제로","바쿠","피오","리리","에바","미나","카이","설리"];
// 팀장급 — 각자의 본부장 산하 (제이크 직속 아님)
const SUB_REPORTS = { "사라": "에바", "노바": "렉스" };
const MEMBERS = [...DIRECT_REPORTS, ...Object.keys(SUB_REPORTS)];
const ROLES = {
  "다인":"기획본부장","렉스":"AI시스템본부장","루나":"CFO","제로":"보안본부장","바쿠":"데이터본부장",
  "피오":"백엔드본부장","리리":"프론트엔드본부장","에바":"UXR본부장","사라":"UXR팀장(에바 산하)",
  "미나":"CRO본부장","카이":"GTM본부장","설리":"QA본부장","노바":"DevOps팀장(렉스 산하)"
};
const ICONS = {
  "다인":"📋","렉스":"🤖","루나":"💰","제로":"🛡️","바쿠":"📊",
  "피오":"🛠️","리리":"🎨","에바":"🔬","사라":"🧪",
  "미나":"📈","카이":"🚀","설리":"🔎","노바":"⚙️"
};
const ALL_NAMES = ["대표님", "제이크", ...MEMBERS];

function buildCard(name, sizeClass) {
  const div = document.createElement('div');
  div.className = 'card member' + (sizeClass || '');
  div.id = 'card-' + name;
  div.innerHTML = '<div class="status-badge" id="badge-' + name + '"></div><div class="avatar">' + ICONS[name] + '</div><div class="info"><div class="name">' + name + '</div><div class="role">' + ROLES[name] + '</div></div>';
  return div;
}

const membersEl = document.getElementById('members');
DIRECT_REPORTS.forEach(name => membersEl.appendChild(buildCard(name)));

const subteamEl = document.getElementById('subteam');
Object.keys(SUB_REPORTS).forEach(name => subteamEl.appendChild(buildCard(name)));

const svg = document.getElementById('lines');
const chart = document.getElementById('chart');

function center(el) {
  const r = el.getBoundingClientRect();
  const c = chart.getBoundingClientRect();
  return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top, top: r.top - c.top, bottom: r.bottom - c.top };
}

function elbowPath(p1, p2) {
  const midY = (p1.bottom + p2.top) / 2;
  return 'M ' + p1.x + ' ' + p1.bottom + ' L ' + p1.x + ' ' + midY + ' L ' + p2.x + ' ' + midY + ' L ' + p2.x + ' ' + p2.top;
}

function positionSubteam() {
  const subteamEl2 = document.getElementById('subteam');
  const subRect = subteamEl2.getBoundingClientRect();
  const chartRect = chart.getBoundingClientRect();
  Object.entries(SUB_REPORTS).forEach(([name, parent]) => {
    const parentCard = document.getElementById('card-' + parent);
    const childCard = document.getElementById('card-' + name);
    if (!parentCard || !childCard) return;
    const pRect = parentCard.getBoundingClientRect();
    const parentCenterX = pRect.left + pRect.width / 2 - subRect.left;
    childCard.style.left = parentCenterX + 'px';
  });
}

let staticPaths = [];
function drawStaticLines() {
  positionSubteam();
  svg.innerHTML = '';
  const ceo = center(document.getElementById('card-대표님'));
  const jake = center(document.getElementById('card-제이크'));
  staticPaths = [];

  const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p1.setAttribute('d', elbowPath(ceo, jake));
  p1.setAttribute('stroke', 'rgba(255,215,106,0.35)');
  p1.setAttribute('stroke-width', '1.6');
  p1.setAttribute('fill', 'none');
  svg.appendChild(p1);

  DIRECT_REPORTS.forEach(name => {
    const m = center(document.getElementById('card-' + name));
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', elbowPath(jake, m));
    p.setAttribute('stroke', 'rgba(95,240,255,0.16)');
    p.setAttribute('stroke-width', '1.2');
    p.setAttribute('fill', 'none');
    svg.appendChild(p);
  });

  // 팀장급은 본부장 산하 — 제이크가 아니라 각자의 본부장에서 선 연결
  Object.entries(SUB_REPORTS).forEach(([name, parent]) => {
    const parentPos = center(document.getElementById('card-' + parent));
    const m = center(document.getElementById('card-' + name));
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', elbowPath(parentPos, m));
    p.setAttribute('stroke', 'rgba(165,180,255,0.3)');
    p.setAttribute('stroke-width', '1.2');
    p.setAttribute('stroke-dasharray', '3,3');
    p.setAttribute('fill', 'none');
    svg.appendChild(p);
  });
}
window.addEventListener('resize', drawStaticLines);
setTimeout(drawStaticLines, 50);

function activateCard(name) {
  const el = document.getElementById('card-' + name);
  if (!el) return;
  el.classList.add('active');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('active'), 3000);
}

function flashLine(from, to) {
  const a = document.getElementById('card-' + from), b = document.getElementById('card-' + to);
  if (!a || !b) return;
  const p1 = center(a), p2 = center(b);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const midY = (p1.y + p2.y) / 2;
  const d = p1.y < p2.y
    ? elbowPath({x:p1.x, bottom:p1.bottom}, {x:p2.x, top:p2.top})
    : elbowPath({x:p2.x, bottom:p2.bottom}, {x:p1.x, top:p1.top});
  path.setAttribute('d', d);
  path.setAttribute('stroke', '#4ade80');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('fill', 'none');
  path.setAttribute('filter', 'drop-shadow(0 0 6px rgba(74,222,128,0.8))');
  path.style.opacity = '1';
  path.style.transition = 'opacity 1.2s ease';
  svg.appendChild(path);
  requestAnimationFrame(() => setTimeout(() => { path.style.opacity = '0'; }, 1500));
  setTimeout(() => path.remove(), 3000);
}

let sinceId = 0;
const statusEl = document.getElementById('status');
const eventsEl = document.getElementById('events');
const emptyEl = document.getElementById('empty');

function esc(s) { return (s || '').replace(/</g,'&lt;'); }

// ── Activity Stream: 상태별 탭 필터 + 누적 저장 ──────────────
let streamEvents = [];
let activeTabStatus = 'all';
const freshIds = new Set();

function buildEventCard(ev, isFresh) {
  const div = document.createElement('div');
  div.className = 'event' + (isFresh ? ' fresh' : '');
  const statusClass = 'status-' + ev.status;
  const hasDetail = (ev.instruction && ev.instruction.length > 0) || (ev.result && ev.result.length > 0);
  div.innerHTML =
    '<div class="route">' + ev.from + ' → ' + ev.to + '</div>' +
    '<div class="task collapsed">' + esc(ev.title) + '</div>' +
    (hasDetail ? '<div class="more">자세히 보기 ▾</div>' : '') +
    '<div class="detail">' +
      (ev.instruction ? '<div class="label">요청 내용</div><div style="margin-bottom:8px;">' + esc(ev.instruction) + '</div>' : '') +
      (ev.result ? '<div class="label">결과</div><div>' + esc(ev.result) + '</div>' : '') +
    '</div>' +
    '<div class="time">' + new Date(ev.timestamp).toLocaleTimeString('ko-KR') +
    ' · <span class="' + statusClass + '">' + ev.status + '</span></div>';
  if (hasDetail) {
    div.addEventListener('click', () => {
      div.classList.toggle('expanded');
      const moreEl = div.querySelector('.more');
      const taskEl = div.querySelector('.task');
      if (div.classList.contains('expanded')) { taskEl.classList.remove('collapsed'); if (moreEl) moreEl.textContent = '접기 ▴'; }
      else { taskEl.classList.add('collapsed'); if (moreEl) moreEl.textContent = '자세히 보기 ▾'; }
    });
  }
  return div;
}

function renderStream() {
  const filtered = activeTabStatus === 'all' ? streamEvents : streamEvents.filter(e => e.status === activeTabStatus);
  eventsEl.innerHTML = '';
  emptyEl.style.display = filtered.length === 0 ? 'block' : 'none';
  filtered.forEach(ev => eventsEl.appendChild(buildEventCard(ev, freshIds.has(ev.id))));
}

document.querySelectorAll('#streamTabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#streamTabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTabStatus = btn.dataset.status;
    renderStream();
  });
});

function renderEvent(ev) {
  streamEvents.unshift(ev);
  if (streamEvents.length > 100) streamEvents.length = 100;
  freshIds.add(ev.id);
  setTimeout(() => freshIds.delete(ev.id), 2500);
  renderStream();
}

// ── 카드 백라이트: 이슈(pending/failed/held)일 때만 계속 펄스, 그 외엔 정적 ──
const GLOW_CLASSES = ['glow-pending', 'glow-failed', 'glow-held'];
const ONGOING_GLOW = new Set(['pending', 'failed', 'held']);
const FLASH_COLOR = { completed: '74,222,128', approved: '95,240,255' };
const lastStatus = {};

async function pollStatusMap() {
  try {
    const res = await fetch('/activity/status_map');
    const data = await res.json();
    const statuses = data.statuses || {};
    ALL_NAMES.forEach(name => {
      const el = document.getElementById('card-' + name);
      if (!el) return;
      const st = statuses[name];
      const prev = lastStatus[name];

      if (ONGOING_GLOW.has(st)) {
        el.classList.remove(...GLOW_CLASSES, 'flash-once');
        el.classList.add('glow-' + st);
        el.title = name + ' — ' + st;
      } else if (st && (st === 'completed' || st === 'approved')) {
        el.classList.remove(...GLOW_CLASSES);
        if (st !== prev) {
          el.style.setProperty('--glow', FLASH_COLOR[st]);
          el.classList.remove('flash-once');
          void el.offsetWidth; // 리플로우 강제 — 같은 애니메이션 재실행 보장
          el.classList.add('flash-once');
        }
        el.title = name + ' — ' + st;
      } else {
        el.classList.remove(...GLOW_CLASSES, 'flash-once');
        el.title = name;
      }
      lastStatus[name] = st;
    });
  } catch (e) { /* ignore */ }
}
pollStatusMap();
setInterval(pollStatusMap, 4000);

// ── 종 아이콘: 미완료(failed/pending/held) 작업 ─────────────
const bellWrap = document.getElementById('bellWrap');
const bellBadge = document.getElementById('bellBadge');
const attentionPanel = document.getElementById('attentionPanel');
const attentionBody = document.getElementById('attentionBody');
const attentionEmpty = document.getElementById('attentionEmpty');
const bulkApproveBtn = document.getElementById('bulkApprove');
const bulkHoldBtn = document.getElementById('bulkHold');
const bulkDeleteBtn = document.getElementById('bulkDelete');
let attentionCache = { failed: [], pending: [], held: [] };

async function taskAction(id, action, method) {
  try {
    const res = await fetch('/activity/' + id + (action ? '/' + action : ''), { method });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || '처리 실패. 새로고침 후 다시 시도하세요.');
      return false;
    }
    return true;
  } catch (e) { alert('처리 실패: ' + e.message); return false; }
}

async function bulkAction(items, action, method) {
  if (items.length === 0) return;
  await Promise.all(items.map(t => taskAction(t.id, action, method)));
  pollAttention(); pollStatusMap();
}

bulkApproveBtn.addEventListener('click', () => {
  const items = [...attentionCache.failed, ...attentionCache.pending];
  if (items.length === 0) return;
  if (!confirm(items.length + '건을 모두 승인할까요?')) return;
  bulkAction(items, 'approve', 'POST');
});
bulkHoldBtn.addEventListener('click', () => {
  const items = [...attentionCache.failed, ...attentionCache.pending];
  if (items.length === 0) return;
  if (!confirm(items.length + '건을 모두 보류할까요?')) return;
  bulkAction(items, 'hold', 'POST');
});
bulkDeleteBtn.addEventListener('click', () => {
  const items = [...attentionCache.failed, ...attentionCache.pending, ...attentionCache.held];
  if (items.length === 0) return;
  if (!confirm(items.length + '건을 모두 영구 삭제합니다. 되돌릴 수 없습니다. 계속할까요?')) return;
  bulkAction(items, '', 'DELETE');
});

function actionButtons(t, status) {
  let btns = '';
  if (status === 'failed' || status === 'pending') {
    btns += '<button class="act-btn approve" data-id="' + t.id + '" data-act="approve">승인</button>';
    btns += '<button class="act-btn hold" data-id="' + t.id + '" data-act="hold">보류</button>';
  } else if (status === 'held') {
    btns += '<button class="act-btn approve" data-id="' + t.id + '" data-act="resume">재개</button>';
  }
  btns += '<button class="act-btn delete" data-id="' + t.id + '" data-act="delete">삭제</button>';
  return '<div class="att-actions">' + btns + '</div>';
}

async function pollAttention() {
  try {
    const res = await fetch('/activity/attention');
    const data = await res.json();
    const tasks = data.tasks || [];
    const failed = tasks.filter(t => t.status === 'failed');
    const pending = tasks.filter(t => t.status === 'pending');
    const held = tasks.filter(t => t.status === 'held');
    attentionCache = { failed, pending, held };

    let healthData = { overdue: [], unassigned: [] };
    try {
      const hRes = await fetch('/activity/health');
      healthData = await hRes.json();
    } catch (e) { /* ignore */ }

    const count = failed.length + pending.length + healthData.overdue.length + healthData.unassigned.length;
    bellBadge.textContent = count;
    bellBadge.classList.toggle('show', count > 0);
    bulkApproveBtn.disabled = (failed.length + pending.length) === 0;
    bulkHoldBtn.disabled = (failed.length + pending.length) === 0;
    bulkDeleteBtn.disabled = (failed.length + pending.length + held.length) === 0;

    attentionBody.innerHTML = '';
    attentionEmpty.style.display = count === 0 ? 'block' : 'none';

    if (healthData.overdue.length > 0) {
      attentionBody.innerHTML += '<div class="sec-label">⏰ 기한 초과</div>';
      healthData.overdue.forEach(t => {
        attentionBody.innerHTML +=
          '<div class="att-item failed"><div class="route">' + t.from + ' → ' + t.to + '</div>' +
          '<div class="text brief">' + esc(t.title) + ' (기한: ' + new Date(t.due_date).toLocaleString('ko-KR') + ')</div>' +
          actionButtons(t, t.status) + '</div>';
      });
    }
    if (healthData.unassigned.length > 0) {
      attentionBody.innerHTML += '<div class="sec-label">❓ 담당자 미배정</div>';
      healthData.unassigned.forEach(t => {
        attentionBody.innerHTML +=
          '<div class="att-item pending"><div class="route">' + t.from + ' → (미배정)</div>' +
          '<div class="text brief">' + esc(t.title) + '</div>' +
          '<div class="att-actions"><button class="act-btn delete" data-id="' + t.id + '" data-act="delete">삭제</button></div></div>';
      });
    }

    if (failed.length > 0) {
      attentionBody.innerHTML += '<div class="sec-label">⛔ 실패 — 확인 필요</div>';
      failed.forEach(t => {
        attentionBody.innerHTML +=
          '<div class="att-item failed"><div class="route">' + t.from + ' → ' + t.to + '</div>' +
          '<div class="text">' + esc(t.result || t.title) + '</div>' + actionButtons(t, 'failed') + '</div>';
      });
    }
    if (pending.length > 0) {
      attentionBody.innerHTML += '<div class="sec-label">⏳ 진행 중</div>';
      pending.forEach(t => {
        attentionBody.innerHTML +=
          '<div class="att-item pending"><div class="route">' + t.from + ' → ' + t.to + '</div>' +
          '<div class="text brief">' + esc(t.title) + '</div>' + actionButtons(t, 'pending') + '</div>';
      });
    }
    if (held.length > 0) {
      attentionBody.innerHTML += '<div class="sec-label">⏸ 보류 중</div>';
      held.forEach(t => {
        attentionBody.innerHTML +=
          '<div class="att-item pending"><div class="route">' + t.from + ' → ' + t.to + '</div>' +
          '<div class="text brief">' + esc(t.title) + '</div>' + actionButtons(t, 'held') + '</div>';
      });
    }

    attentionBody.querySelectorAll('.act-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id, act = btn.dataset.act;
        let ok = false;
        if (act === 'delete') {
          if (!confirm('이 작업을 영구적으로 삭제합니다. 되돌릴 수 없습니다. 계속할까요?')) return;
          ok = await taskAction(id, '', 'DELETE');
        } else {
          ok = await taskAction(id, act, 'POST');
        }
        if (ok) { pollAttention(); pollStatusMap(); }
      });
    });
  } catch (e) { /* ignore */ }
}

bellWrap.addEventListener('click', (e) => {
  e.stopPropagation();
  attentionPanel.classList.toggle('show');
});
document.addEventListener('click', (e) => {
  if (!attentionPanel.contains(e.target) && !bellWrap.contains(e.target)) attentionPanel.classList.remove('show');
});

pollAttention();
setInterval(pollAttention, 5000);

// ── 월비용 위젯 ──────────────────────────────────────────
const costWidget = document.getElementById('costWidget');
const costValue = document.getElementById('costValue');
const costPanel = document.getElementById('costPanel');
const costBody = document.getElementById('costBody');
const costNote = document.getElementById('costNote');

async function pollCost() {
  try {
    const res = await fetch('/cost/summary');
    const data = await res.json();
    costValue.textContent = '$' + data.total_this_month.toFixed(2);
    const diff = data.total_this_month - data.prev_month;
    const diffStr = data.prev_month > 0 ? (diff >= 0 ? ' (+$' + diff.toFixed(2) + ')' : ' (-$' + Math.abs(diff).toFixed(2) + ')') : '';
    costBody.innerHTML = data.by_persona.map(p =>
      '<div class="cost-row"><span class="name">' + esc(p.persona) + '</span><span class="val">$' + p.cost.toFixed(4) + '</span></div>'
    ).join('') || '<div style="color:#34465a;font-size:11px;">집계된 사용량 없음</div>';
    costNote.textContent = data.note + (diffStr ? (' 전월 대비' + diffStr) : '');
  } catch (e) { costValue.textContent = '오류'; }
}
costWidget.addEventListener('click', (e) => {
  e.stopPropagation();
  costPanel.classList.toggle('show');
});
document.addEventListener('click', (e) => {
  if (!costPanel.contains(e.target) && !costWidget.contains(e.target)) costPanel.classList.remove('show');
});
pollCost();
setInterval(pollCost, 30000);

async function poll() {
  try {
    const res = await fetch('/activity/recent?since_id=' + sinceId);
    const data = await res.json();
    const newEvents = data.events.slice().reverse();
    if (newEvents.length > 0) {
      emptyEl.style.display = 'none';
      for (const ev of newEvents) {
        sinceId = Math.max(sinceId, ev.id);
        if (ALL_NAMES.includes(ev.from) && ALL_NAMES.includes(ev.to)) {
          flashLine(ev.from, ev.to);
          activateCard(ev.from); activateCard(ev.to);
        }
        renderEvent(ev);
      }
    }
    statusEl.innerHTML = '<span class="dot"></span>LIVE · ' + new Date().toLocaleTimeString('ko-KR');
  } catch (e) {
    statusEl.textContent = '연결 오류: ' + e.message;
  }
}

poll();
setInterval(poll, 3000);
</script>
</body>
</html>"""
