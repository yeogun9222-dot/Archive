# Jake Orchestrator System — 설치 가이드

> Kade Yeo 이사님의 AI 팀 오케스트레이터 시스템
> 제이크(LangGraph) + PostgreSQL + OpenWebUI + 텔레그램 자동 보고

---

## 필요한 것 (사전 준비)

| 항목 | 확인 방법 |
|---|---|
| Docker Desktop | https://www.docker.com/products/docker-desktop 설치 |
| Anthropic API 키 | https://console.anthropic.com → API Keys |
| 텔레그램 봇 토큰 | @BotFather에서 발급 |
| 텔레그램 Chat ID | @userinfobot에서 확인 |

---

## Step 1 — Docker Desktop 설치 및 실행

1. https://www.docker.com/products/docker-desktop 접속
2. Windows용 다운로드 및 설치
3. 설치 후 Docker Desktop 실행 (시스템 트레이에 고래 아이콘 확인)

---

## Step 2 — GitHub에서 파일 받기

```bash
cd E:\
git clone https://github.com/yeogun9222-dot/Archive.git Claude
cd E:\Claude\jake-agent
```

---

## Step 3 — PostgreSQL DB 실행

```bash
docker run -d \
  --name jake-postgres \
  -e POSTGRES_DB=jakedb \
  -e POSTGRES_USER=jake \
  -e POSTGRES_PASSWORD=jake1234 \
  -p 5432:5432 \
  --restart always \
  postgres:16-alpine
```

**3초 후 스키마 생성:**

```bash
docker exec jake-postgres psql -U jake -d jakedb -c "
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  issued_by VARCHAR(50) DEFAULT 'kade',
  assigned_to VARCHAR(50),
  title TEXT,
  instruction TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  result TEXT,
  updated_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS conversation_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  agent VARCHAR(50),
  message TEXT,
  related_task_id INT REFERENCES tasks(id)
);"
```

---

## Step 4 — Jake 에이전트 빌드 및 실행

```bash
cd E:\Claude\jake-agent
docker build -t jake-agent .
```

```bash
docker run -d \
  --name jake-agent \
  -p 8000:8000 \
  --restart always \
  -e ANTHROPIC_API_KEY=여기에_API키_입력 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=jakedb \
  -e DB_USER=jake \
  -e DB_PASSWORD=jake1234 \
  -e TELEGRAM_BOT_TOKEN=여기에_봇토큰_입력 \
  -e TELEGRAM_CHAT_ID=여기에_ChatID_입력 \
  jake-agent
```

---

## Step 5 — OpenWebUI 실행

```bash
docker run -d \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

**설치 후:**
1. http://localhost:3000 접속
2. 관리자 계정 생성
3. 설정 → 연결 → OpenAI API → `+` 클릭
   - URL: `https://api.anthropic.com/v1`
   - API Key: Anthropic API 키
   - 헤더: `{"anthropic-version": "2023-06-01"}`
4. 저장

**제이크 모델 자동 생성:**

```bash
docker cp E:\Claude\jake-agent\fix_jake.py open-webui:/tmp/fix_jake.py
docker exec open-webui python3 /tmp/fix_jake.py
```

---

## Step 6 — 동작 확인

```bash
# Jake API 헬스체크
curl http://localhost:8000/health

# 제이크와 대화 테스트
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"제이크야, 오늘 할 일 정리해줘.\"}"
```

---

## 접속 주소 정리

| 서비스 | 주소 | 용도 |
|---|---|---|
| OpenWebUI | http://localhost:3000 | 채팅 인터페이스 |
| Jake API | http://localhost:8000 | 오케스트레이터 API |
| Jake API Docs | http://localhost:8000/docs | API 문서 |

---

## 컴퓨터 재부팅 후

모든 컨테이너가 `--restart always`로 설정되어 있어 **자동 재시작**됩니다.
Docker Desktop이 Windows 시작 시 자동 실행되도록 설정되어 있으면 완전 자동입니다.

재부팅 후 텔레그램으로 **"Jake Orchestrator 시작됨"** 알림이 오면 정상입니다.

---

## 문제 해결

```bash
# 컨테이너 상태 확인
docker ps

# Jake 로그 확인
docker logs jake-agent --tail 20

# DB 작업 목록 확인
docker exec jake-postgres psql -U jake -d jakedb -c "SELECT * FROM tasks ORDER BY id DESC LIMIT 10;"
```
