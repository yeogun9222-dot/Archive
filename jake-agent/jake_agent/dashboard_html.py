DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>ALPHA SQUAD — Live Org Chart</title>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #050810; color: #e6e6e6; font-family: -apple-system, 'Malgun Gothic', sans-serif; overflow: hidden; height: 100%; }
  #stars { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
  #header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 10;
    padding: 18px 22px; background: linear-gradient(180deg, rgba(5,8,16,0.95), rgba(5,8,16,0.0));
    display: flex; align-items: baseline; gap: 14px;
  }
  #header h1 {
    font-size: 19px; font-weight: 800; color: #5ff0ff; letter-spacing: 1.5px;
    text-shadow: 0 0 14px rgba(95,240,255,0.7);
  }
  #header .sub { font-size: 11px; color: #5a7184; letter-spacing: 1px; }
  #header .status { font-size: 11px; color: #4a6577; margin-left: auto; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80; display: inline-block; margin-right: 5px; animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  #network { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; z-index: 1; }
  #log {
    position: fixed; right: 0; top: 0; bottom: 0; width: 340px; z-index: 10;
    background: rgba(8,12,20,0.75); backdrop-filter: blur(10px);
    border-left: 1px solid rgba(95,240,255,0.15);
    overflow-y: auto; padding: 80px 14px 14px;
  }
  #log h2 { font-size: 11px; color: #4a6577; margin-bottom: 12px; letter-spacing: 2px; text-transform: uppercase; }
  .event {
    background: rgba(20,28,40,0.7); border: 1px solid rgba(95,240,255,0.12); border-radius: 10px;
    padding: 11px 13px; margin-bottom: 9px; font-size: 12px;
    animation: slideIn 0.5s cubic-bezier(.2,.8,.2,1);
  }
  .event.fresh { box-shadow: 0 0 18px rgba(74,222,128,0.35); border-color: rgba(74,222,128,0.4); }
  .event .route { color: #5ff0ff; font-weight: 700; margin-bottom: 5px; font-size: 12.5px; }
  .event .task { color: #c5cdd6; margin-bottom: 5px; line-height: 1.4; }
  .event .time { color: #44546a; font-size: 10px; }
  .status-completed { color: #4ade80; }
  .status-pending { color: #fbbf24; }
  .status-failed { color: #f87171; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  #empty { color: #34465a; font-size: 12px; text-align: center; padding: 40px 10px; line-height: 1.6; }
  #legend {
    position: fixed; left: 18px; bottom: 18px; z-index: 10; font-size: 11px; color: #5a7184;
    background: rgba(8,12,20,0.6); border: 1px solid rgba(95,240,255,0.12); border-radius: 8px; padding: 10px 14px;
    display: flex; gap: 16px;
  }
  #legend span { display: flex; align-items: center; gap: 6px; }
  #legend i { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
</style>
</head>
<body>
<canvas id="stars"></canvas>
<div id="header">
  <h1>ALPHA SQUAD</h1>
  <div class="sub">LONGRISE AI ORGANIZATION · LIVE ORG CHART</div>
  <div class="status" id="status"><span class="dot"></span>연결 중...</div>
</div>
<div id="network"></div>
<div id="legend">
  <span><i style="background:#ffd76a;box-shadow:0 0 6px #ffd76a"></i>CEO</span>
  <span><i style="background:#5ff0ff;box-shadow:0 0 6px #5ff0ff"></i>COO</span>
  <span><i style="background:#6b7d8f"></i>본부장/팀장</span>
  <span><i style="background:#4ade80;box-shadow:0 0 6px #4ade80"></i>위임 중</span>
</div>
<div id="log">
  <h2>Activity Stream</h2>
  <div id="empty">신호 대기 중...<br>팀원 간 위임이 발생하면<br>여기에 표시됩니다.</div>
  <div id="events"></div>
</div>
<script>
// ── 배경 파티클 ──────────────────────────────────────────
const starCanvas = document.getElementById('stars');
const sctx = starCanvas.getContext('2d');
function resizeStars() { starCanvas.width = window.innerWidth; starCanvas.height = window.innerHeight; }
resizeStars();
window.addEventListener('resize', resizeStars);
const particles = Array.from({length: 90}, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  vx: (Math.random() - 0.5) * 0.15,
  vy: (Math.random() - 0.5) * 0.15,
  r: Math.random() * 1.6 + 0.4,
  a: Math.random() * 0.5 + 0.15
}));
function drawStars() {
  sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = starCanvas.width; if (p.x > starCanvas.width) p.x = 0;
    if (p.y < 0) p.y = starCanvas.height; if (p.y > starCanvas.height) p.y = 0;
    sctx.beginPath();
    sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    sctx.fillStyle = 'rgba(95,240,255,' + p.a + ')';
    sctx.fill();
  }
  requestAnimationFrame(drawStars);
}
drawStars();

// ── 조직도 데이터 ────────────────────────────────────────
const MEMBERS = ["다인","렉스","루나","제로","바쿠","피오","리리","에바","사라","미나","카이","설리","노바"];
const ROLES = {
  "다인":"기획본부장","렉스":"AI시스템본부장","루나":"CFO","제로":"보안본부장","바쿠":"데이터본부장",
  "피오":"백엔드본부장","리리":"프론트엔드본부장","에바":"UXR본부장","사라":"UXR팀장",
  "미나":"CRO본부장","카이":"GTM본부장","설리":"QA본부장","노바":"DevOps팀장"
};
const ALL_NAMES = ["제이크", ...MEMBERS];

const CEO_COLOR   = { background: 'rgba(40,32,10,0.95)', border: '#ffd76a' };
const COO_COLOR   = { background: 'rgba(10,30,40,0.95)', border: '#5ff0ff' };
const IDLE_COLOR  = { background: 'rgba(31,41,55,0.9)',  border: 'rgba(107,125,143,0.5)' };
const ACTIVE_COLOR= { background: 'rgba(20,60,40,0.95)', border: '#4ade80' };

function shadow(color, size) { return { enabled: true, color, size, x: 0, y: 0 }; }

// 2줄로 13명 배치 (7 + 6) — 가로 혼잡 방지
const ROW1 = MEMBERS.slice(0, 7);
const ROW2 = MEMBERS.slice(7);
const GAP_X = 165;

const nodeList = [];

nodeList.push({
  id: "대표님", label: "Kade YEO\\nCEO",
  x: 0, y: -480, shape: 'dot', size: 36,
  color: CEO_COLOR, font: { color: '#ffd76a', size: 16, vadjust: 48 },
  shadow: shadow('rgba(255,215,106,0.55)', 22), borderWidth: 3, fixed: { x: true, y: true },
});

nodeList.push({
  id: "제이크", label: "제이크\\nCOO",
  x: 0, y: -280, shape: 'dot', size: 32,
  color: COO_COLOR, font: { color: '#5ff0ff', size: 15, vadjust: 44 },
  shadow: shadow('rgba(95,240,255,0.55)', 20), borderWidth: 3, fixed: { x: true, y: true },
});

function placeRow(names, y) {
  const startX = -((names.length - 1) * GAP_X) / 2;
  names.forEach((name, i) => {
    nodeList.push({
      id: name, label: name + "\\n" + ROLES[name],
      x: startX + i * GAP_X, y, shape: 'dot', size: 22,
      color: IDLE_COLOR, font: { color: '#9fb4c4', size: 11.5, vadjust: 30 },
      shadow: shadow('rgba(95,240,255,0.15)', 7), borderWidth: 2, fixed: { x: true, y: true },
    });
  });
}
placeRow(ROW1, -60);
placeRow(ROW2, 140);

const nodes = new vis.DataSet(nodeList);

// 조직도 고정선 (항상 보이는 회색 라인) + 동적 위임선(분리된 edge들은 런타임에 추가)
const staticEdges = [{ from: "대표님", to: "제이크", color: { color: 'rgba(255,215,106,0.3)' }, width: 1.5, arrows: { to: { enabled: false } }, dashes: false, smooth: false }];
MEMBERS.forEach(name => staticEdges.push({
  from: "제이크", to: name, color: { color: 'rgba(95,240,255,0.18)' }, width: 1, arrows: { to: { enabled: false } }, dashes: [2, 4], smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.5 }
}));

const edges = new vis.DataSet(staticEdges.map((e, i) => ({ id: 'org' + i, ...e })));

const network = new vis.Network(document.getElementById('network'), { nodes, edges }, {
  physics: false,
  interaction: { dragNodes: false, zoomView: true, dragView: true, hover: true },
});
network.once('afterDrawing', () => network.fit({ animation: false, maxZoomLevel: 1.05 }));
setTimeout(() => network.moveTo({ position: { x: 0, y: -140 }, scale: window.innerWidth < 900 ? 0.55 : 0.85 }), 50);

// ── 숨쉬기 효과 ──────────────────────────────────────────
const activeUntil = {};
let breathT = 0;
setInterval(() => {
  breathT += 0.12;
  const pulse = (Math.sin(breathT) + 1) / 2;
  ALL_NAMES.concat(["대표님"]).forEach(name => {
    if (activeUntil[name] && activeUntil[name] > Date.now()) return;
    let base = 'rgba(95,240,255,0.15)', sizeBase = 6;
    if (name === "대표님") { base = 'rgba(255,215,106,0.5)'; sizeBase = 16; }
    else if (name === "제이크") { base = 'rgba(95,240,255,0.5)'; sizeBase = 16; }
    nodes.update({ id: name, shadow: shadow(base, sizeBase + pulse * 8) });
  });
}, 120);

// ── 이벤트 처리 ──────────────────────────────────────────
let sinceId = 0;
let edgeCounter = 0;
const statusEl = document.getElementById('status');
const eventsEl = document.getElementById('events');
const emptyEl = document.getElementById('empty');

function activateNode(id) {
  activeUntil[id] = Date.now() + 3000;
  const isCeo = id === "대표님", isJake = id === "제이크";
  nodes.update({ id, color: ACTIVE_COLOR, shadow: shadow('rgba(74,222,128,0.85)', isCeo || isJake ? 34 : 24), borderWidth: 3 });
  setTimeout(() => {
    if (activeUntil[id] <= Date.now()) {
      const restore = isCeo ? CEO_COLOR : isJake ? COO_COLOR : IDLE_COLOR;
      nodes.update({ id, color: restore, borderWidth: isCeo || isJake ? 3 : 2 });
    }
  }, 3000);
}

function addEdge(from, to) {
  if (!ALL_NAMES.includes(from) || !ALL_NAMES.includes(to) || from === to) return;
  const id = 'live' + (edgeCounter++);
  edges.add({ id, from, to, color: { color: '#4ade80', opacity: 1 }, width: 4,
    smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 },
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    shadow: { enabled: true, color: 'rgba(74,222,128,0.7)', size: 15 } });
  activateNode(from); activateNode(to);
  let step = 0;
  const fade = setInterval(() => {
    step++;
    const opacity = Math.max(0, 1 - step * 0.12);
    try { edges.update({ id, color: { color: '#4ade80', opacity } }); } catch(e) { clearInterval(fade); }
    if (opacity <= 0) { clearInterval(fade); edges.remove(id); }
  }, 200);
}

function renderEvent(ev) {
  const div = document.createElement('div');
  div.className = 'event fresh';
  const statusClass = 'status-' + ev.status;
  div.innerHTML =
    '<div class="route">' + ev.from + ' → ' + ev.to + '</div>' +
    '<div class="task">' + ev.title.replace(/</g,'&lt;') + '</div>' +
    '<div class="time">' + new Date(ev.timestamp).toLocaleTimeString('ko-KR') +
    ' · <span class="' + statusClass + '">' + ev.status + '</span></div>';
  eventsEl.prepend(div);
  setTimeout(() => div.classList.remove('fresh'), 2500);
  while (eventsEl.children.length > 30) eventsEl.removeChild(eventsEl.lastChild);
}

async function poll() {
  try {
    const res = await fetch('/activity/recent?since_id=' + sinceId);
    const data = await res.json();
    const newEvents = data.events.slice().reverse();
    if (newEvents.length > 0) {
      emptyEl.style.display = 'none';
      for (const ev of newEvents) {
        sinceId = Math.max(sinceId, ev.id);
        addEdge(ev.from, ev.to);
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
