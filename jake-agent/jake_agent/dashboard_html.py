DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
<title>ALPHA SQUAD — Org Chart</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #0a0d14; color: #e6e6e6; font-family: -apple-system, 'Malgun Gothic', sans-serif; height: 100%; overflow: hidden; }
  body { display: flex; flex-direction: column; }
  #header {
    padding: 18px 24px 10px; display: flex; align-items: baseline; gap: 14px; position: relative; z-index: 5; flex-shrink: 0;
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
  .cost-row .name { color: #9fb4c4; flex: 1; }
  .cost-row .val { color: #ffd76a; font-weight: 600; }
  .cost-row.inactive { opacity: 0.5; }
  .cost-act { margin-left: 8px; border: none; border-radius: 6px; padding: 3px 8px; font-size: 10px; cursor: pointer; font-weight: 600; }
  .cost-act.deactivate { background: rgba(248,113,113,0.18); color: #f87171; }
  .cost-act.activate { background: rgba(74,222,128,0.18); color: #4ade80; }

  .header-btn {
    font-size: 11px; color: #9fb4c4; background: rgba(95,240,255,0.06);
    border: 1px solid rgba(95,240,255,0.2); border-radius: 14px; padding: 4px 11px;
    cursor: pointer; margin-left: 8px;
  }
  .header-btn:hover { background: rgba(95,240,255,0.16); color: #c5cdd6; }

  /* 좌측 사이드 메뉴 — 탑바 버튼들을 그룹별 하위드롭다운으로 재구성. 모바일에서는 슬라이드 드로어로 전환 */
  #sideMenuBtn {
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid rgba(95,240,255,0.25);
    background: rgba(95,240,255,0.06); color: #5ff0ff; font-size: 16px; cursor: pointer;
    display: none; align-items: center; justify-content: center; flex-shrink: 0;
  }
  #sideMenuBtn:hover { background: rgba(95,240,255,0.16); }
  #sideMenuOverlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 39; }
  body.sidebar-open #sideMenuOverlay { display: block; }
  #sideMenu {
    position: fixed; top: 0; left: 0; bottom: 0; width: 208px; z-index: 40;
    background: rgba(10,14,22,0.97); border-right: 1px solid rgba(95,240,255,0.15);
    padding: 16px 12px 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
  }
  #sideMenu .sm-brand { font-size: 12.5px; font-weight: 800; color: #5ff0ff; letter-spacing: 1.5px; padding: 0 6px 12px; }
  #sideMenu .sm-pin { margin-bottom: 8px; display: flex; flex-direction: column; gap: 6px; }
  .sm-item {
    display: flex; align-items: center; gap: 6px; width: 100%; text-align: left;
    font-size: 11.5px; color: #9fb4c4; background: rgba(95,240,255,0.05);
    border: 1px solid rgba(95,240,255,0.15); border-radius: 9px; padding: 8px 10px;
    cursor: pointer; position: relative; margin: 0; box-sizing: border-box;
  }
  .sm-item:hover { background: rgba(95,240,255,0.14); color: #c5cdd6; }
  .sm-item.header-btn-alert { background: rgba(255,215,106,0.1); border-color: rgba(255,215,106,0.35); color: #ffd76a; }
  .sm-item.header-btn-alert:hover { background: rgba(255,215,106,0.2); }
  #sideMenu .cost-widget { margin-left: 0; }
  .sm-group { display: flex; flex-direction: column; }
  .sm-grouptitle {
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    font-size: 10px; letter-spacing: 0.5px; color: #5a7184; background: none; border: none;
    padding: 9px 6px 5px; cursor: pointer; font-weight: 700;
  }
  .sm-grouptitle:hover { color: #9fb4c4; }
  .sm-grouptitle .car { transition: transform 0.2s ease; font-size: 9px; }
  .sm-grouptitle.open .car { transform: rotate(180deg); }
  .sm-sublist { display: none; flex-direction: column; gap: 6px; padding: 0 0 6px; }
  .sm-sublist.open { display: flex; }

  /* 네이티브 select/option이 밝은 OS 기본 테마로 렌더링되어 다크 패널과 대비가 깨지는 문제 수정 */
  select { color-scheme: dark; }
  select, option {
    background-color: #161c26; color: #e6e6e6;
  }

  #cardChatPanel {
    position: fixed; top: 60px; left: 50%; transform: translateX(-50%); width: 380px; max-height: 70vh;
    background: rgba(12,16,24,0.98); border: 1px solid rgba(95,240,255,0.35); border-radius: 12px;
    box-shadow: 0 10px 44px rgba(0,0,0,0.65); z-index: 60; overflow: hidden;
    display: none; flex-direction: column; transition: width 0.2s ease, max-height 0.2s ease;
  }
  #cardChatPanel.show { display: flex; }
  #cardChatPanel.maximized { width: 640px; max-height: 86vh; }
  #cardChatPanel.minimized { max-height: none; }
  #cardChatPanel.minimized #cardChatBody { display: none; }
  #cardChatTitlebar {
    display: flex; align-items: center; gap: 10px; padding: 12px 10px 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06); cursor: default; flex-shrink: 0;
  }
  #cardChatTitlebar .chead { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  #cardChatTitlebar .avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; background: linear-gradient(160deg, #3a4654, #232b35); flex-shrink: 0; }
  #cardChatTitlebar .cname { font-size: 13.5px; font-weight: 700; color: #5ff0ff; }
  #cardChatTitlebar .crole { font-size: 10px; color: #6b7d8f; }
  #cardChatControls { display: flex; gap: 5px; flex-shrink: 0; }
  .cc-winbtn {
    width: 24px; height: 24px; border-radius: 6px; border: none; cursor: pointer;
    background: rgba(255,255,255,0.05); color: #9fb4c4; font-size: 12px;
    display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s;
  }
  .cc-winbtn:hover { background: rgba(95,240,255,0.18); color: #5ff0ff; }
  .cc-winbtn.cc-close:hover { background: rgba(248,113,113,0.2); color: #f87171; }
  #cardChatBody { padding: 14px 16px 16px; overflow-y: auto; flex: 1; min-height: 0; }
  #cardChatPanel .cstatus { font-size: 11px; color: #9fb4c4; margin: 0 0 8px; padding: 6px 9px; background: rgba(255,255,255,0.03); border-radius: 7px; }
  #cardChatPanel .cstatus.inactive { color: #f87171; }
  .cc-req { border-radius: 8px; padding: 9px 11px; margin-bottom: 10px; font-size: 12px; line-height: 1.5; }
  .cc-req.decision { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.3); }
  .cc-req.stuck { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.3); }
  .cc-req .label { font-size: 9.5px; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 700; }
  .cc-req.decision .label { color: #fbbf24; }
  .cc-req.stuck .label { color: #f87171; }
  .cc-req .summary { color: #e6e6e6; font-weight: 600; margin-bottom: 3px; }
  .cc-req .reason { color: #9fb4c4; }
  .cc-req .hint { font-size: 10px; color: #6b7d8f; margin-top: 6px; }
  #cardChatInput { width: 100%; min-height: 64px; background: rgba(255,255,255,0.04); border: 1px solid rgba(95,240,255,0.2); border-radius: 8px; color: #e6e6e6; font-size: 12.5px; padding: 9px; resize: vertical; font-family: inherit; }
  #cardChatSendRow { display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px; }
  #cardChatSendBtn { background: rgba(95,240,255,0.18); color: #5ff0ff; border: none; border-radius: 7px; padding: 7px 16px; font-size: 12px; cursor: pointer; font-weight: 600; }
  #cardChatSendBtn:hover { filter: brightness(1.25); }
  #cardChatSendBtn:disabled { opacity: 0.5; cursor: default; }
  #ccAttachBtn { background: rgba(255,255,255,0.05); color: #9fb4c4; border: 1px solid rgba(95,240,255,0.2); border-radius: 7px; padding: 7px 11px; font-size: 13px; cursor: pointer; }
  #ccAttachBtn:hover { background: rgba(95,240,255,0.14); color: #c5cdd6; }
  #ccAttachPreview:empty { display: none; }
  #ccAttachPreview {
    display: flex; align-items: center; gap: 6px; margin-top: 6px; padding: 5px 9px;
    background: rgba(95,240,255,0.08); border: 1px solid rgba(95,240,255,0.25); border-radius: 7px;
    font-size: 11px; color: #9fb4c4;
  }
  #ccAttachPreview .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  #ccAttachPreview button { background: none; border: none; color: #f87171; cursor: pointer; font-size: 13px; padding: 0 2px; }
  .cchat-attachment {
    display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; padding: 4px 9px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(95,240,255,0.2); border-radius: 12px;
    font-size: 10.5px; color: #5ff0ff; text-decoration: none;
  }
  .cchat-attachment:hover { background: rgba(95,240,255,0.16); }
  #cardChatLog { margin-top: 12px; max-height: 260px; overflow-y: auto; }
  #cardChatPanel.maximized #cardChatLog { max-height: 56vh; }

  /* 모던 스크롤바 — 다크 테마에 어울리는 얇고 은은한 스타일 (웹킷 기반 브라우저) */
  #cardChatBody::-webkit-scrollbar, #cardChatLog::-webkit-scrollbar,
  #projectPanel::-webkit-scrollbar, #auditPanel::-webkit-scrollbar, #permPanel::-webkit-scrollbar,
  #perfPanel::-webkit-scrollbar, #decPanel::-webkit-scrollbar, #bnPanel::-webkit-scrollbar,
  #legendPanel::-webkit-scrollbar, #log::-webkit-scrollbar, #events::-webkit-scrollbar {
    width: 6px;
  }
  #cardChatBody::-webkit-scrollbar-track, #cardChatLog::-webkit-scrollbar-track,
  #projectPanel::-webkit-scrollbar-track, #auditPanel::-webkit-scrollbar-track, #permPanel::-webkit-scrollbar-track,
  #perfPanel::-webkit-scrollbar-track, #decPanel::-webkit-scrollbar-track, #bnPanel::-webkit-scrollbar-track,
  #legendPanel::-webkit-scrollbar-track, #log::-webkit-scrollbar-track, #events::-webkit-scrollbar-track {
    background: transparent;
  }
  #cardChatBody::-webkit-scrollbar-thumb, #cardChatLog::-webkit-scrollbar-thumb,
  #projectPanel::-webkit-scrollbar-thumb, #auditPanel::-webkit-scrollbar-thumb, #permPanel::-webkit-scrollbar-thumb,
  #perfPanel::-webkit-scrollbar-thumb, #decPanel::-webkit-scrollbar-thumb, #bnPanel::-webkit-scrollbar-thumb,
  #legendPanel::-webkit-scrollbar-thumb, #log::-webkit-scrollbar-thumb, #events::-webkit-scrollbar-thumb {
    background: rgba(95,240,255,0.25); border-radius: 4px;
  }
  #cardChatBody::-webkit-scrollbar-thumb:hover, #cardChatLog::-webkit-scrollbar-thumb:hover,
  #projectPanel::-webkit-scrollbar-thumb:hover, #auditPanel::-webkit-scrollbar-thumb:hover, #permPanel::-webkit-scrollbar-thumb:hover,
  #perfPanel::-webkit-scrollbar-thumb:hover, #decPanel::-webkit-scrollbar-thumb:hover, #bnPanel::-webkit-scrollbar-thumb:hover,
  #legendPanel::-webkit-scrollbar-thumb:hover, #log::-webkit-scrollbar-thumb:hover, #events::-webkit-scrollbar-thumb:hover {
    background: rgba(95,240,255,0.5);
  }
  /* 파이어폭스용 */
  #cardChatBody, #cardChatLog, #projectPanel, #auditPanel, #permPanel, #perfPanel, #decPanel, #bnPanel, #legendPanel, #memoPanel, #log, #events {
    scrollbar-width: thin; scrollbar-color: rgba(95,240,255,0.3) transparent;
  }
  .cchat-msg { padding: 8px 10px; border-radius: 8px; margin-bottom: 7px; font-size: 12px; line-height: 1.5; }
  .cchat-msg.user { background: rgba(95,240,255,0.08); color: #c5cdd6; }
  .cchat-msg.assistant { background: rgba(255,255,255,0.04); color: #c5cdd6; }
  .cchat-msg .who { font-size: 10px; color: #5a7184; margin-bottom: 3px; }

  #projectPanel, #auditPanel, #permPanel, #perfPanel, #decPanel, #bnPanel, #legendPanel, #memoPanel {
    position: fixed; top: 60px; right: 20px; width: 360px; max-height: 62vh; overflow-y: auto;
    background: rgba(12,16,24,0.97); border: 1px solid rgba(95,240,255,0.3); border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.6); padding: 14px; display: none; z-index: 50;
  }
  #projectPanel.show, #auditPanel.show, #permPanel.show, #perfPanel.show, #decPanel.show, #bnPanel.show, #legendPanel.show, #memoPanel.show { display: block; }
  #projectPanel h3, #auditPanel h3, #permPanel h3, #perfPanel h3, #decPanel h3, #bnPanel h3, #legendPanel h3 { font-size: 12px; color: #5ff0ff; letter-spacing: 1px; margin-bottom: 10px; }

  .legend-group { margin-bottom: 14px; }
  .legend-label { font-size: 10.5px; color: #9fb4c4; font-weight: 700; margin-bottom: 7px; }
  .legend-row { display: flex; align-items: center; gap: 9px; font-size: 11px; color: #c5cdd6; padding: 4px 0; }
  .legend-swatch { width: 22px; height: 10px; border-radius: 5px; flex-shrink: 0; background: #2a323e; }
  .lg-working { background: linear-gradient(90deg, transparent, #5ff0ff, transparent); animation: barShimmer 1.3s linear infinite; }
  .lg-discussing { background: #a78bfa; animation: barPulse 1.8s ease-in-out infinite; }
  .lg-error { background: #f87171; }
  .lg-idle { background: transparent; border: 1px dashed rgba(255,255,255,0.15); }
  .lg-glowpending { background: rgba(251,191,36,0.5); animation: legendGlow 2.4s ease-in-out infinite; }
  .lg-glowfailed { background: rgba(248,113,113,0.5); animation: legendGlow 2.4s ease-in-out infinite; }
  .lg-glowheld { background: rgba(148,163,184,0.5); animation: legendGlow 2.4s ease-in-out infinite; }
  .lg-active { background: #4ade80; }
  .lg-flash { background: linear-gradient(90deg, #4ade80, transparent); }
  .lg-inactive { background: #5a6473; opacity: 0.5; }
  @keyframes legendGlow { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

  .bn-row { background: rgba(20,28,40,0.7); border: 1px solid rgba(251,191,36,0.2); border-radius: 9px; padding: 9px 11px; margin-bottom: 9px; font-size: 11.5px; }
  .bn-row .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .bn-row .pname { color: #fbbf24; font-weight: 700; }
  .bn-row .count { color: #fbbf24; font-size: 10.5px; }
  .bn-item { color: #9fb4c4; font-size: 11px; padding: 3px 0; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; gap: 6px; }
  .bn-item .age { color: #6b7d8f; flex-shrink: 0; }
  .bn-item.bn-stale .age { color: #f87171; }

  .dec-row { background: rgba(20,28,40,0.7); border: 1px solid rgba(95,240,255,0.12); border-radius: 9px; padding: 9px 11px; margin-bottom: 8px; font-size: 11.5px; }
  .dec-row .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .dec-row .cat { font-size: 9.5px; color: #5ff0ff; background: rgba(95,240,255,0.12); border-radius: 8px; padding: 1px 7px; }
  .dec-row .time { color: #44546a; font-size: 10px; }
  .dec-row .summary { color: #c5cdd6; font-weight: 700; margin-bottom: 3px; }
  .dec-row .reason { color: #9fb4c4; line-height: 1.4; }
  .dec-row .by { color: #5a7184; font-size: 10px; margin-top: 4px; }

  #projectForm { display: flex; gap: 6px; margin-bottom: 12px; }
  #projectForm input { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(95,240,255,0.2); border-radius: 6px; color: #e6e6e6; font-size: 11.5px; padding: 6px 8px; }
  #projectForm button { background: rgba(95,240,255,0.18); color: #5ff0ff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11.5px; cursor: pointer; font-weight: 600; }
  #projectForm button:hover { filter: brightness(1.25); }

  .proj-row { background: rgba(20,28,40,0.7); border: 1px solid rgba(95,240,255,0.12); border-radius: 9px; padding: 9px 11px; margin-bottom: 8px; font-size: 12px; }
  .proj-row .top { display: flex; justify-content: space-between; align-items: center; }
  .proj-row .name { color: #c5cdd6; font-weight: 700; }
  .proj-row .meta { color: #5a7184; font-size: 10.5px; margin-top: 3px; }
  .proj-row .prog { color: #4ade80; font-size: 10.5px; }

  .memo-row { background: rgba(20,28,40,0.7); border: 1px solid rgba(255,215,106,0.15); border-radius: 9px; padding: 9px 11px; margin-bottom: 8px; font-size: 12px; }
  .memo-row.pinned { border-color: rgba(255,215,106,0.5); }
  .memo-row.checked { opacity: 0.6; }
  .memo-row .content { color: #c5cdd6; white-space: pre-wrap; word-break: break-word; }
  .memo-row .actions { display: flex; gap: 5px; margin-top: 7px; flex-wrap: wrap; }
  .memo-row .actions button { border: none; border-radius: 6px; padding: 3px 8px; font-size: 10.5px; cursor: pointer; font-weight: 600; }
  .memo-btn-pin { background: rgba(255,215,106,0.16); color: #ffd76a; }
  .memo-btn-check { background: rgba(95,240,255,0.16); color: #5ff0ff; }
  .memo-btn-done { background: rgba(74,222,128,0.18); color: #4ade80; }
  .memo-btn-del { background: rgba(248,113,113,0.15); color: #f87171; }
  .proj-status { border: none; border-radius: 10px; padding: 2px 8px; font-size: 10px; cursor: pointer; font-weight: 700; }
  .proj-status.active { background: rgba(95,240,255,0.15); color: #5ff0ff; }
  .proj-status.done { background: rgba(74,222,128,0.15); color: #4ade80; }
  .proj-status.paused { background: rgba(148,163,184,0.15); color: #c5cdd6; }

  .audit-row { background: rgba(20,28,40,0.6); border: 1px solid rgba(95,240,255,0.1); border-radius: 9px; padding: 8px 10px; margin-bottom: 7px; font-size: 11.5px; color: #9fb4c4; }
  .audit-row .route { color: #6b7d8f; font-weight: 700; font-size: 11.5px; margin-bottom: 3px; }
  .audit-row .time { color: #44546a; font-size: 10px; }

  #permTable, #perfTable { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  #permTable th, #perfTable th { text-align: left; color: #5a7184; font-size: 9.5px; letter-spacing: 0.5px; padding: 5px 4px; border-bottom: 1px solid rgba(95,240,255,0.15); }
  #permTable td, #perfTable td { padding: 5px 4px; border-bottom: 1px solid rgba(255,255,255,0.04); color: #c5cdd6; }
  #permTable .pname { font-weight: 700; }
  #permTable .pname.inactive { color: #f87171; text-decoration: line-through; }
  #permNote { font-size: 10px; color: #5a7184; margin-top: 10px; line-height: 1.5; }
  #perfTable .perf-bad { color: #f87171; }
  #perfTable .perf-warn { color: #fbbf24; }
  #perfTable .perf-good { color: #4ade80; }

  #contentionBanner {
    display: none; max-width: 1300px; margin: 0 auto 14px; padding: 8px 14px;
    background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.3); border-radius: 8px;
    font-size: 12px; color: #fbbf24; text-align: center; position: relative; z-index: 4;
  }
  #contentionBanner.show { display: block; }
  #costNote { font-size: 10px; color: #5a7184; margin-top: 10px; line-height: 1.5; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80; display: inline-block; margin-right: 5px; animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* 신호선: 점선이 경로(d)를 따라 출발지→도착지 방향으로 흘러가는 효과.
     stroke-dashoffset을 음수로 진행시키면 path가 그려진 순서(p1→p2) 방향으로 흐름 */
  .signal-flow {
    stroke-dasharray: 9 13;
    animation: flowSignal 0.55s linear infinite;
  }
  @keyframes flowSignal { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -44; } }

  /* 조직도 영역 — 마우스 드래그/휠 및 손가락 드래그/핀치로 좌우상하 이동 + 확대축소 가능한 패닝 뷰포트 */
  #chartViewport {
    flex: 1; min-height: 0; position: relative; overflow: hidden;
    touch-action: none; cursor: grab; background: radial-gradient(circle at 50% 0%, rgba(95,240,255,0.04), transparent 60%);
  }
  #chartViewport.dragging { cursor: grabbing; }
  #chart {
    position: absolute; top: 0; left: 0; width: max-content; min-height: 480px;
    padding: 30px 40px 60px; display: flex; flex-direction: column; align-items: center;
    transform-origin: 0 0; will-change: transform;
  }
  svg#lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
  #chartZoomCtrl {
    position: absolute; right: 14px; bottom: 14px; z-index: 6; display: flex; flex-direction: column; gap: 6px;
  }
  #chartZoomCtrl button {
    width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(95,240,255,0.25);
    background: rgba(10,14,22,0.85); color: #5ff0ff; font-size: 15px; cursor: pointer; font-weight: 700;
  }
  #chartZoomCtrl button:hover { background: rgba(95,240,255,0.18); }

  .level { display: flex; justify-content: center; gap: 24px; position: relative; z-index: 2; margin-bottom: 56px; }
  .level-members { flex-wrap: nowrap; max-width: none; gap: 10px; margin-bottom: 28px; }
  .level-members .card { padding: 8px 10px; gap: 6px; }
  .level-members .avatar { width: 28px; height: 28px; font-size: 13px; }
  .level-members .info .name { font-size: 11px; }
  .level-members .info .role { font-size: 8.5px; }
  .level-subteam { position: relative; height: 56px; width: 100%; margin-bottom: 0; }
  .level-subteam .card { position: absolute; top: 0; transform: translateX(-50%); padding: 8px 10px; width: 124px; box-sizing: border-box; }
  .level-subteam .avatar { width: 26px; height: 26px; font-size: 12px; }
  .level-subteam .info .name { font-size: 11.5px; }
  .level-subteam .info .role { font-size: 9px; white-space: normal; line-height: 1.25; }
  .level-members .info .name, .level-members .info .role { white-space: nowrap; }

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

  .card.coo, .card.member, .card.ceo { cursor: pointer; }
  .card.coo:hover, .card.member:hover, .card.ceo:hover { border-color: rgba(255,215,106,0.7); }

  .card.ceo { padding: 16px 26px; border-color: rgba(255,215,106,0.4); }
  .card.ceo .avatar { width: 46px; height: 46px; background: radial-gradient(circle, #ffe9a8, #ffd76a); box-shadow: 0 0 16px rgba(255,215,106,0.5); }
  .card.ceo .info .name { font-size: 16px; color: #ffd76a; }
  .card.ceo .info .role { color: #b89a4e; }
  /* 대표님 카드 — 결재/확인필요를 합산해 직접 표시. 좌측 드롭메뉴 안에 묻혀있어 놓치는 문제 해소 */
  .ceo-alert {
    display: none; position: absolute; top: -14px; left: 50%; transform: translateX(-50%); z-index: 9;
    background: linear-gradient(160deg, #ff8a8a, #f87171); color: #1a0a0a; font-size: 11px; font-weight: 700;
    padding: 3px 9px; border-radius: 10px; cursor: pointer; white-space: nowrap;
    box-shadow: 0 0 10px rgba(248,113,113,0.7);
    animation: ceoAlertPulse 1.6s ease-in-out infinite;
  }
  .ceo-alert.show { display: block; }
  @keyframes ceoAlertPulse {
    0%, 100% { transform: translateX(-50%) scale(1); box-shadow: 0 0 8px rgba(248,113,113,0.55); }
    50% { transform: translateX(-50%) scale(1.1); box-shadow: 0 0 16px rgba(248,113,113,0.9); }
  }

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
  /* 카드 하단 실시간 활동 상태바 — 말풍선/깜빡임 아이콘 대신 조용한 색상 바 하나로 표현 (리리 디자인) */
  .status-bar {
    position: absolute; left: 10px; right: 10px; bottom: 3px; height: 3px; border-radius: 2px;
    background: transparent; transition: background 0.3s ease;
  }
  .status-bar.working {
    background: linear-gradient(90deg, transparent, #5ff0ff 45%, #5ff0ff 55%, transparent);
    background-size: 220% 100%; animation: barShimmer 1.3s linear infinite;
  }
  .status-bar.discussing { background: #a78bfa; animation: barPulse 1.8s ease-in-out infinite; }
  .status-bar.error { background: #f87171; }
  @keyframes barShimmer { 0% { background-position: 220% 0; } 100% { background-position: -20% 0; } }
  @keyframes barPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

  /* 카드 상단 중앙 — 결재 대기/미해결 작업/실시간 협업 등 "결정되지 않은" 상태가 있을 때만
     말풍선 모양 + 타이핑 도트로 은은하게 깜빡임 (확인되면 즉시 사라짐)
     중앙 정렬: 좌상단 모서리에 두면 인접 카드와 겹쳐 보여 소속이 헷갈리는 문제가 있었음 */
  .msg-badge {
    display: none; position: absolute; top: -19px; left: 50%; transform: translateX(-50%); z-index: 8;
    width: 24px; height: 17px; border-radius: 8px;
    background: linear-gradient(160deg, #6ff5ff, #2bb8cc);
    box-shadow: 0 0 8px rgba(95,240,255,0.55);
    align-items: center; justify-content: center; gap: 2.5px;
    animation: msgBubblePulse 1.8s ease-in-out infinite;
  }
  .msg-badge::after {
    content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
    width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent;
    border-top: 5px solid #2bb8cc;
  }
  .msg-badge.show { display: flex; }
  .level-members .msg-badge { top: -16px; width: 20px; height: 14px; }
  .level-members .msg-badge::after { bottom: -3px; border-left-width: 3px; border-right-width: 3px; border-top-width: 4px; }
  .msg-badge .dot { width: 3px; height: 3px; margin: 0; border-radius: 50%; background: #0a0d14; animation: msgDotBlink 1.3s infinite; }
  .msg-badge .dot:nth-child(2) { animation-delay: 0.18s; }
  .msg-badge .dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes msgDotBlink { 0%, 100% { opacity: 0.25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-1px); } }
  @keyframes msgBubblePulse {
    0%, 100% { box-shadow: 0 0 6px rgba(95,240,255,0.4); transform: translateX(-50%) scale(1); }
    50% { box-shadow: 0 0 15px rgba(95,240,255,0.8); transform: translateX(-50%) scale(1.07); }
  }

  .card.inactive-persona { opacity: 0.35; filter: grayscale(0.6); }
  .card.inactive-persona::after {
    content: '해임됨'; position: absolute; bottom: -6px; right: 8px; font-size: 8.5px;
    color: #f87171; background: rgba(8,12,20,0.9); padding: 1px 5px; border-radius: 4px;
  }

  #log {
    position: fixed; right: 0; top: 0; bottom: 0; width: 320px; z-index: 10;
    background: rgba(8,12,20,0.85); backdrop-filter: blur(10px);
    border-left: 1px solid rgba(95,240,255,0.15);
    overflow-y: auto; padding: 80px 14px 14px;
  }
  #log h2 { font-size: 11px; color: #4a6577; letter-spacing: 2px; text-transform: uppercase; }
  #logHeadRow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  #streamClearAllBtn {
    font-size: 9.5px; color: #6b7d8f; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 3px 8px; cursor: pointer;
  }
  #streamClearAllBtn:hover { background: rgba(248,113,113,0.15); color: #f87171; border-color: rgba(248,113,113,0.3); }
  .event { position: relative; }
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

  body { padding-right: 320px; padding-left: 208px; }

  /* 종 알림은 카드 위가 아니라 헤더의 다른 버튼들과 같은 줄에 — 겹침 없이, 확인이 필요한
     항목들과 시각적으로 한 그룹으로 묶임. 강조를 위해 amber 톤만 다르게 줌 */
  .header-btn-alert {
    background: rgba(255,215,106,0.1); border-color: rgba(255,215,106,0.35); color: #ffd76a;
  }
  .header-btn-alert:hover { background: rgba(255,215,106,0.2); }
  .bell-badge {
    position: absolute; top: -5px; right: -5px; min-width: 16px; height: 16px; border-radius: 8px;
    background: #f87171; color: #fff; font-size: 9.5px; font-weight: 700; display: none;
    align-items: center; justify-content: center; padding: 0 4px; box-shadow: 0 0 6px rgba(248,113,113,0.7);
    border: 1.5px solid rgba(10,13,20,0.95);
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
  .act-btn.reply { background: rgba(255,215,106,0.16); color: #ffd76a; }
  .act-btn.approve { background: rgba(74,222,128,0.18); color: #4ade80; }
  .act-btn.hold { background: rgba(107,125,143,0.25); color: #c5cdd6; }
  .act-btn.retry { background: rgba(95,240,255,0.18); color: #5ff0ff; }
  .act-btn.delete { background: rgba(248,113,113,0.15); color: #f87171; margin-left: auto; }
  .act-btn:hover { filter: brightness(1.3); }
  .act-btn:disabled { opacity: 0.5; cursor: default; }

  #logMobileHandle { display: none; width: 100%; background: none; border: none; color: #5ff0ff; font-size: 11px; padding: 4px 0 8px; cursor: pointer; font-weight: 700; letter-spacing: 0.5px; }

  /* 모바일 — PC와 동일한 기능을 폰에서 그대로 쓸 수 있도록 좌측 메뉴는 슬라이드 드로어,
     우측 패널들은 화면 중앙 전체폭 모달, Activity Stream은 하단 드로어로 전환 */
  @media (max-width: 860px) {
    body { padding-left: 0; padding-right: 0; }
    #sideMenuBtn { display: flex; }
    #sideMenu {
      transform: translateX(-100%); transition: transform 0.25s ease; width: 78vw; max-width: 280px;
    }
    body.sidebar-open #sideMenu { transform: translateX(0); }

    #header { padding: 12px 12px 8px; flex-wrap: wrap; gap: 8px; }
    #header h1 { font-size: 15px; }
    #header .sub { display: none; }
    #header .status { margin-left: 0; }

    #chart { padding: 14px 16px 50px; }
    .level { gap: 12px; }
    .level-members { gap: 8px; }
    .card { padding: 9px 12px; }

    #costPanel, #projectPanel, #auditPanel, #permPanel, #perfPanel, #decPanel, #bnPanel, #legendPanel, #memoPanel {
      left: 50%; right: auto; transform: translateX(-50%);
      width: 92vw; max-width: 420px; top: 64px; max-height: 78vh;
    }
    #attentionPanel, #cardChatPanel { width: 92vw; max-width: 420px; }
    #cardChatPanel.maximized { width: 96vw; max-height: 90vh; }

    #log {
      position: fixed; left: 0; right: 0; top: auto; bottom: 0; width: 100%; height: 52vh;
      max-height: 72vh; border-left: none; border-top: 1px solid rgba(95,240,255,0.15);
      padding: 6px 14px 14px; border-radius: 14px 14px 0 0;
      transform: translateY(calc(100% - 40px)); transition: transform 0.25s ease;
    }
    #log.expanded { transform: translateY(0); }
    #logMobileHandle { display: block; }
  }
</style>
</head>
<body>
<div id="sideMenuOverlay"></div>
<div id="sideMenu">
  <div class="sm-brand">ALPHA SQUAD</div>
  <div class="sm-pin">
    <button class="sm-item header-btn-alert" id="bellWrap" style="position:relative;">🔔 확인필요 <span id="bellBadge" class="bell-badge" style="position:absolute; top:6px; right:8px;">0</span></button>
    <div class="cost-widget sm-item" id="costWidget">💰 <span id="costValue">—</span> <span id="costPeriod">이번달</span></div>
  </div>
  <div class="sm-group">
    <button class="sm-grouptitle">업무 <span class="car">▾</span></button>
    <div class="sm-sublist">
      <button class="sm-item" id="projectBtn">📁 프로젝트</button>
      <button class="sm-item" id="decBtn" style="position:relative;">🖋 결재 <span id="decBadge" class="bell-badge" style="position:absolute; top:6px; right:8px;">0</span></button>
      <button class="sm-item" id="bnBtn">🚧 병목</button>
    </div>
  </div>
  <div class="sm-group">
    <button class="sm-grouptitle">기록/분석 <span class="car">▾</span></button>
    <div class="sm-sublist">
      <button class="sm-item" id="auditBtn">📜 감사로그</button>
      <button class="sm-item" id="perfBtn">📊 성과</button>
      <button class="sm-item" id="permBtn">🔐 권한</button>
    </div>
  </div>
  <div class="sm-group">
    <button class="sm-grouptitle">안내 <span class="car">▾</span></button>
    <div class="sm-sublist">
      <button class="sm-item" id="legendBtn">ℹ️ 범례 <span id="legendArrow">▾</span></button>
    </div>
  </div>
</div>

<div id="header">
  <button id="sideMenuBtn" title="메뉴">☰</button>
  <h1>ALPHA SQUAD</h1>
  <div class="sub">ALPHA SQUAD KADE COMPANY · LIVE ORG CHART</div>
  <div class="status" id="status"><span class="dot"></span>연결 중...</div>
</div>

<div id="costPanel">
  <h3>💰 비용 현황 (<span id="costRangeLabel">—</span>)</h3>
  <div id="costBreakdown" style="font-size:11.5px; color:#9fb4c4; margin-bottom:10px;"></div>
  <div class="sec-label" style="font-size:10.5px; color:#5a7184; margin:8px 0 6px;">자동 집계 — Anthropic API 토큰</div>
  <div id="costBody"></div>
  <div class="sec-label" style="font-size:10.5px; color:#5a7184; margin:12px 0 6px;">수동 입력 — Claude 콘솔 실청구 / Gemini / GCP VM 등</div>
  <div id="manualCostForm" style="display:flex; gap:5px; margin-bottom:6px; flex-wrap:wrap;">
    <input type="text" id="manualLabelInput" placeholder="항목명 (예: GCP VM 서울)" style="flex:1; min-width:90px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,215,106,0.25); border-radius:6px; color:#e6e6e6; font-size:11px; padding:5px 7px;">
    <input type="number" id="manualAmountInput" placeholder="금액" step="1" style="width:65px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,215,106,0.25); border-radius:6px; color:#e6e6e6; font-size:11px; padding:5px 7px;">
    <select id="manualCurrencyInput" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,215,106,0.25); border-radius:6px; color:#e6e6e6; font-size:11px; padding:5px 4px;">
      <option value="KRW">KRW</option>
      <option value="USD">USD</option>
    </select>
    <input type="date" id="manualDateInput" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,215,106,0.25); border-radius:6px; color:#e6e6e6; font-size:11px; padding:5px 7px;">
  </div>
  <div id="manualCostForm2" style="display:flex; gap:6px; align-items:center; margin-bottom:10px; font-size:10.5px; color:#9fb4c4;">
    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;"><input type="checkbox" id="manualRecurringInput"> 매달 반복(정기 고정비)</label>
    <button id="manualAddBtn" style="margin-left:auto; background:rgba(255,215,106,0.18); color:#ffd76a; border:none; border-radius:6px; padding:5px 11px; font-size:11px; cursor:pointer; font-weight:600;">추가</button>
  </div>
  <div id="manualCostBody"></div>
  <div id="costNote"></div>
</div>

<div id="projectPanel">
  <h3>📁 프로젝트</h3>
  <div id="projectForm">
    <input type="text" id="projectNameInput" placeholder="새 프로젝트명">
    <button id="projectAddBtn">생성</button>
  </div>
  <div id="projectBody"></div>
</div>

<div id="memoPanel">
  <h3>📝 Kade YEO 메모</h3>
  <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
    <textarea id="memoContentInput" placeholder="메모 내용을 입력하세요" rows="2" style="width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,215,106,0.25); border-radius:6px; color:#e6e6e6; font-size:12px; padding:7px; resize:vertical;"></textarea>
    <button id="memoAddBtn" style="align-self:flex-end; background:rgba(255,215,106,0.18); color:#ffd76a; border:none; border-radius:6px; padding:6px 12px; font-size:12px; cursor:pointer; font-weight:700;">추가</button>
  </div>
  <div id="memoBody"></div>
</div>

<div id="auditPanel">
  <h3>📜 감사 로그 — 삭제 처리된 작업</h3>
  <div id="archiveHealth" style="font-size:11px; color:#9fb4c4; background:rgba(255,255,255,0.03); border-radius:8px; padding:8px 10px; margin-bottom:10px;"></div>
  <div id="purgeForm" style="display:flex; gap:5px; align-items:center; margin-bottom:12px; font-size:11px; color:#9fb4c4;">
    <span>정리 기준:</span>
    <input type="number" id="purgeDaysInput" value="180" min="30" style="width:55px; background:rgba(255,255,255,0.04); border:1px solid rgba(95,240,255,0.2); border-radius:6px; color:#e6e6e6; font-size:11px; padding:4px 6px;">
    <span>일 이전</span>
    <button id="purgeBtn" style="background:rgba(248,113,113,0.15); color:#f87171; border:none; border-radius:6px; padding:4px 10px; font-size:11px; cursor:pointer; font-weight:600;">백업 후 영구삭제</button>
  </div>
  <div id="auditBody"></div>
</div>

<div id="permPanel">
  <h3>🔐 권한 매트릭스</h3>
  <table id="permTable">
    <thead><tr><th>페르소나</th><th>보고대상</th><th>위임 가능</th><th>상태</th></tr></thead>
    <tbody id="permBody"></tbody>
  </table>
  <div id="permNote">현재 모든 활성 페르소나는 다른 모든 활성 페르소나에게 업무를 위임할 수 있습니다(부서간 제한 없음). 해임된 페르소나는 대화/위임 요청을 모두 거부합니다.</div>
</div>

<div id="perfPanel">
  <h3>📊 성과 추적</h3>
  <div id="perfTabs" style="display:flex; gap:5px; margin-bottom:10px;">
    <button class="tab active" data-period="month" id="perfTabMonth">이번달</button>
    <button class="tab" data-period="all" id="perfTabAll">전체기간</button>
  </div>
  <table id="perfTable">
    <thead><tr><th>페르소나</th><th>총건수</th><th>완료율</th><th>기한준수율</th><th>실패율</th><th>평균처리(h)</th></tr></thead>
    <tbody id="perfBody"></tbody>
  </table>
  <div id="perfNote" style="font-size:10px; color:#5a7184; margin-top:10px; line-height:1.5;">완료율=완료/전체, 기한준수율=완료된 작업 중 due_date 이내 처리 비율(기한 없는 작업은 제외), 실패율=재작업 발생 지표.</div>
</div>

<div id="decPanel">
  <h3>🖋 결재</h3>
  <div class="sec-label" style="font-size:10.5px; color:#fbbf24; margin-bottom:6px;">⏳ 결재 대기</div>
  <div id="decPendingBody"></div>

  <div class="sec-label" style="font-size:10.5px; color:#5a7184; margin:14px 0 6px;">✍️ 직접 기록 (이미 결정된 사안)</div>
  <div id="decForm" style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
    <div style="display:flex; gap:6px;">
      <select id="decCategoryInput" style="background:rgba(255,255,255,0.04); border:1px solid rgba(95,240,255,0.2); border-radius:6px; color:#e6e6e6; font-size:11px; padding:6px 8px;">
        <option value="전략">전략</option>
        <option value="예산">예산</option>
        <option value="인사">인사</option>
        <option value="기술">기술</option>
        <option value="보안">보안</option>
        <option value="프로젝트">프로젝트</option>
        <option value="기타">기타</option>
      </select>
      <input type="text" id="decSummaryInput" placeholder="결정 내용" style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(95,240,255,0.2); border-radius:6px; color:#e6e6e6; font-size:11px; padding:6px 8px;">
    </div>
    <textarea id="decReasonInput" placeholder="이유/맥락 (선택)" rows="2" style="background:rgba(255,255,255,0.04); border:1px solid rgba(95,240,255,0.2); border-radius:6px; color:#e6e6e6; font-size:11px; padding:6px 8px; resize:vertical;"></textarea>
    <button id="decAddBtn" style="background:rgba(95,240,255,0.18); color:#5ff0ff; border:none; border-radius:6px; padding:6px 11px; font-size:11px; cursor:pointer; font-weight:600; align-self:flex-end;">기록</button>
  </div>

  <div class="sec-label" style="font-size:10.5px; color:#5a7184; margin:14px 0 6px;">📜 결재 이력</div>
  <div id="decBody"></div>
</div>

<div id="bnPanel">
  <h3>🚧 병목 현황 — 누구에게 일이 쌓여있나</h3>
  <div id="bnBody"></div>
  <div id="bnNote" style="font-size:10px; color:#5a7184; margin-top:10px; line-height:1.5;">작업 간 선후관계 추적은 아직 없어, 미해결(대기/실패) 작업 적체량과 대기 시간으로 병목을 판단합니다.</div>
</div>

<div id="legendPanel">
  <h3>ℹ️ 카드 색상 안내</h3>
  <div class="legend-group">
    <div class="legend-label">① 카드 하단 얇은 색상 바 — 지금 이 순간 실시간 활동</div>
    <div class="legend-row"><span class="legend-swatch lg-working"></span>흐르는 cyan — 작업중 (위임받아 처리 중)</div>
    <div class="legend-row"><span class="legend-swatch lg-discussing"></span>느린 보라 pulse — 협업중 (1:1논의/그룹회의 중)</div>
    <div class="legend-row"><span class="legend-swatch lg-error"></span>정적 빨강 — 직전 작업 오류 발생</div>
    <div class="legend-row"><span class="legend-swatch lg-idle"></span>표시 없음 — 대기 중 (할 일 없음)</div>
  </div>
  <div class="legend-group">
    <div class="legend-label">② 카드 테두리/그림자 — 처리 필요한 미해결 작업 적체 (실시간 활동과는 별개)</div>
    <div class="legend-row"><span class="legend-swatch lg-glowpending"></span>은은한 노랑 pulse — 대기(pending) 중인 작업이 있음</div>
    <div class="legend-row"><span class="legend-swatch lg-glowfailed"></span>은은한 빨강 pulse — 실패한 작업이 있음</div>
    <div class="legend-row"><span class="legend-swatch lg-glowheld"></span>은은한 회색 pulse — 보류된 작업이 있음</div>
    <div class="legend-row"><span class="legend-swatch lg-active"></span>초록 + 살짝 떠오름 — 방금(3초간) 위임/응답이 오간 카드</div>
    <div class="legend-row"><span class="legend-swatch lg-flash"></span>한 번 반짝 — 방금 작업이 완료/승인으로 전환됨</div>
  </div>
  <div class="legend-group">
    <div class="legend-label">③ 기타</div>
    <div class="legend-row"><span class="legend-swatch lg-inactive"></span>흐릿한 회색조 + "해임됨" — 비활성화된 페르소나</div>
  </div>
  <div id="legendNote" style="font-size:10px; color:#5a7184; margin-top:6px; line-height:1.5;">①과 ②는 서로 다른 신호입니다 — ①은 "지금 일하는지", ②는 "쌓여서 확인이 필요한 게 있는지"를 의미합니다.</div>
</div>

<div id="cardChatPanel">
  <div id="cardChatTitlebar">
    <div class="chead">
      <div class="avatar" id="ccAvatar"></div>
      <div><div class="cname" id="ccName"></div><div class="crole" id="ccRole"></div></div>
    </div>
    <div id="cardChatControls">
      <button class="cc-winbtn" id="ccMinimizeBtn" title="내리기">─</button>
      <button class="cc-winbtn" id="ccMaximizeBtn" title="확대/축소">⛶</button>
      <button class="cc-winbtn cc-close" id="ccCloseBtn" title="닫기">×</button>
    </div>
  </div>
  <div id="cardChatBody">
    <div class="cstatus" id="ccStatus"></div>
    <div id="ccRequestBlock"></div>
    <textarea id="cardChatInput" placeholder="지금 바로 1:1 업무 지시를 입력하세요... (파일을 참고/학습시키려면 📎로 첨부)"></textarea>
    <div id="ccAttachPreview"></div>
    <input type="file" id="ccFileInput" style="display:none;">
    <div id="cardChatSendRow">
      <button id="ccAttachBtn" title="파일 첨부">📎</button>
      <button id="cardChatSendBtn">전송</button>
    </div>
    <div id="cardChatLog"></div>
  </div>
</div>

<div id="contentionBanner"></div>

<div id="chartViewport">
  <div id="chart">
    <svg id="lines"></svg>

    <div class="level level-ceo">
      <div class="card ceo" id="card-대표님">
        <div class="status-badge" id="badge-대표님"></div>
        <div class="ceo-alert" id="ceoAlert" title="확인필요/결재 대기 — 클릭해서 바로 확인">🔔 <span id="ceoAlertCount">0</span></div>
        <div class="avatar">🧑‍💼</div>
        <div class="info"><div class="name">Kade YEO</div><div class="role">CEO</div></div>
      </div>
    </div>

    <div class="level level-coo">
      <div class="card coo" id="card-제이크">
        <div class="status-badge" id="badge-제이크"></div>
        <div class="msg-badge" id="msgbadge-제이크"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        <div class="avatar">🧠</div>
        <div class="info"><div class="name">제이크</div><div class="role">COO</div></div>
        <div class="status-bar" id="actbar-제이크"></div>
      </div>
    </div>

    <div class="level level-members" id="members"></div>
    <div class="level level-subteam" id="subteam"></div>
  </div>
  <div id="chartZoomCtrl">
    <button id="chartZoomIn" title="확대">+</button>
    <button id="chartZoomOut" title="축소">−</button>
    <button id="chartZoomReset" title="초기화">⤾</button>
  </div>
</div>

<div id="log">
  <button id="logMobileHandle">▲ Activity Stream</button>
  <div id="logHeadRow">
    <h2>Activity Stream</h2>
    <button id="streamClearAllBtn" title="전체 삭제">🗑 전체삭제</button>
  </div>
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
  "피오":"백엔드본부장","리리":"프론트엔드본부장","에바":"UXR본부장","사라":"UXR팀장",
  "미나":"CRO본부장","카이":"GTM본부장","설리":"QA본부장","노바":"DevOps팀장"
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
  div.innerHTML = '<div class="status-badge" id="badge-' + name + '"></div><div class="msg-badge" id="msgbadge-' + name + '"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div class="avatar">' + ICONS[name] + '</div><div class="info"><div class="name">' + name + '</div><div class="role">' + ROLES[name] + '</div></div><div class="status-bar" id="actbar-' + name + '"></div>';
  return div;
}

const membersEl = document.getElementById('members');
DIRECT_REPORTS.forEach(name => membersEl.appendChild(buildCard(name)));

const subteamEl = document.getElementById('subteam');
Object.keys(SUB_REPORTS).forEach(name => subteamEl.appendChild(buildCard(name)));

const svg = document.getElementById('lines');
const chart = document.getElementById('chart');
const chartViewport = document.getElementById('chartViewport');

// offsetLeft/offsetTop은 CSS transform(패닝/확대축소)의 영향을 받지 않는 "레이아웃 좌표"라서,
// 줌 레벨이 바뀌어도 선(line) 계산이 항상 정확하게 유지된다.
function relPos(el) {
  let x = 0, y = 0, node = el;
  while (node && node !== chart) {
    x += node.offsetLeft; y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y };
}
function center(el) {
  const p = relPos(el);
  return { x: p.x + el.offsetWidth / 2, y: p.y + el.offsetHeight / 2, top: p.y, bottom: p.y + el.offsetHeight };
}

function elbowPath(p1, p2) {
  const midY = (p1.bottom + p2.top) / 2;
  return 'M ' + p1.x + ' ' + p1.bottom + ' L ' + p1.x + ' ' + midY + ' L ' + p2.x + ' ' + midY + ' L ' + p2.x + ' ' + p2.top;
}

// 임의의 두 점(x1,y1)→(x2,y2) 사이를 잇는 엘보 경로 — 시작/끝 순서를 그대로 보존해
// stroke-dashoffset 흐름 애니메이션이 항상 from→to 방향으로 흐르도록 함
function directedElbow(x1, y1, x2, y2) {
  const midY = (y1 + y2) / 2;
  return 'M ' + x1 + ' ' + y1 + ' L ' + x1 + ' ' + midY + ' L ' + x2 + ' ' + midY + ' L ' + x2 + ' ' + y2;
}

const SUBTEAM_ROW_H = 64;
function positionSubteam() {
  const subteamEl2 = document.getElementById('subteam');
  const subPos = relPos(subteamEl2);
  // 같은 본부장 산하에 여러 명이 붙을 수 있어(팀장 + 신규 채용 등) — 가로로 펼치면 옆
  // 부서 카드와 겹치므로, 실제 회사 조직도처럼 부모 바로 아래로 "수직으로" 쌓는다.
  // 가로 위치는 항상 부모 중앙과 정확히 같아서 다른 부서와 절대 겹치지 않음.
  // 노바 산하의 노아처럼 본부장이 아니라 팀장 산하인 2단계 중첩도 있을 수 있어,
  // 부모 카드가 먼저 자리잡혀야 자식이 그 "실제 위치" 기준으로 쌓일 수 있음 —
  // 본부장(1단계) 그룹을 먼저 배치한 뒤 팀장 산하(2단계) 그룹을 배치한다.
  const byParent = {};
  Object.entries(SUB_REPORTS).forEach(([name, parent]) => {
    (byParent[parent] = byParent[parent] || []).push(name);
  });
  const subKeys = new Set(Object.keys(SUB_REPORTS));
  const groups = Object.entries(byParent).sort((a, b) => (subKeys.has(a[0]) ? 1 : 0) - (subKeys.has(b[0]) ? 1 : 0));

  let maxBottom = 0;
  groups.forEach(([parent, children]) => {
    const parentCard = document.getElementById('card-' + parent);
    if (!parentCard) return;
    const parentPos = relPos(parentCard);
    const parentCenterX = parentPos.x + parentCard.offsetWidth / 2 - subPos.x;
    const parentBottomY = parentPos.y - subPos.y + parentCard.offsetHeight;
    children.forEach((name, i) => {
      const childCard = document.getElementById('card-' + name);
      if (!childCard) return;
      const top = parentBottomY + 10 + i * SUBTEAM_ROW_H;
      childCard.style.left = parentCenterX + 'px';
      childCard.style.top = top + 'px';
      maxBottom = Math.max(maxBottom, top + SUBTEAM_ROW_H);
    });
  });
  subteamEl2.style.height = (maxBottom + 8) + 'px';
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

  // 팀장급/신규채용은 본부장(또는 팀장) 산하 — 항상 "진짜 부모"에게서 직접 선을 그림.
  // 형제(같은 부모를 둔 동료)끼리 체인으로 잇지 않음 — 동료 사이에 위계가 있는 것처럼
  // 보이는 착시(예: 노아가 노바 밑에 있는 것처럼 보임)를 방지하기 위함
  Object.entries(SUB_REPORTS).forEach(([name, parent]) => {
    const m = center(document.getElementById('card-' + name));
    const parentPoint = center(document.getElementById('card-' + parent));
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', elbowPath(parentPoint, m));
    p.setAttribute('stroke', 'rgba(165,180,255,0.3)');
    p.setAttribute('stroke-width', '1.2');
    p.setAttribute('stroke-dasharray', '3,3');
    p.setAttribute('fill', 'none');
    svg.appendChild(p);
  });
}
window.addEventListener('resize', drawStaticLines);
setTimeout(drawStaticLines, 50);

// ── 채용 승인으로 실제 합류한 신규 페르소나 — 본부장 산하(SUB_REPORTS)에 실제로 연결 ──────
// DIRECT_REPORTS/MEMBERS/ROLES/ICONS/SUB_REPORTS는 const지만 배열·객체 자체는 변경 가능(재할당만
// 금지) — push/속성추가만으로 이미 돌고 있는 폴링 함수들(MEMBERS 참조)에 자동으로 반영됨
const customSubteamNames = new Set();
async function loadCustomPersonas() {
  try {
    const res = await fetch('/personas/custom');
    const list = (await res.json()).personas || [];
    const currentNames = new Set(list.map(p => p.name));

    // 이름이 바뀌었거나(개명) 더 이상 목록에 없는 기존 카드 정리
    [...customSubteamNames].forEach(name => {
      if (currentNames.has(name)) return;
      delete SUB_REPORTS[name];
      const i1 = MEMBERS.indexOf(name); if (i1 > -1) MEMBERS.splice(i1, 1);
      const i2 = ALL_NAMES.indexOf(name); if (i2 > -1) ALL_NAMES.splice(i2, 1);
      const el = document.getElementById('card-' + name); if (el) el.remove();
      customSubteamNames.delete(name);
    });

    list.forEach(p => {
      ROLES[p.name] = p.role;
      ICONS[p.name] = p.icon || '🧩';
      SUB_REPORTS[p.name] = p.parent || '제이크';
      if (!customSubteamNames.has(p.name)) {
        MEMBERS.push(p.name);
        ALL_NAMES.push(p.name);
        subteamEl.appendChild(buildCard(p.name));
        customSubteamNames.add(p.name);
      } else {
        const card = document.getElementById('card-' + p.name);
        const roleEl = card && card.querySelector('.role');
        if (roleEl) roleEl.textContent = p.role;
      }
    });
    drawStaticLines();
    pollActivityMap(); pollUnreadBadges(); pollStatusMap();
  } catch (e) { /* ignore */ }
}
loadCustomPersonas();
setInterval(loadCustomPersonas, 15000);

// ── 조직도 패닝/줌 — 마우스 드래그+휠, 손가락 드래그+핀치 모두 지원 ──────────
let panX = 0, panY = 0, chartScale = 1, dragMoved = false;
const MIN_SCALE = 0.35, MAX_SCALE = 2.2;

function applyChartTransform() {
  chart.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + chartScale + ')';
}
function zoomAt(cx, cy, factor) {
  const prev = chartScale;
  chartScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, chartScale * factor));
  panX = cx - (cx - panX) * (chartScale / prev);
  panY = cy - (cy - panY) * (chartScale / prev);
  applyChartTransform();
}
function centerChart() {
  const vw = chartViewport.clientWidth, vh = chartViewport.clientHeight;
  panX = Math.max(20, (vw - chart.offsetWidth * chartScale) / 2);
  panY = 24;
  applyChartTransform();
}
setTimeout(centerChart, 60);
window.addEventListener('resize', centerChart);

let isPanning = false, panStartX = 0, panStartY = 0, panOrigX = 0, panOrigY = 0;
chartViewport.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  isPanning = true; dragMoved = false;
  panStartX = e.clientX; panStartY = e.clientY; panOrigX = panX; panOrigY = panY;
  chartViewport.classList.add('dragging');
});
window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  const dx = e.clientX - panStartX, dy = e.clientY - panStartY;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
  panX = panOrigX + dx; panY = panOrigY + dy;
  applyChartTransform();
});
window.addEventListener('mouseup', () => {
  if (isPanning) { isPanning = false; chartViewport.classList.remove('dragging'); }
});
chartViewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = chartViewport.getBoundingClientRect();
  zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
}, { passive: false });

function touchDist(t) { const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.hypot(dx, dy); }
let touchMode = null, lastTouchX = 0, lastTouchY = 0, lastPinchDist = 0;
chartViewport.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchMode = 'pan'; dragMoved = false;
    lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    touchMode = 'pinch'; lastPinchDist = touchDist(e.touches);
  }
}, { passive: true });
chartViewport.addEventListener('touchmove', (e) => {
  if (touchMode === 'pan' && e.touches.length === 1) {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - lastTouchX, dy = t.clientY - lastTouchY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
    panX += dx; panY += dy;
    lastTouchX = t.clientX; lastTouchY = t.clientY;
    applyChartTransform();
  } else if (touchMode === 'pinch' && e.touches.length === 2) {
    e.preventDefault();
    const dist = touchDist(e.touches);
    const rect = chartViewport.getBoundingClientRect();
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
    zoomAt(midX, midY, dist / lastPinchDist);
    lastPinchDist = dist;
  }
}, { passive: false });
chartViewport.addEventListener('touchend', () => { touchMode = null; });

document.getElementById('chartZoomIn').addEventListener('click', (e) => {
  e.stopPropagation();
  zoomAt(chartViewport.clientWidth / 2, chartViewport.clientHeight / 2, 1.25);
});
document.getElementById('chartZoomOut').addEventListener('click', (e) => {
  e.stopPropagation();
  zoomAt(chartViewport.clientWidth / 2, chartViewport.clientHeight / 2, 1 / 1.25);
});
document.getElementById('chartZoomReset').addEventListener('click', (e) => {
  e.stopPropagation();
  chartScale = 1; centerChart();
});

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
  // 항상 출발지(from)의 카드 가장자리에서 시작해 도착지(to)의 카드 가장자리에서 끝나도록
  // 좌표 순서를 보존 — 위/아래/좌/우 어떤 배치든 흐름 애니메이션이 올바른 방향으로 흐름
  const startY = p1.y <= p2.y ? p1.bottom : p1.top;
  const endY = p1.y <= p2.y ? p2.top : p2.bottom;
  const d = directedElbow(p1.x, startY, p2.x, endY);

  // 흐릿한 레일(고정 경로) + 그 위를 흐르는 점선 신호, 두 겹으로 표현
  const rail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  rail.setAttribute('d', d);
  rail.setAttribute('stroke', 'rgba(74,222,128,0.18)');
  rail.setAttribute('stroke-width', '3');
  rail.setAttribute('fill', 'none');
  svg.appendChild(rail);

  const signal = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  signal.setAttribute('d', d);
  signal.setAttribute('stroke', '#4ade80');
  signal.setAttribute('stroke-width', '3');
  signal.setAttribute('fill', 'none');
  signal.setAttribute('stroke-linecap', 'round');
  signal.setAttribute('filter', 'drop-shadow(0 0 6px rgba(74,222,128,0.85))');
  signal.classList.add('signal-flow');
  svg.appendChild(signal);

  setTimeout(() => { rail.remove(); signal.remove(); }, 1600);
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

// 개별 메시지에 대해 답장(해당 페르소나 카드챗 열기) / 보류 / 철회(삭제) 등을
// 상태별로 다르게 제시 — 일괄 승인/삭제만 있던 기존 구조의 불편함을 해소
function streamActionButtons(ev) {
  const replyTarget = ev.to !== '대표님' ? ev.to : ev.from;
  let btns = '<button class="act-btn reply" data-act="reply" data-target="' + esc(replyTarget) + '">💬 답장</button>';
  if (ev.status === 'failed') {
    btns += '<button class="act-btn retry" data-act="retry">재시도</button>';
    btns += '<button class="act-btn approve" data-act="approve">확인(승인)</button>';
    btns += '<button class="act-btn hold" data-act="hold">보류</button>';
    btns += '<button class="act-btn delete" data-act="delete">삭제</button>';
  } else if (ev.status === 'pending') {
    btns += '<button class="act-btn approve" data-act="approve">승인</button>';
    btns += '<button class="act-btn hold" data-act="hold">보류</button>';
    btns += '<button class="act-btn delete" data-act="delete" data-label="철회">철회</button>';
  } else if (ev.status === 'held') {
    btns += '<button class="act-btn approve" data-act="resume">재개</button>';
    btns += '<button class="act-btn delete" data-act="delete">삭제</button>';
  } else {
    btns += '<button class="act-btn delete" data-act="delete">삭제</button>';
  }
  return '<div class="att-actions">' + btns + '</div>';
}

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
    ' · <span class="' + statusClass + '">' + ev.status + '</span></div>' +
    streamActionButtons(ev);
  if (hasDetail) {
    div.addEventListener('click', () => {
      div.classList.toggle('expanded');
      const moreEl = div.querySelector('.more');
      const taskEl = div.querySelector('.task');
      if (div.classList.contains('expanded')) { taskEl.classList.remove('collapsed'); if (moreEl) moreEl.textContent = '접기 ▴'; }
      else { taskEl.classList.add('collapsed'); if (moreEl) moreEl.textContent = '자세히 보기 ▾'; }
    });
  }
  div.querySelectorAll('.act-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const act = btn.dataset.act;
      if (act === 'reply') { openCardChat(btn.dataset.target); return; }
      if (act === 'delete') {
        const label = btn.dataset.label || '삭제';
        if (!confirm('이 기록을 영구적으로 ' + label + '합니다. 되돌릴 수 없습니다. 계속할까요?')) return;
      } else if (act === 'retry' && !confirm('같은 내용으로 실제로 다시 실행합니다 (API 비용 재발생). 계속할까요?')) {
        return;
      }
      btn.disabled = true;
      const method = act === 'delete' ? 'DELETE' : 'POST';
      const result = await taskAction(ev.id, act === 'delete' ? '' : act, method);
      if (!result) { btn.disabled = false; return; }
      if (act === 'delete') { streamEvents = streamEvents.filter(x => x.id !== ev.id); }
      else if (result.status) { ev.status = result.status; }
      renderStream();
      pollAttention(); pollStatusMap();
    });
  });
  return div;
}

function renderStream() {
  const filtered = activeTabStatus === 'all' ? streamEvents : streamEvents.filter(e => e.status === activeTabStatus);
  eventsEl.innerHTML = '';
  emptyEl.style.display = filtered.length === 0 ? 'block' : 'none';
  filtered.forEach(ev => eventsEl.appendChild(buildEventCard(ev, freshIds.has(ev.id))));
}

document.getElementById('streamClearAllBtn').addEventListener('click', () => {
  if (streamEvents.length === 0) return;
  if (!confirm('Activity Stream에 표시된 항목 ' + streamEvents.length + '건을 화면에서 전부 지울까요? (실제 작업 데이터는 삭제되지 않습니다)')) return;
  streamEvents = [];
  renderStream();
});

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

// ── Kade YEO 카드 알림 — 확인필요(종)/결재 합산, 좌측 드롭메뉴에 묻혀 놓치는 문제 해소 ──
const ceoAlert = document.getElementById('ceoAlert');
const ceoAlertCount = document.getElementById('ceoAlertCount');
let lastAttentionCount = 0, lastDecisionCount = 0, lastMemoCount = 0;
function updateCeoAlert() {
  const total = lastAttentionCount + lastDecisionCount + lastMemoCount;
  ceoAlertCount.textContent = total;
  ceoAlert.classList.toggle('show', total > 0);
  ceoAlert.title = (lastDecisionCount > 0 ? '결재 대기 ' + lastDecisionCount + '건' : '') +
    (lastAttentionCount > 0 ? (lastDecisionCount > 0 ? ' · ' : '') + '확인필요 ' + lastAttentionCount + '건' : '') +
    (lastMemoCount > 0 ? ((lastDecisionCount + lastAttentionCount) > 0 ? ' · ' : '') + '메모 알림 ' + lastMemoCount + '건' : '') +
    ' — 클릭해서 바로 확인';
}
ceoAlert.addEventListener('click', (e) => {
  e.stopPropagation();
  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); costPanel.classList.remove('show');
  permPanel.classList.remove('show'); perfPanel.classList.remove('show'); bnPanel.classList.remove('show');
  legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  attentionPanel.classList.remove('show'); decPanel.classList.remove('show'); memoPanel.classList.remove('show');
  if (lastDecisionCount > 0) {
    decPanel.classList.add('show');
    pollDecisions(); pollPendingDecisions();
  } else if (lastAttentionCount > 0) {
    attentionPanel.classList.add('show');
  } else if (lastMemoCount > 0) {
    memoPanel.classList.add('show');
    pollMemos();
  }
});

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
    return await res.json().catch(() => true);
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
  if (status === 'failed') {
    btns += '<button class="act-btn retry" data-id="' + t.id + '" data-act="retry">재시도</button>';
    btns += '<button class="act-btn approve" data-id="' + t.id + '" data-act="approve">확인(승인)</button>';
    btns += '<button class="act-btn hold" data-id="' + t.id + '" data-act="hold">보류</button>';
  } else if (status === 'pending') {
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
    lastAttentionCount = count;
    updateCeoAlert();
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
      attentionBody.innerHTML += '<div class="sec-label">⏳ 진행/확인 필요 — 요청 내용</div>';
      pending.forEach(t => {
        attentionBody.innerHTML +=
          '<div class="att-item pending"><div class="route">' + t.from + ' → ' + t.to + '</div>' +
          '<div class="text">' + esc(t.instruction || t.title) + '</div>' + actionButtons(t, 'pending') + '</div>';
      });
    }
    if (held.length > 0) {
      attentionBody.innerHTML += '<div class="sec-label">⏸ 보류 중</div>';
      held.forEach(t => {
        attentionBody.innerHTML +=
          '<div class="att-item pending"><div class="route">' + t.from + ' → ' + t.to + '</div>' +
          '<div class="text">' + esc(t.instruction || t.title) + '</div>' + actionButtons(t, 'held') + '</div>';
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
        } else if (act === 'retry') {
          if (!confirm('같은 내용으로 실제로 다시 실행합니다 (API 비용 재발생). 계속할까요?')) return;
          btn.textContent = '재시도 중...'; btn.disabled = true;
          ok = await taskAction(id, act, 'POST');
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
const costPeriod = document.getElementById('costPeriod');
const costRangeLabel = document.getElementById('costRangeLabel');
const costBreakdown = document.getElementById('costBreakdown');
const manualCostBody = document.getElementById('manualCostBody');
const manualLabelInput = document.getElementById('manualLabelInput');
const manualAmountInput = document.getElementById('manualAmountInput');
const manualDateInput = document.getElementById('manualDateInput');
const manualAddBtn = document.getElementById('manualAddBtn');

async function personaAction(name, action, reason) {
  try {
    const res = await fetch('/personas/' + name + '/' + action, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || null })
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.detail || '처리 실패'); return; }
    pollCost(); pollStatusMap();
  } catch (e) { alert('처리 실패: ' + e.message); }
}

async function pollCost() {
  try {
    const res = await fetch('/cost/summary');
    const data = await res.json();
    costValue.textContent = '$' + data.total_this_month.toFixed(2);
    costRangeLabel.textContent = data.period;
    const diff = data.total_this_month - data.prev_month;
    const diffStr = data.prev_month > 0 ? (diff >= 0 ? ' (+$' + diff.toFixed(2) + ')' : ' (-$' + Math.abs(diff).toFixed(2) + ')') : '';
    const gcp = data.gcp_auto || {};
    const gcpStr = gcp.available
      ? ('GCP 실사용량(BigQuery 자동집계): $' + gcp.net_cost_usd.toFixed(2))
      : ('GCP 자동집계 대기 중 (' + (gcp.reason || '미설정') + ')');
    const anth = data.anthropic_auto || {};
    const anthStr = anth.available
      ? ('Anthropic 실제 청구액(Cost Report 자동집계): $' + anth.actual_cost_usd.toFixed(2) + ' — 합계에 추정치 대신 이 값 사용 중')
      : ('Anthropic 실청구 자동집계 대기 중 (' + (anth.reason || '미설정') + ') — 현재는 토큰 추정치 사용');
    costBreakdown.innerHTML = 'API 자동집계(추정): $' + data.api_total.toFixed(2) + ' · 수동입력: $' + data.manual_total.toFixed(2) +
      ' · 합계: $' + data.total_this_month.toFixed(2) +
      '<br><span style="font-size:10.5px;">' + esc(anthStr) + '</span>' +
      '<br><span style="font-size:10.5px;">' + esc(gcpStr) + '</span>';

    costBody.innerHTML = data.by_persona.map(p => {
      const isJake = p.persona === '제이크';
      const btn = isJake ? '' : (p.active
        ? '<button class="cost-act deactivate" data-name="' + p.persona + '">해임</button>'
        : '<button class="cost-act activate" data-name="' + p.persona + '">재고용</button>');
      return '<div class="cost-row' + (p.active ? '' : ' inactive') + '"><span class="name">' + esc(p.persona) + (p.active ? '' : ' (비활성)') + '</span>' +
        '<span class="val">$' + p.cost.toFixed(4) + '</span>' + btn + '</div>';
    }).join('') || '<div style="color:#34465a;font-size:11px;">집계된 사용량 없음</div>';

    manualCostBody.innerHTML = data.manual_costs.map(m => {
      const amtStr = m.currency === 'KRW' ? (Math.round(m.amount).toLocaleString('ko-KR') + '원') : ('$' + m.amount.toFixed(2));
      const recurTag = m.recurring ? ' <span style="color:#5ff0ff;">[정기]</span>' : '';
      return '<div class="cost-row"><span class="name">' + esc(m.label) + recurTag + ' (' + m.billed_date + ')' + (m.note ? ' — ' + esc(m.note) : '') + '</span>' +
        '<span class="val">' + amtStr + ' (≈$' + m.amount_usd.toFixed(2) + ')</span>' +
        '<button class="cost-act deactivate" data-mid="' + m.id + '" style="margin-left:6px;">삭제</button></div>';
    }).join('') || '<div style="color:#34465a;font-size:11px;">수동 입력 항목 없음</div>';

    costNote.textContent = diffStr ? ('전월 대비' + diffStr) : '';

    costBody.querySelectorAll('.cost-act').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        if (btn.classList.contains('deactivate')) {
          const row = btn.closest('.cost-row');
          const cost = row.querySelector('.val').textContent;
          if (!confirm(
            name + '을 해임(비활성화)합니다.\\n\\n' +
            '실제 효과: ' + name + '에게 1:1 대화 요청 시 거부(403)되고, 다른 팀원이 delegate_task/consult_team/discuss_with로 업무를 위임·논의 요청해도 거부됩니다.\\n' +
            '삭제되지 않는 것: 기존 대화기록, 처리했던 작업기록, 이번달 누적 비용(' + cost + ')은 전부 그대로 보존됩니다.\\n' +
            '되돌리는 방법: 같은 패널의 "재고용" 버튼을 누르면 즉시 모든 기능이 복구됩니다 (데이터 손실 없음).\\n\\n계속할까요?'
          )) return;
          const deactivateReason = prompt('해임 이유를 입력하세요 (결재 이력에 기록됩니다, 비워두면 미기록)', '') || '';
          personaAction(name, 'deactivate', deactivateReason);
        } else {
          if (!confirm(name + '을 재고용(활성화)할까요? 즉시 대화/위임 요청을 다시 받습니다.')) return;
          const activateReason = prompt('재고용 이유를 입력하세요 (선택)', '') || '';
          personaAction(name, 'activate', activateReason);
        }
      });
    });

    manualCostBody.querySelectorAll('.cost-act').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('이 비용 항목을 삭제할까요?')) return;
        await fetch('/cost/manual/' + btn.dataset.mid, { method: 'DELETE' });
        pollCost();
      });
    });
  } catch (e) { costValue.textContent = '오류'; }
}

manualAddBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  const label = manualLabelInput.value.trim();
  const amount = parseFloat(manualAmountInput.value);
  const date = manualDateInput.value;
  const currency = document.getElementById('manualCurrencyInput').value;
  const recurring = document.getElementById('manualRecurringInput').checked;
  if (!label || !amount || !date) { alert('항목명/금액/날짜를 모두 입력하세요.'); return; }
  await fetch('/cost/manual', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, amount, currency, recurring, billed_date: date })
  });
  manualLabelInput.value = ''; manualAmountInput.value = '';
  document.getElementById('manualRecurringInput').checked = false;
  pollCost();
});

costWidget.addEventListener('click', (e) => {
  e.stopPropagation();
  costPanel.classList.toggle('show');
});
document.addEventListener('click', (e) => {
  if (!costPanel.contains(e.target) && !costWidget.contains(e.target)) costPanel.classList.remove('show');
});
pollCost();
setInterval(pollCost, 30000);

// ── 워크플로 충돌 우선순위 배너 ──────────────────────────────
const contentionBanner = document.getElementById('contentionBanner');
async function pollContention() {
  try {
    const res = await fetch('/activity/contention');
    const data = await res.json();
    const list = data.contention || [];
    if (list.length === 0) { contentionBanner.classList.remove('show'); return; }
    contentionBanner.innerHTML = '⚠️ 업무 과부하 — ' +
      list.map(c => c.persona + '(' + c.count + '건 대기)').join(', ') +
      ' — 처리 순서를 검토해주세요.';
    contentionBanner.classList.add('show');
  } catch (e) { /* ignore */ }
}
pollContention();
setInterval(pollContention, 6000);

// ── 해임된 페르소나 카드 표시 ──────────────────────────────
let activeMapCache = {};
async function pollActiveMap() {
  try {
    const res = await fetch('/personas/active_map');
    const data = await res.json();
    activeMapCache = data.active || {};
    MEMBERS.forEach(name => {
      const el = document.getElementById('card-' + name);
      if (!el) return;
      el.classList.toggle('inactive-persona', activeMapCache[name] === false);
    });
    if (permPanel.classList.contains('show')) renderPermTable();
  } catch (e) { /* ignore */ }
}
pollActiveMap();
setInterval(pollActiveMap, 8000);

// ── 카드 하단 실시간 활동 상태바 — 작업중/협업중/오류/대기(표시 없음) ──────
const ACTIVITY_LABEL = { working: '작업중', delegating: '위임중', discussing: '협업중', error: '오류', idle: '' };
let activityMapCache = {};
async function pollActivityMap() {
  try {
    const res = await fetch('/personas/activity_map');
    const data = await res.json();
    const activity = data.activity || {};
    activityMapCache = activity;
    ['제이크', ...MEMBERS].forEach(name => {
      const bar = document.getElementById('actbar-' + name);
      if (!bar) return;
      const a = activity[name];
      const type = a ? a.activity_type : 'idle';
      bar.className = 'status-bar' + (type !== 'idle' ? ' ' + type : '');
      bar.title = (a && type !== 'idle' && ACTIVITY_LABEL[type])
        ? (ACTIVITY_LABEL[type] + (a.counterpart ? ' · ' + a.counterpart + '와' : '') + (a.note ? ' · ' + a.note : ''))
        : '';
    });
  } catch (e) { /* ignore */ }
}
pollActivityMap();
setInterval(pollActivityMap, 4000);

// ── 💬 미확인 메시지/결재요청 배지 ──────────────────────────
// 처음 접속한 페르소나는 과거 이력 전체를 "안읽음"으로 잡지 않도록, 이 세션이 시작된 시점을
// 기준선으로 사용 — 그 이후에 새로 온 메시지만 진짜 "확인 필요"로 취급
const SESSION_START = new Date().toISOString();
function getSeenTime(name) { return localStorage.getItem('ccSeen_' + name) || SESSION_START; }
function markSeen(name) { localStorage.setItem('ccSeen_' + name, new Date().toISOString()); }

let pendingDecisionsCache = [];

async function pollUnreadBadges() {
  try {
    const [msgRes, decRes, attRes] = await Promise.all([
      fetch('/personas/last_message_map'),
      fetch('/decisions/pending'),
      fetch('/activity/attention'),
    ]);
    const lastMessage = (await msgRes.json()).last_message || {};
    pendingDecisionsCache = (await decRes.json()).decisions || [];
    const pendingRequesters = new Set(pendingDecisionsCache.map(d => d.requested_by));
    const attentionTasks = (await attRes.json()).tasks || [];
    const stuckPersonas = new Set(attentionTasks.filter(t => t.status === 'failed' || t.status === 'pending').map(t => t.to));

    ['제이크', ...MEMBERS].forEach(name => {
      const badge = document.getElementById('msgbadge-' + name);
      if (!badge) return;
      const hasUnreadMessage = lastMessage[name] && lastMessage[name] > getSeenTime(name);
      const hasPendingRequest = pendingRequesters.has(name);
      const hasStuckTask = stuckPersonas.has(name);
      const act = activityMapCache[name];
      const isLiveCollab = act && (act.activity_type === 'discussing' || act.activity_type === 'delegating');
      const needsAttention = Boolean(hasPendingRequest || hasUnreadMessage || hasStuckTask || isLiveCollab);
      badge.classList.toggle('show', needsAttention);
      badge.title = hasPendingRequest ? '결재 요청 대기 중 — 클릭해서 확인'
        : hasStuckTask ? '처리되지 않은 작업이 있습니다'
        : isLiveCollab ? (act.counterpart ? act.counterpart + '와 협업/논의 중' : '실시간 협업 중')
        : hasUnreadMessage ? '확인하지 않은 보고가 있습니다' : '';
    });
  } catch (e) { /* ignore */ }
}
pollUnreadBadges();
setInterval(pollUnreadBadges, 5000);

// ── 프로젝트 패널 ────────────────────────────────────────
const projectBtn = document.getElementById('projectBtn');
const projectPanel = document.getElementById('projectPanel');
const projectBody = document.getElementById('projectBody');
const projectNameInput = document.getElementById('projectNameInput');
const projectAddBtn = document.getElementById('projectAddBtn');

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR');
}

async function pollProjects() {
  try {
    const res = await fetch('/projects');
    const data = await res.json();
    const list = data.projects || [];
    projectBody.innerHTML = list.map(p => {
      const pct = p.total_tasks > 0 ? Math.round(p.done_tasks / p.total_tasks * 100) : 0;
      return '<div class="proj-row" data-id="' + p.id + '">' +
        '<div class="top"><span class="name">' + esc(p.name) + '</span>' +
        '<select class="proj-status ' + p.status + '" data-id="' + p.id + '">' +
        '<option value="active"' + (p.status === 'active' ? ' selected' : '') + '>진행중</option>' +
        '<option value="paused"' + (p.status === 'paused' ? ' selected' : '') + '>보류</option>' +
        '<option value="done"' + (p.status === 'done' ? ' selected' : '') + '>완료</option>' +
        '</select></div>' +
        '<div class="meta">담당: ' + esc(p.owner) + (p.due_date ? ' · 마감: ' + fmtDate(p.due_date) : '') + '</div>' +
        '<div class="prog">진행률: ' + p.done_tasks + '/' + p.total_tasks + ' (' + pct + '%)</div>' +
        '</div>';
    }).join('') || '<div style="color:#34465a;font-size:11px;">등록된 프로젝트가 없습니다</div>';

    projectBody.querySelectorAll('.proj-status').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        e.stopPropagation();
        await fetch('/projects/' + sel.dataset.id + '/status', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: sel.value })
        });
        pollProjects();
      });
    });
  } catch (e) { projectBody.textContent = '불러오기 실패'; }
}

projectAddBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  const name = projectNameInput.value.trim();
  if (!name) return;
  await fetch('/projects', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, owner: '제이크' })
  });
  projectNameInput.value = '';
  pollProjects();
});

projectBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  auditPanel.classList.remove('show'); permPanel.classList.remove('show'); costPanel.classList.remove('show'); perfPanel.classList.remove('show'); decPanel.classList.remove('show'); bnPanel.classList.remove('show'); legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  projectPanel.classList.toggle('show');
  if (projectPanel.classList.contains('show')) pollProjects();
});
document.addEventListener('click', (e) => {
  if (!projectPanel.contains(e.target) && !projectBtn.contains(e.target)) projectPanel.classList.remove('show');
});
setInterval(() => { if (projectPanel.classList.contains('show')) pollProjects(); }, 15000);

// ── Kade YEO 카드 메모 ────────────────────────────────────────
const memoPanel = document.getElementById('memoPanel');
const memoBody = document.getElementById('memoBody');
const memoContentInput = document.getElementById('memoContentInput');
const memoAddBtn = document.getElementById('memoAddBtn');

async function pollMemos() {
  try {
    const res = await fetch('/memos');
    const list = (await res.json()).memos || [];
    memoBody.innerHTML = list.map(m =>
      '<div class="memo-row' + (m.pinned ? ' pinned' : '') + (m.checked ? ' checked' : '') + '" data-id="' + m.id + '">' +
        '<div class="content">' + esc(m.content) + '</div>' +
        '<div class="actions">' +
          '<button class="memo-btn-pin" data-act="pin" data-id="' + m.id + '">' + (m.pinned ? '📌 고정해제' : '📌 고정') + '</button>' +
          '<button class="memo-btn-check" data-act="check" data-id="' + m.id + '">' + (m.checked ? '🔁 대기중으로' : '✅ 확인') + '</button>' +
          '<button class="memo-btn-done" data-act="done" data-id="' + m.id + '">완료</button>' +
          '<button class="memo-btn-del" data-act="del" data-id="' + m.id + '">삭제</button>' +
        '</div></div>'
    ).join('') || '<div style="color:#34465a;font-size:11px;">메모가 없습니다</div>';

    memoBody.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id, act = btn.dataset.act;
        if (act === 'pin') {
          const row = btn.closest('.memo-row');
          await fetch('/memos/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pinned: !row.classList.contains('pinned') }) });
        } else if (act === 'check') {
          const row = btn.closest('.memo-row');
          await fetch('/memos/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checked: !row.classList.contains('checked') }) });
        } else if (act === 'done') {
          await fetch('/memos/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: true }) });
        } else if (act === 'del') {
          if (!confirm('이 메모를 삭제할까요?')) return;
          await fetch('/memos/' + id, { method: 'DELETE' });
        }
        pollMemos();
      });
    });

    lastMemoCount = list.filter(m => !m.checked).length;
    updateCeoAlert();
  } catch (e) { memoBody.textContent = '불러오기 실패'; }
}

memoAddBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  const content = memoContentInput.value.trim();
  if (!content) { alert('메모 내용을 입력하세요.'); return; }
  await fetch('/memos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  memoContentInput.value = '';
  memoRemindInput.value = '';
  pollMemos();
});

document.getElementById('card-대표님').addEventListener('click', (e) => {
  e.stopPropagation();
  if (dragMoved) { dragMoved = false; return; }
  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); permPanel.classList.remove('show');
  costPanel.classList.remove('show'); perfPanel.classList.remove('show'); decPanel.classList.remove('show');
  bnPanel.classList.remove('show'); legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  memoPanel.classList.toggle('show');
  if (memoPanel.classList.contains('show')) pollMemos();
});
document.addEventListener('click', (e) => {
  if (!memoPanel.contains(e.target) && !document.getElementById('card-대표님').contains(e.target)) memoPanel.classList.remove('show');
});
pollMemos();
setInterval(pollMemos, 20000);

// ── 감사 로그 패널 ───────────────────────────────────────
const auditBtn = document.getElementById('auditBtn');
const auditPanel = document.getElementById('auditPanel');
const auditBody = document.getElementById('auditBody');

const archiveHealthEl = document.getElementById('archiveHealth');
const purgeDaysInput = document.getElementById('purgeDaysInput');
const purgeBtn = document.getElementById('purgeBtn');

