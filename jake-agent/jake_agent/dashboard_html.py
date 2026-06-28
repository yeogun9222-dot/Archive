DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Alpha Squad — Live Activity</title>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0b0e14; color: #e6e6e6; font-family: -apple-system, 'Malgun Gothic', sans-serif; overflow: hidden; }
  #header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 10;
    padding: 14px 20px; background: rgba(11,14,20,0.85); backdrop-filter: blur(6px);
    border-bottom: 1px solid #1f2630; display: flex; align-items: center; gap: 10px;
  }
  #header h1 { font-size: 16px; font-weight: 600; color: #5fd3ff; }
  #header .status { font-size: 11px; color: #6b7785; }
  #network { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; }
  #log {
    position: fixed; right: 0; top: 60px; bottom: 0; width: 360px;
    background: rgba(13,17,23,0.92); border-left: 1px solid #1f2630;
    overflow-y: auto; padding: 14px;
  }
  #log h2 { font-size: 12px; color: #6b7785; margin-bottom: 10px; letter-spacing: 1px; }
  .event {
    background: #131a24; border: 1px solid #1f2630; border-radius: 8px;
    padding: 10px 12px; margin-bottom: 8px; font-size: 12px; animation: fadeIn 0.4s ease;
  }
  .event .route { color: #5fd3ff; font-weight: 600; margin-bottom: 4px; }
  .event .task { color: #c5cdd6; margin-bottom: 4px; }
  .event .time { color: #51596b; font-size: 10px; }
  .event .status-completed { color: #4ade80; }
  .event .status-pending { color: #fbbf24; }
  .event .status-failed { color: #f87171; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  #empty { color: #51596b; font-size: 12px; text-align: center; padding: 30px 0; }
</style>
</head>
<body>
<div id="header">
  <h1>🧠 Alpha Squad — Live Activity</h1>
  <div class="status" id="status">연결 중...</div>
</div>
<div id="network"></div>
<div id="log">
  <h2>최근 활동</h2>
  <div id="empty">아직 위임 활동이 없습니다</div>
  <div id="events"></div>
</div>
<script>
const PERSONAS = ["제이크","다인","렉스","루나","제로","바쿠","피오","리리","에바","사라","미나","카이","설리","노바"];
const ROLES = {
  "제이크":"COO","다인":"기획","렉스":"AI시스템","루나":"CFO","제로":"보안","바쿠":"데이터",
  "피오":"백엔드","리리":"프론트엔드","에바":"UXR","사라":"UXR팀장","미나":"CRO","카이":"GTM","설리":"QA","노바":"DevOps"
};

const nodes = new vis.DataSet(PERSONAS.map((name, i) => {
  if (name === "제이크") {
    return { id: name, label: "제이크\\n(COO)", x: 0, y: 0, fixed: true,
      color: { background: '#5fd3ff', border: '#0ea5e9' }, font: { color: '#0b0e14', size: 16, multi: false }, size: 34 };
  }
  const others = PERSONAS.filter(n => n !== "제이크");
  const idx = others.indexOf(name);
  const angle = (idx / others.length) * 2 * Math.PI;
  const r = 280;
  return {
    id: name, label: name + "\\n(" + ROLES[name] + ")",
    x: Math.cos(angle) * r, y: Math.sin(angle) * r, fixed: true,
    color: { background: '#1f2937', border: '#374151' }, font: { color: '#c5cdd6', size: 13 }, size: 22
  };
}));

const edges = new vis.DataSet([]);

const network = new vis.Network(document.getElementById('network'), { nodes, edges }, {
  physics: false,
  interaction: { dragNodes: false, zoomView: true, dragView: true },
  edges: { smooth: { type: 'curvedCW', roundness: 0.15 }, arrows: { to: { enabled: true, scaleFactor: 0.6 } }, color: { color: '#374151' } },
});

let sinceId = 0;
let edgeCounter = 0;
const statusEl = document.getElementById('status');
const eventsEl = document.getElementById('events');
const emptyEl = document.getElementById('empty');

function pulseNode(id) {
  nodes.update({ id, color: { background: '#4ade80', border: '#22c55e' } });
  setTimeout(() => {
    if (id === "제이크") nodes.update({ id, color: { background: '#5fd3ff', border: '#0ea5e9' } });
    else nodes.update({ id, color: { background: '#1f2937', border: '#374151' } });
  }, 2500);
}

function addEdge(from, to) {
  if (!PERSONAS.includes(from) || !PERSONAS.includes(to) || from === to) return;
  const id = 'e' + (edgeCounter++);
  edges.add({ id, from, to, color: { color: '#4ade80' }, width: 3 });
  pulseNode(from); pulseNode(to);
  setTimeout(() => edges.remove(id), 4000);
}

function renderEvent(ev) {
  const div = document.createElement('div');
  div.className = 'event';
  const statusClass = 'status-' + ev.status;
  div.innerHTML =
    '<div class="route">' + ev.from + ' → ' + ev.to + '</div>' +
    '<div class="task">' + ev.title.replace(/</g,'&lt;') + '</div>' +
    '<div class="time">' + new Date(ev.timestamp).toLocaleTimeString('ko-KR') +
    ' · <span class="' + statusClass + '">' + ev.status + '</span></div>';
  eventsEl.prepend(div);
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
    statusEl.textContent = '실시간 연결됨 · ' + new Date().toLocaleTimeString('ko-KR');
  } catch (e) {
    statusEl.textContent = '연결 오류: ' + e.message;
  }
}

poll();
setInterval(poll, 3000);
</script>
</body>
</html>"""
