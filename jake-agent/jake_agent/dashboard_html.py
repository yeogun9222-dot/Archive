DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Alpha Squad — Live Activity</title>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #050810; color: #e6e6e6; font-family: -apple-system, 'Malgun Gothic', sans-serif; overflow: hidden; height: 100%; }
  #stars { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
  #header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 10;
    padding: 16px 22px; background: linear-gradient(180deg, rgba(5,8,16,0.95), rgba(5,8,16,0.0));
    display: flex; align-items: center; gap: 12px;
  }
  #header h1 {
    font-size: 17px; font-weight: 700; color: #5ff0ff; letter-spacing: 0.5px;
    text-shadow: 0 0 12px rgba(95,240,255,0.6);
  }
  #header .status { font-size: 11px; color: #4a6577; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80; display: inline-block; margin-right: 5px; animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  #network { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; z-index: 1; }
  #log {
    position: fixed; right: 0; top: 0; bottom: 0; width: 340px; z-index: 10;
    background: rgba(8,12,20,0.75); backdrop-filter: blur(10px);
    border-left: 1px solid rgba(95,240,255,0.15);
    overflow-y: auto; padding: 70px 14px 14px;
  }
  #log h2 { font-size: 11px; color: #4a6577; margin-bottom: 12px; letter-spacing: 2px; text-transform: uppercase; }
  .event {
    background: rgba(20,28,40,0.7); border: 1px solid rgba(95,240,255,0.12); border-radius: 10px;
    padding: 11px 13px; margin-bottom: 9px; font-size: 12px;
    animation: slideIn 0.5s cubic-bezier(.2,.8,.2,1);
    box-shadow: 0 0 0 rgba(95,240,255,0);
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
</style>
</head>
<body>
<canvas id="stars"></canvas>
<div id="header">
  <h1>🧠 ALPHA SQUAD — LIVE</h1>
  <div class="status" id="status"><span class="dot"></span>연결 중...</div>
</div>
<div id="network"></div>
<div id="log">
  <h2>Activity Stream</h2>
  <div id="empty">신호 대기 중...<br>팀원 간 위임이 발생하면<br>여기에 표시됩니다.</div>
  <div id="events"></div>
</div>
<script>
// ── 배경 파티클 (별/네트워크 느낌) ──────────────────────────
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

// ── 네트워크 그래프 ──────────────────────────────────────
const PERSONAS = ["제이크","다인","렉스","루나","제로","바쿠","피오","리리","에바","사라","미나","카이","설리","노바"];
const ROLES = {
  "제이크":"COO","다인":"기획","렉스":"AI시스템","루나":"CFO","제로":"보안","바쿠":"데이터",
  "피오":"백엔드","리리":"프론트엔드","에바":"UXR","사라":"UXR팀장","미나":"CRO","카이":"GTM","설리":"QA","노바":"DevOps"
};
const IDLE_COLOR = { background: 'rgba(31,41,55,0.9)', border: 'rgba(95,240,255,0.35)' };
const JAKE_COLOR = { background: 'rgba(10,30,40,0.95)', border: '#5ff0ff' };
const ACTIVE_COLOR = { background: 'rgba(20,60,40,0.95)', border: '#4ade80' };

function baseShadow(color, size) {
  return { enabled: true, color, size, x: 0, y: 0 };
}

const nodes = new vis.DataSet(PERSONAS.map((name) => {
  const isJake = name === "제이크";
  const others = PERSONAS.filter(n => n !== "제이크");
  const idx = others.indexOf(name);
  const angle = (idx / others.length) * 2 * Math.PI - Math.PI / 2;
  const r = 300;
  return {
    id: name,
    label: name + "\\n" + ROLES[name],
    x: isJake ? 0 : Math.cos(angle) * r,
    y: isJake ? 0 : Math.sin(angle) * r,
    shape: 'dot',
    size: isJake ? 38 : 24,
    color: isJake ? JAKE_COLOR : IDLE_COLOR,
    font: { color: isJake ? '#5ff0ff' : '#9fb4c4', size: isJake ? 15 : 12, face: 'inherit', multi: false, vadjust: isJake ? 50 : 32 },
    shadow: baseShadow(isJake ? 'rgba(95,240,255,0.6)' : 'rgba(95,240,255,0.15)', isJake ? 25 : 8),
    borderWidth: isJake ? 3 : 2,
    fixed: { x: true, y: true },
  };
}));

const edges = new vis.DataSet([]);

const network = new vis.Network(document.getElementById('network'), { nodes, edges }, {
  physics: false,
  interaction: { dragNodes: false, zoomView: true, dragView: true, hover: true },
  edges: {
    smooth: { type: 'curvedCW', roundness: 0.18 },
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
  },
});

// ── 숨쉬기 효과 (idle 노드 은은한 글로우 펄스) ──────────────
let breathT = 0;
setInterval(() => {
  breathT += 0.12;
  const pulse = (Math.sin(breathT) + 1) / 2; // 0~1
  PERSONAS.forEach(name => {
    if (activeUntil[name] && activeUntil[name] > Date.now()) return; // 활성 중이면 숨쉬기 생략
    const isJake = name === "제이크";
    const size = isJake ? 20 + pulse * 10 : 6 + pulse * 4;
    nodes.update({ id: name, shadow: baseShadow(isJake ? 'rgba(95,240,255,0.6)' : 'rgba(95,240,255,0.18)', size) });
  });
}, 120);

// ── 이벤트 처리 ──────────────────────────────────────────
const activeUntil = {};
let sinceId = 0;
let edgeCounter = 0;
const statusEl = document.getElementById('status');
const eventsEl = document.getElementById('events');
const emptyEl = document.getElementById('empty');

function activateNode(id) {
  activeUntil[id] = Date.now() + 3000;
  const isJake = id === "제이크";
  nodes.update({ id, color: ACTIVE_COLOR, shadow: baseShadow('rgba(74,222,128,0.85)', isJake ? 40 : 26), borderWidth: 3 });
  setTimeout(() => {
    if (activeUntil[id] <= Date.now()) {
      nodes.update({ id, color: isJake ? JAKE_COLOR : IDLE_COLOR, borderWidth: isJake ? 3 : 2 });
    }
  }, 3000);
}

function addEdge(from, to) {
  if (!PERSONAS.includes(from) || !PERSONAS.includes(to) || from === to) return;
  const id = 'e' + (edgeCounter++);
  edges.add({ id, from, to, color: { color: '#4ade80', opacity: 1 }, width: 4, shadow: { enabled: true, color: 'rgba(74,222,128,0.7)', size: 15 } });
  activateNode(from); activateNode(to);
  // 페이드아웃
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
