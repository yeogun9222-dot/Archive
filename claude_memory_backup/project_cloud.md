---
name: 클라우드 서버 인프라
description: GCP VM 서버 정보 및 배포 절차, 접속 방법
type: project
originSessionId: 965095a5-1ca1-4a02-918a-f7165a79f962
---
## GCP 서버 정보

- **프로젝트 ID:** rugged-reality-500602-d7
- **VM 이름:** jake-server
- **외부 IP:** 34.47.74.42
- **리전/영역:** asia-northeast3-a (서울)
- **머신 유형:** e2-medium (2vCPU, 4GB RAM)
- **OS:** Ubuntu 22.04 LTS
- **디스크:** 30GB
- **SSH 사용자:** kadeyeo0917

## 접속 방법

GCP Console → Compute Engine → VM 인스턴스 → jake-server → SSH 버튼 클릭 (브라우저 터미널)

## 실행 중인 컨테이너

- jake-agent (포트 8000) — FastAPI + LangGraph
- jake-postgres (포트 5432) — PostgreSQL DB
- open-webui (포트 3000) — 채팅 UI

## 코드 위치

서버 내 경로: `~/Archive/jake-agent`

## 배포 절차 (코드 수정 후)

**Why:** 클라우드 서버는 GitHub 경유로만 코드 동기화 가능

**Step 1 — 로컬 PC (VS Code 터미널):**
```powershell
$env:PATH += ";C:\Program Files\Git\bin"
cd E:\Claude
git add jake-agent/
git commit -m "수정 내용"
git push origin main
```

**Step 2 — GCP SSH 터미널:**
```bash
cd ~/Archive/jake-agent
git pull
docker compose up -d --build
```

## DB 스키마 (jake-postgres)

테이블 다수(conversation_log, tasks, token_usage, chat_messages, decision_log, manual_costs,
persona_activity, projects 등) — 계속 늘어나는 중이라 정확한 스키마는 `jake_agent/db.py`의
`init_db()`를 직접 확인할 것 (이 메모에 매번 최신화하지 않음)

## 방화벽 규칙

- jake-ports: TCP 8000, 3000 허용 (0.0.0.0/0)
- HTTP/HTTPS: 기본 허용

## 로컬 PC 상태

로컬 Docker 컨테이너 중지됨 (클라우드로 이전 완료)
로컬에서 `docker compose down` 실행 완료

## 비용

- GCP 크레딧 잔액: ₩453,006 (2026-07-15 만료)
- 만료 후 예상 비용: 약 ₩38,000~40,000/월