async function pollArchiveHealth() {
  try {
    const res = await fetch('/admin/db_health');
    const h = await res.json();
    const warnTxt = h.warning ? ('<span style="color:#f87171;font-weight:700;">⚠ 정리 권장 (임계값 ' + h.warn_threshold + '건 초과)</span>') : '<span style="color:#4ade80;">정상</span>';
    archiveHealthEl.innerHTML =
      '보관(archived) 작업: ' + h.archived_count + '건' + (h.archived_oldest ? (' · 가장 오래된 기록: ' + new Date(h.archived_oldest).toLocaleDateString('ko-KR')) : '') + '<br>' +
      '진행중(live) 작업: ' + h.live_count + '건 · 채팅 메시지: ' + h.chat_message_count + '건<br>' + warnTxt;
  } catch (e) { archiveHealthEl.textContent = '상태 조회 실패'; }
}

async function pollAudit() {
  pollArchiveHealth();
  try {
    const res = await fetch('/activity/archived');
    const data = await res.json();
    const list = data.tasks || [];
    auditBody.innerHTML = list.map(t =>
      '<div class="audit-row"><div class="route">' + esc(t.from) + ' → ' + esc(t.to || '미배정') + '</div>' +
      esc(t.title) + '<div class="time">' + new Date(t.timestamp).toLocaleString('ko-KR') + ' · 삭제 처리됨 (status: ' + t.status + ')</div></div>'
    ).join('') || '<div style="color:#34465a;font-size:11px;">보관된 항목이 없습니다</div>';
  } catch (e) { auditBody.textContent = '불러오기 실패'; }
}

purgeBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  const days = parseInt(purgeDaysInput.value, 10);
  if (!days || days < 30) { alert('최소 30일 이전 데이터만 정리할 수 있습니다.'); return; }
  if (!confirm(
    days + '일보다 오래된 "보관(archived)" 작업을 서버 디스크에 JSON으로 백업한 뒤 DB에서 영구 삭제합니다.\\n' +
    '현재 화면에 보이는 진행중 작업에는 영향이 없습니다.\\n계속할까요?'
  )) return;
  try {
    const res = await fetch('/admin/purge_archived', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ older_than_days: days })
    });
    const data = await res.json();
    alert(data.purged_count + '건을 백업(' + data.backup_file + ') 후 삭제했습니다.');
    pollAudit();
  } catch (e) { alert('정리 실패: ' + e.message); }
});

auditBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  projectPanel.classList.remove('show'); permPanel.classList.remove('show'); costPanel.classList.remove('show'); perfPanel.classList.remove('show'); decPanel.classList.remove('show'); bnPanel.classList.remove('show'); legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  auditPanel.classList.toggle('show');
  if (auditPanel.classList.contains('show')) pollAudit();
});
document.addEventListener('click', (e) => {
  if (!auditPanel.contains(e.target) && !auditBtn.contains(e.target)) auditPanel.classList.remove('show');
});

