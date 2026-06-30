---
name: AI 인프라 현황
description: jake-agent Docker 구조, 연결 현황, 페르소나 시스템, 자동화 설정
type: project
originSessionId: 965095a5-1ca1-4a02-918a-f7165a79f962
---
## 실행 중인 컨테이너 (GCP 서버 기준)

- jake-agent (포트 8000) — FastAPI + LangGraph, Claude Sonnet 4.6 통일
- jake-postgres (포트 5432) — PostgreSQL DB (볼륨 영구 보존)
- open-webui (포트 3000) — OpenAI 호환 API로 jake-agent 연결 완료

## jake-agent 내부 모듈

graph.py(LangGraph ReAct), personas.py(18인 페르소나 — 11본부장/CFO/보안본부장 + 사라·노바 팀장 + 노아·엠마·조이·테오 매니저급, CLAUDE.md 섹션5와 2026-06-30 동기화 완료),
db.py(DB), telegram.py+telegram_bot.py(텔레그램 양방향), notion_tools.py, google_tools.py(Docs/Sheets/Slides/Gmail/Calendar),
team_tools.py(delegate_task/discuss_with/consult_team/request_ceo_decision),
analyzer.py, monitor.py, web_tools.py, tools_external.py, gcp_billing.py, anthropic_billing.py 등

## ALPHA SQUAD 대시보드 (2026-06-28 전면 구축, 같은 jake-agent 서버가 서빙)

- URL: `http://34.47.74.42:8000/dashboard` (단일 파일 `jake_agent/dashboard_html.py`)
- 좌측 사이드 메뉴(업무/기록·분석/안내 하위드롭다운) + 모바일 완전 반응형(슬라이드 드로어, 전체폭 모달)
- 중앙 조직도: 마우스 드래그/휠, 손가락 드래그/핀치로 패닝·줌
- 카드 클릭 → 1:1 채팅 패널(📎 파일 첨부 가능 — 이미지는 비전 입력, 텍스트류는 본문 추출해 페르소나에게 전달, `/uploads` 영속 저장)
- "결재" 워크플로(구 의사결정): `request_ceo_decision` → `decision_log` pending → 카드챗 답장으로 자동 처리
- 비용 패널: Anthropic 토큰 추정치 + GCP BigQuery 실사용량 자동집계(검증됨) + 수동입력(정기/원화)
- **Anthropic 실청구 자동집계는 보류 중** — 현 계정이 Individual Org(API 플랜)라 Admin API 키 발급 UI 자체가 없음. 코드는 작성 완료, Team 플랜 전환 시 `.env`에 키만 추가하면 활성화
- jake-mcp(Node.js MCP 서버, `E:\Claude\jake-mcp`) + Claude Code 슬래시 명령어(`/제이크` 등 14인+단체방)로 이 채팅방에서도 직접 대화 가능
- **모바일 대시보드로 페르소나에게 지시 가능한 것**: 위임/협업/결재/해임재고용/비용조회 등 운영 전반. **불가능한 것**: 코드 수정·git push·서버 배포 (Claude Code 세션이 PC에서 켜져 있어야 함, SSH로 GCP 배포 명령 실행하는 것도 항상 대표님이 직접 함 — Claude Code도 SSH 직접 접속 도구 없음)

## 페르소나 시스템

- 소환어로 14인 팀원 전환 (detect_persona)
- 1:1 개인 Telegram 채팅: "렉스야", "루나야" 등 소환어로 개별 팀원 직접 호출 가능
- 응답 앞에 [렉스], [루나] 등 페르소나 표시 (비제이크 팀원 한정)
- Jake는 1:1 채팅에서 타 팀원 흉내 금지, consult_team 사용 금지
- consult_team은 그룹 채팅 ([그룹 채팅 응답] 태그) 에서만 동작

## Telegram 봇 구조

- 개인 1:1 채팅 (TELEGRAM_CHAT_ID): 대표님 전용, 전체 기능
- 그룹 채팅 (TELEGRAM_RESPONSE_GROUP_IDS): "제이크"/"jake" 호출 시 응답
- 모니터링 그룹 (TELEGRAM_GROUP_IDS): 조용히 버퍼링, 긴급 키워드 시 알림

## 자동화 설정

- E:\Claude\gcp_ssh_open.vbs: 컴퓨터 켜지면 30초 후 브라우저로 GCP SSH 페이지 자동 열기
- 시작 프로그램 등록 완료 (GCP Jake Server SSH.lnk)

## 보류된 향후 과제 — "코드 자동화 에이전트(Code-Ops Agent)"

- 대시보드 지시로 실제 소스코드 수정/git push/서버 배포까지 자동 수행하는 별도 에이전트(가칭: 오토코더/Code-Ops Agent) — 2026-06-29 대표님이 명명, 검토 및 보류 결정
- **Why:** 지금의 Claude Code 세션은 로컬 PC에서 사람이 매번 승인하며 쓰는 구조라 서버에 올려 무인 자동화하기엔 위험(권한 분리/롤백 장치 없이 자동 커밋·배포). 지금은 당장 필요 없어 우선순위 낮춤.
- **How to apply:** "오토코더" 또는 "코드 자동화 에이전트" 언급 시 이 보류 항목을 가리키는 것. 실제 구축 착수 시 Claude Agent SDK로 별도 권한 분리된 시스템으로 새로 설계해야 함 — 기존 jake-agent(대화형 페르소나)와는 분리.

## Notion 설정집

- 기술 설정집 (19섹션, 18=대시보드 UI/19=오케스트레이션 백엔드 메커니즘 포함): https://app.notion.com/p/Jake-AI-38b8ff3d7df281d38577ece1c9532b15
- 쉬운 설치 가이드 (초보자용): https://app.notion.com/p/38b8ff3d7df281859b02cbcf0007ca0b
