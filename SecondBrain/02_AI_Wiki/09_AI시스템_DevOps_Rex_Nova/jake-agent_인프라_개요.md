#AI시스템 #인프라 #SOP

# jake-agent 인프라 개요

## 구조
```
[VSCode Claude Code / Telegram / Open WebUI]
        ↓
[jake-agent FastAPI (8000)] — GCP 34.47.74.42
        ↓
[LangGraph ReAct 엔진] → 페르소나별 도구 자동 선택
        ↓
[PostgreSQL (jake-postgres)] — conversation_log, chat_messages, tasks
```

## 신규 연동 (2026-06-27)
- **jake-mcp**: Node.js MCP 서버. Claude Code에서 14인과 직접 대화 (`ask_persona`, `ask_alpha_squad`, `delegate_task`)
- **슬래시 명령어**: `.claude/commands/*.md` — `/제이크` ~ `/노바`, `/알파스쿼드`(단체방)
- **jake-vscode**: ALPHA SQUAD 사이드바 → 클릭 시 Claude Code 네이티브 탭 자동 오픈

## 배포 절차
```bash
cd ~/Archive/jake-agent && git pull && docker compose build jake-agent && docker compose up -d jake-agent
```

## 해결된 주요 버그
- Docker 소켓 URL 오타 (`unix://` → `unix:///`)
- 페르소나 히스토리 로드 버그 (`history[:-0]`가 항상 빈 리스트 반환)
- `tasks` 테이블 컬럼 누락 (`result`, `updated_at`) — 마이그레이션으로 해결
- 위임 도구(`delegate_task`)가 제이크 전용이었던 문제 → 14인 전체에 부여

> 출처: [[../12_운영_COO_Jake/AlphaSquad_MCP_연동]], 노션 "Jake AI 조직 시스템 구축 설정집" 섹션 16