// ── 권한 매트릭스 패널 ───────────────────────────────────
const permBtn = document.getElementById('permBtn');
const permPanel = document.getElementById('permPanel');
const permBody = document.getElementById('permBody');

function reportsTo(name) {
  if (name === '제이크') return 'CEO';
  if (SUB_REPORTS[name]) return SUB_REPORTS[name];
  return '제이크';
}

function renderPermTable() {
  const names = ['제이크', ...MEMBERS];
  permBody.innerHTML = names.map(name => {
    const active = activeMapCache[name] !== false;
    return '<tr><td class="pname' + (active ? '' : ' inactive') + '">' + esc(name) + '</td>' +
      '<td>' + esc(reportsTo(name)) + '</td>' +
      '<td>' + (active ? '전체 활성 페르소나' : '—') + '</td>' +
      '<td>' + (active ? '✅ 활성' : '🚫 해임') + '</td></tr>';
  }).join('');
}

permBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); costPanel.classList.remove('show'); perfPanel.classList.remove('show'); decPanel.classList.remove('show'); bnPanel.classList.remove('show'); legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  permPanel.classList.toggle('show');
  if (permPanel.classList.contains('show')) renderPermTable();
});
document.addEventListener('click', (e) => {
  if (!permPanel.contains(e.target) && !permBtn.contains(e.target)) permPanel.classList.remove('show');
});

