---
name: ""
metadata: 
  node_type: memory
  originSessionId: 965095a5-1ca1-4a02-918a-f7165a79f962
---

대표님이 현재 Claude Code 채팅방을 "JAKE Brain"으로 명명하고, 역할을 명확히 분리함 (2026-06-27 확정).

- **JAKE Brain (이 채팅방, Claude Code 자체)**: 전체 시스템 컨트롤·DB 관리 총책임자. Alpha Squad 14인에게 문제·오류·중대한 버그 수정·코드 변경이 필요할 때 사용.
- **`/제이크` (jake-agent COO 페르소나, MCP `ask_persona` 도구로 호출)**: 일반적인 일상 업무. Alpha Squad 14인과 함께 쓰는 COO 채팅방.

**Why:** 회사 조직처럼 "개발/인프라 총괄(Brain)"과 "일상 운영(COO 페르소나)"을 구분해서 혼선을 줄이려는 목적. JAKE Brain은 jake-agent/jake-vscode/jake-mcp 코드베이스를 직접 다루는 주체이고, "/제이크"는 jake-agent 백엔드 안에서 동작하는 캐릭터일 뿐 코드를 고치지 못함.

**How to apply:** 대표님이 코드 수정, 버그 수정, 시스템 설정 변경을 요청하면 이 방(JAKE Brain)에서 직접 처리. 일반 업무 질문("오늘 일정", "마케팅 전략 의견" 등)은 알파스쿼드 세션의 `/제이크` 또는 해당 페르소나로 안내. 관련: [[project_infra]], [[project_cloud]]