// ── 성과 추적 패널 ───────────────────────────────────────
const perfBtn = document.getElementById('perfBtn');
const perfPanel = document.getElementById('perfPanel');
const perfBody = document.getElementById('perfBody');
let perfPeriod = 'month';

function perfClass(val, goodMin, warnMin) {
  if (val === null || val === undefined) return '';
  if (val >= goodMin) return 'perf-good';
  if (val >= warnMin) return 'perf-warn';
  return 'perf-bad';
}

async function pollPerformance() {
  try {
    const res = await fetch('/personas/performance?period=' + perfPeriod);
    const data = await res.json();
    const list = data.performance || [];
    perfBody.innerHTML = list.map(p => {
      const compPct = Math.round(p.completion_rate * 100);
      const failPct = Math.round(p.failure_rate * 100);
      const deadlinePct = p.deadline_adherence === null ? '—' : Math.round(p.deadline_adherence * 100) + '%';
      const deadlineClass = p.deadline_adherence === null ? '' : perfClass(p.deadline_adherence, 0.85, 0.6);
      return '<tr><td class="pname">' + esc(p.persona) + '</td><td>' + p.total + '</td>' +
        '<td class="' + perfClass(p.completion_rate, 0.85, 0.6) + '">' + compPct + '%</td>' +
        '<td class="' + deadlineClass + '">' + deadlinePct + '</td>' +
        '<td class="' + perfClass(1 - p.failure_rate, 0.85, 0.6) + '">' + failPct + '%</td>' +
        '<td>' + (p.avg_hours === null ? '—' : p.avg_hours) + '</td></tr>';
    }).join('') || '<tr><td colspan="6" style="color:#34465a;">집계된 작업이 없습니다</td></tr>';
  } catch (e) { perfBody.innerHTML = '<tr><td colspan="6">불러오기 실패</td></tr>'; }
}

document.getElementById('perfTabMonth').addEventListener('click', (e) => {
  e.stopPropagation();
  perfPeriod = 'month';
  document.querySelectorAll('#perfTabs .tab').forEach(b => b.classList.remove('active'));
  document.getElementById('perfTabMonth').classList.add('active');
  pollPerformance();
});
document.getElementById('perfTabAll').addEventListener('click', (e) => {
  e.stopPropagation();
  perfPeriod = 'all';
  document.querySelectorAll('#perfTabs .tab').forEach(b => b.classList.remove('active'));
  document.getElementById('perfTabAll').classList.add('active');
  pollPerformance();
});

perfBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); costPanel.classList.remove('show'); permPanel.classList.remove('show'); decPanel.classList.remove('show'); bnPanel.classList.remove('show'); legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  perfPanel.classList.toggle('show');
  if (perfPanel.classList.contains('show')) pollPerformance();
});
document.addEventListener('click', (e) => {
  if (!perfPanel.contains(e.target) && !perfBtn.contains(e.target)) perfPanel.classList.remove('show');
});

// ── 결재 패널 ───────────────────────────────────────────
const decBtn = document.getElementById('decBtn');
const decPanel = document.getElementById('decPanel');
const decBody = document.getElementById('decBody');
const decPendingBody = document.getElementById('decPendingBody');

const decBadge = document.getElementById('decBadge');

async function pollDecisions() {
  try {
    const res = await fetch('/decisions');
    const data = await res.json();
    const list = data.decisions || [];
    decBody.innerHTML = list.map(d =>
      '<div class="dec-row"><div class="top"><span class="cat">' + esc(d.category) + '</span><span class="time">' + new Date(d.created_at).toLocaleString('ko-KR') + '</span></div>' +
      '<div class="summary">' + esc(d.summary) + '</div>' +
      (d.requested_by ? '<div class="reason">요청: ' + esc(d.requested_by) + '</div>' : '') +
      (d.reason ? '<div class="reason">배경: ' + esc(d.reason) + '</div>' : '') +
      (d.resolution ? '<div class="reason" style="color:#5ff0ff;">결정: ' + esc(d.resolution) + '</div>' : '') +
      '<div class="by">결재: ' + esc(d.decided_by) + '</div></div>'
    ).join('') || '<div style="color:#34465a;font-size:11px;">기록된 결재 이력이 없습니다</div>';
  } catch (e) { decBody.textContent = '불러오기 실패'; }
}

async function pollPendingDecisions() {
  try {
    const res = await fetch('/decisions/pending');
    const data = await res.json();
    const list = data.decisions || [];
    decBadge.textContent = list.length;
    decBadge.classList.toggle('show', list.length > 0);
    lastDecisionCount = list.length;
    updateCeoAlert();

    // 6초마다 통째로 다시 그리다 보니, 결정 내용을 입력하는 중에 텍스트가 사라지는
    // 문제가 있었음 — 입력 중(포커스 중이거나 이미 글자가 써진 textarea가 있으면)
    // 이번 갱신은 건너뛰어 입력 내용을 보존함
    const typingNow = [...decPendingBody.querySelectorAll('.dec-resolve-input')]
      .some(el => el.value.trim().length > 0 || el === document.activeElement);
    if (typingNow) return;

    decPendingBody.innerHTML = list.map(d => {
      const isHiring = d.category === '인사';
      const actionsHtml = isHiring
        ? '<div style="margin-top:8px; display:flex; gap:6px;">' +
            '<button class="dec-hire-btn" data-id="' + d.id + '" style="background:rgba(74,222,128,0.18); color:#4ade80; border:none; border-radius:6px; padding:5px 11px; font-size:11px; cursor:pointer; font-weight:600;">✅ 승인(채용)</button>' +
            '<button class="dec-reject-btn" data-id="' + d.id + '" style="background:rgba(248,113,113,0.15); color:#f87171; border:none; border-radius:6px; padding:5px 11px; font-size:11px; cursor:pointer; font-weight:600;">❌ 반려</button>' +
          '</div>'
        : '<textarea class="dec-resolve-input" data-id="' + d.id + '" placeholder="결정 내용/피드백을 입력하세요 (보완 필요·반려 시에는 이유를 꼭 적어주세요)" rows="2" style="width:100%; margin-top:6px; background:rgba(255,255,255,0.04); border:1px solid rgba(251,191,36,0.25); border-radius:6px; color:#e6e6e6; font-size:11px; padding:6px; resize:vertical;"></textarea>' +
          '<div style="margin-top:6px; display:flex; gap:6px;">' +
            '<button class="dec-approve-btn" data-id="' + d.id + '" style="background:rgba(74,222,128,0.18); color:#4ade80; border:none; border-radius:6px; padding:5px 11px; font-size:11px; cursor:pointer; font-weight:600;">✅ 승인</button>' +
            '<button class="dec-revise-btn" data-id="' + d.id + '" style="background:rgba(251,191,36,0.18); color:#fbbf24; border:none; border-radius:6px; padding:5px 11px; font-size:11px; cursor:pointer; font-weight:600;">✏️ 보완 필요</button>' +
            '<button class="dec-reject2-btn" data-id="' + d.id + '" style="background:rgba(248,113,113,0.15); color:#f87171; border:none; border-radius:6px; padding:5px 11px; font-size:11px; cursor:pointer; font-weight:600;">❌ 반려</button>' +
          '</div>';
      return '<div class="dec-row" style="border-color:rgba(251,191,36,0.35);"><div class="top"><span class="cat">' + esc(d.category) + '</span><span class="time">' + new Date(d.created_at).toLocaleString('ko-KR') + '</span></div>' +
        '<div class="summary">' + esc(d.summary) + '</div>' +
        '<div class="reason">' + esc(d.requested_by) + '의 요청 — ' + esc(d.reason) + '</div>' +
        actionsHtml +
        '</div>';
    }).join('') || '<div style="color:#34465a;font-size:11px;">결재 대기 중인 사안이 없습니다</div>';

    async function submitResolve(id, tag, requireText, defaultText) {
      const textarea = decPendingBody.querySelector('.dec-resolve-input[data-id="' + id + '"]');
      const text = (textarea ? textarea.value.trim() : '');
      if (requireText && !text) { alert('이유/피드백을 입력하세요.'); return false; }
      const resolution = '[' + tag + '] ' + (text || defaultText);
      await fetch('/decisions/' + id + '/resolve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      });
      pollPendingDecisions(); pollDecisions();
      return true;
    }
    decPendingBody.querySelectorAll('.dec-approve-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        await submitResolve(btn.dataset.id, '승인', false, '승인합니다.');
      });
    });
    decPendingBody.querySelectorAll('.dec-revise-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        const ok = await submitResolve(btn.dataset.id, '보완 필요', true, '');
        if (!ok) btn.disabled = false;
      });
    });
    decPendingBody.querySelectorAll('.dec-reject2-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('이 요청을 반려할까요?')) return;
        btn.disabled = true;
        await submitResolve(btn.dataset.id, '반려', false, '반려합니다.');
      });
    });
    decPendingBody.querySelectorAll('.dec-hire-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!confirm('승인하면 신규 팀원이 실제로 합류해서 바로 대화·업무 위임이 가능해집니다 (API 비용 발생). 계속할까요?')) return;
        btn.disabled = true; btn.textContent = '채용 처리 중...';
        const res = await fetch('/decisions/' + id + '/approve_hire', { method: 'POST' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.detail || '채용 처리 실패. 새로고침 후 다시 시도하세요.');
          btn.disabled = false; btn.textContent = '✅ 승인(채용)';
          return;
        }
        const data = await res.json();
        alert(data.persona.name + '(' + data.persona.role + ')이 ' + data.persona.parent + ' 산하로 합류했습니다. 조직도에 곧 표시됩니다.');
        pollPendingDecisions(); pollDecisions();
        if (typeof loadCustomPersonas === 'function') loadCustomPersonas();
      });
    });
    decPendingBody.querySelectorAll('.dec-reject-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!confirm('이 채용 요청을 반려합니다. 계속할까요?')) return;
        btn.disabled = true; btn.textContent = '처리 중...';
        await fetch('/decisions/' + id + '/resolve', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution: '반려 — 채용하지 않음' })
        });
        pollPendingDecisions(); pollDecisions();
      });
    });
  } catch (e) { decPendingBody.textContent = '불러오기 실패'; }
}
pollPendingDecisions();
setInterval(pollPendingDecisions, 6000);

document.getElementById('decAddBtn').addEventListener('click', async (e) => {
  e.stopPropagation();
  const category = document.getElementById('decCategoryInput').value;
  const summary = document.getElementById('decSummaryInput').value.trim();
  const reason = document.getElementById('decReasonInput').value.trim();
  if (!summary) { alert('결정 내용을 입력하세요.'); return; }
  await fetch('/decisions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, summary, reason: reason || null })
  });
  document.getElementById('decSummaryInput').value = '';
  document.getElementById('decReasonInput').value = '';
  pollDecisions();
});

decBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); costPanel.classList.remove('show'); permPanel.classList.remove('show'); perfPanel.classList.remove('show'); bnPanel.classList.remove('show'); legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  decPanel.classList.toggle('show');
  if (decPanel.classList.contains('show')) { pollDecisions(); pollPendingDecisions(); }
});
document.addEventListener('click', (e) => {
  if (!decPanel.contains(e.target) && !decBtn.contains(e.target)) decPanel.classList.remove('show');
});

// ── 병목 현황 패널 ───────────────────────────────────────
const bnBtn = document.getElementById('bnBtn');
const bnPanel = document.getElementById('bnPanel');
const bnBody = document.getElementById('bnBody');

async function pollBottlenecks() {
  try {
    const res = await fetch('/activity/bottlenecks');
    const data = await res.json();
    const list = data.bottlenecks || [];
    bnBody.innerHTML = list.map(b => {
      const items = b.tasks.map(t =>
        '<div class="bn-item' + (t.age_hours >= 24 ? ' bn-stale' : '') + '"><span>' + esc(t.from) + ' → ' + esc(t.title) + ' (' + t.status + ')</span><span class="age">' + t.age_hours + 'h</span></div>'
      ).join('');
      return '<div class="bn-row"><div class="head"><span class="pname">' + esc(b.persona) + '</span><span class="count">' + b.count + '건 적체 · 최장 ' + b.oldest_age_hours + 'h</span></div>' + items + '</div>';
    }).join('') || '<div style="color:#34465a;font-size:11px;">현재 적체된 작업이 없습니다</div>';
  } catch (e) { bnBody.textContent = '불러오기 실패'; }
}

bnBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); costPanel.classList.remove('show'); permPanel.classList.remove('show'); perfPanel.classList.remove('show'); decPanel.classList.remove('show'); legendPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  bnPanel.classList.toggle('show');
  if (bnPanel.classList.contains('show')) pollBottlenecks();
});
document.addEventListener('click', (e) => {
  if (!bnPanel.contains(e.target) && !bnBtn.contains(e.target)) bnPanel.classList.remove('show');
});

// ── 색상 범례 패널 ───────────────────────────────────────
const legendBtn = document.getElementById('legendBtn');
const legendPanel = document.getElementById('legendPanel');
const legendArrow = document.getElementById('legendArrow');

legendBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); costPanel.classList.remove('show'); permPanel.classList.remove('show'); perfPanel.classList.remove('show'); decPanel.classList.remove('show'); bnPanel.classList.remove('show'); cardChatPanel.classList.remove('show');
  legendPanel.classList.toggle('show');
  legendArrow.textContent = legendPanel.classList.contains('show') ? '▴' : '▾';
});
document.addEventListener('click', (e) => {
  if (!legendPanel.contains(e.target) && !legendBtn.contains(e.target)) {
    legendPanel.classList.remove('show');
    legendArrow.textContent = '▾';
  }
});

// ── 카드 클릭 → 1:1 즉시 메시지 패널 ──────────────────────
const cardChatPanel = document.getElementById('cardChatPanel');
const ccAvatar = document.getElementById('ccAvatar');
const ccName = document.getElementById('ccName');
const ccRole = document.getElementById('ccRole');
const ccStatus = document.getElementById('ccStatus');
const cardChatInput = document.getElementById('cardChatInput');
const cardChatSendBtn = document.getElementById('cardChatSendBtn');
const cardChatLog = document.getElementById('cardChatLog');
let currentCardTarget = null;

document.getElementById('ccMinimizeBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  cardChatPanel.classList.toggle('minimized');
});
document.getElementById('ccMaximizeBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  cardChatPanel.classList.toggle('maximized');
});
document.getElementById('ccCloseBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  cardChatPanel.classList.remove('show', 'minimized', 'maximized');
});

async function openCardChat(name) {
  currentCardTarget = name;
  markSeen(name);
  const ownBadge = document.getElementById('msgbadge-' + name);
  if (ownBadge) ownBadge.classList.remove('show');
  ccAvatar.textContent = name === '제이크' ? '🧠' : ICONS[name];
  ccName.textContent = name;
  ccRole.textContent = name === '제이크' ? 'COO' : ROLES[name];
  cardChatInput.value = '';
  cardChatLog.innerHTML = '<div style="color:#34465a;font-size:11px;">불러오는 중...</div>';

  projectPanel.classList.remove('show'); auditPanel.classList.remove('show'); costPanel.classList.remove('show');
  permPanel.classList.remove('show'); perfPanel.classList.remove('show'); decPanel.classList.remove('show');
  bnPanel.classList.remove('show'); legendPanel.classList.remove('show');
  cardChatPanel.classList.remove('minimized');
  cardChatPanel.classList.add('show');

  const active = activeMapCache[name] !== false;
  const act = activityMapCache[name];
  ccStatus.className = 'cstatus' + (active ? '' : ' inactive');
  ccStatus.textContent = active
    ? ('활성' + (act && act.activity_type !== 'idle' ? (' · ' + (ACTIVITY_LABEL[act.activity_type] || act.activity_type) + (act.counterpart ? ' (' + act.counterpart + '와)' : '')) : ' · 대기 중'))
    : '비활성화(해임) 상태 — 메시지를 보내도 응답을 거부합니다.';

  try {
    const res = await fetch('/history/' + name + '?limit=10');
    const data = await res.json();
    renderCardChatLog(data.messages || []);
  } catch (e) { cardChatLog.innerHTML = '<div style="color:#34465a;font-size:11px;">대화 기록을 불러오지 못했습니다.</div>'; }

  await renderRequestBlock(name);
}

async function renderRequestBlock(name) {
  const block = document.getElementById('ccRequestBlock');
  let html = '';

  const decisions = pendingDecisionsCache.filter(d => d.requested_by === name);
  decisions.forEach(d => {
    html += '<div class="cc-req decision"><div class="label">🖋 결재 요청 · ' + esc(d.category) + '</div>' +
      '<div class="summary">' + esc(d.summary) + '</div>' +
      (d.reason ? '<div class="reason">' + esc(d.reason) + '</div>' : '') +
      '<div class="hint">아래에 답장을 보내면 그 내용으로 자동 결재됩니다.</div></div>';
  });

  try {
    const res = await fetch('/activity/attention');
    const tasks = (await res.json()).tasks || [];
    tasks.filter(t => t.to === name && (t.status === 'failed' || t.status === 'pending')).forEach(t => {
      html += '<div class="cc-req stuck"><div class="label">' + (t.status === 'failed' ? '⛔ 실패' : '⏳ 진행/확인 필요') + '</div>' +
        '<div class="summary">' + esc(t.instruction || t.title) + '</div></div>';
    });
  } catch (e) { /* ignore */ }

  block.innerHTML = html;
}

function attachmentChip(name, url) {
  if (!name || !url) return '';
  return '<a class="cchat-attachment" href="' + url + '" target="_blank" rel="noopener" download>📎 ' + esc(name) + '</a>';
}

function renderCardChatLog(messages) {
  cardChatLog.innerHTML = messages.map(m =>
    '<div class="cchat-msg ' + m.role + '"><div class="who">' + (m.role === 'user' ? '대표님' : currentCardTarget) + ' · ' + new Date(m.timestamp).toLocaleString('ko-KR') + '</div>' + esc(m.content) +
    '<div>' + attachmentChip(m.attachment_name, m.attachment_url) + '</div></div>'
  ).join('') || '<div style="color:#34465a;font-size:11px;">대화 기록 없음</div>';
  cardChatLog.scrollTop = cardChatLog.scrollHeight;
}

// ── 파일 첨부 — 참고자료를 페르소나에게 보내고, 첨부한 파일은 언제든 다운로드 가능 ──
const ccFileInput = document.getElementById('ccFileInput');
const ccAttachBtn = document.getElementById('ccAttachBtn');
const ccAttachPreview = document.getElementById('ccAttachPreview');
let selectedFile = null;

ccAttachBtn.addEventListener('click', (e) => { e.stopPropagation(); ccFileInput.click(); });
ccFileInput.addEventListener('click', (e) => e.stopPropagation());
ccFileInput.addEventListener('change', () => {
  selectedFile = ccFileInput.files[0] || null;
  renderAttachPreview();
});
function renderAttachPreview() {
  if (!selectedFile) { ccAttachPreview.innerHTML = ''; return; }
  ccAttachPreview.innerHTML = '📎 <span class="name">' + esc(selectedFile.name) + '</span><button id="ccAttachRemove" title="제거">×</button>';
  document.getElementById('ccAttachRemove').addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null; ccFileInput.value = ''; renderAttachPreview();
  });
}
async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/uploads', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('파일 업로드 실패');
  return await res.json();
}

cardChatSendBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  const message = cardChatInput.value.trim();
  if ((!message && !selectedFile) || !currentCardTarget) return;
  cardChatSendBtn.disabled = true; cardChatSendBtn.textContent = '전송 중...';

  let finalMessage = message;
  let imageBase64 = '', imageMime = '';
  let attachmentName = null, attachmentUrl = null;
  const fileToSend = selectedFile;
  selectedFile = null; ccFileInput.value = ''; renderAttachPreview();

  try {
    if (fileToSend) {
      const up = await uploadFile(fileToSend);
      attachmentName = up.filename; attachmentUrl = up.url;
      if (up.is_image) {
        imageBase64 = up.image_base64; imageMime = up.image_mime;
        finalMessage = (message || '첨부한 이미지를 확인하고 의견을 알려줘.');
      } else if (up.text_excerpt) {
        finalMessage = '[첨부파일: ' + up.filename + ' — 아래 내용을 참고/학습하세요]\\n\\n' + up.text_excerpt +
          '\\n\\n[지시사항]\\n' + (message || '위 첨부파일 내용을 참고해서 답변해줘.');
      } else {
        finalMessage = '[첨부파일: ' + up.filename + ' (다운로드: ' + up.url + ')]\\n\\n[지시사항]\\n' +
          (message || '첨부파일을 확인해줘.');
      }
    }
  } catch (err) {
    cardChatSendBtn.disabled = false; cardChatSendBtn.textContent = '전송';
    alert('파일 업로드 실패: ' + err.message);
    return;
  }

  cardChatLog.innerHTML += '<div class="cchat-msg user"><div class="who">대표님</div>' + esc(message || '(첨부파일 전송)') +
    '<div>' + attachmentChip(attachmentName, attachmentUrl) + '</div></div>';
  cardChatLog.scrollTop = cardChatLog.scrollHeight;
  try {
    const res = await fetch('/chat/persona/' + currentCardTarget, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: finalMessage, persona: currentCardTarget, source: 'dashboard',
        image_base64: imageBase64 || null, image_mime: imageMime || null,
        attachment_name: attachmentName, attachment_url: attachmentUrl,
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      cardChatLog.innerHTML += '<div class="cchat-msg assistant" style="color:#f87171;">' + esc(err.detail || '응답 실패') + '</div>';
    } else {
      const data = await res.json();
      cardChatLog.innerHTML += '<div class="cchat-msg assistant"><div class="who">' + currentCardTarget + '</div>' + esc(data.response) + '</div>';
    }
  } catch (e) {
    cardChatLog.innerHTML += '<div class="cchat-msg assistant" style="color:#f87171;">전송 실패: ' + e.message + '</div>';
  }
  cardChatInput.value = '';
  cardChatSendBtn.disabled = false; cardChatSendBtn.textContent = '전송';
  cardChatLog.scrollTop = cardChatLog.scrollHeight;

  // 결재 대기 중이던 사안이 있으면, 지금 보낸 답장 내용으로 자동 결재 처리
  const toResolve = pendingDecisionsCache.filter(d => d.requested_by === currentCardTarget);
  for (const d of toResolve) {
    try {
      await fetch('/decisions/' + d.id + '/resolve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: message })
      });
    } catch (err) { /* ignore */ }
  }
  if (toResolve.length > 0) {
    cardChatLog.innerHTML += '<div class="cchat-msg assistant" style="color:#fbbf24; font-size:11px;">🖋 결재 ' + toResolve.length + '건이 이 답장으로 처리되었습니다.</div>';
    cardChatLog.scrollTop = cardChatLog.scrollHeight;
  }

  pollAttention(); pollStatusMap();
  await pollUnreadBadges();
  await renderRequestBlock(currentCardTarget);
});

cardChatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) cardChatSendBtn.click();
});

chart.addEventListener('click', (e) => {
  if (dragMoved) { dragMoved = false; return; }
  const cardEl = e.target.closest('.card.member, .card.coo');
  if (!cardEl) return;
  const name = cardEl.id.replace('card-', '');
  openCardChat(name);
});

document.addEventListener('click', (e) => {
  if (!cardChatPanel.contains(e.target) && !e.target.closest('.card.member, .card.coo')) {
    cardChatPanel.classList.remove('show');
  }
});

// ── 좌측 메뉴(모바일 드로어 + 그룹 아코디언) ─────────────────────
const sideMenuBtn = document.getElementById('sideMenuBtn');
const sideMenuOverlay = document.getElementById('sideMenuOverlay');
sideMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  document.body.classList.toggle('sidebar-open');
});
sideMenuOverlay.addEventListener('click', () => {
  document.body.classList.remove('sidebar-open');
});
document.querySelectorAll('.sm-grouptitle').forEach(gt => {
  gt.addEventListener('click', (e) => {
    e.stopPropagation();
    gt.classList.toggle('open');
    gt.nextElementSibling.classList.toggle('open');
  });
});
document.querySelectorAll('#sideMenu .sm-item').forEach(it => {
  it.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
});

// ── 모바일 Activity Stream 하단 드로어 ───────────────────────
const logMobileHandle = document.getElementById('logMobileHandle');
logMobileHandle.addEventListener('click', () => {
  document.getElementById('log').classList.toggle('expanded');
});

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
