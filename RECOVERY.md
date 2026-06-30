# 새 PC 완전 복구 가이드

> PC/노트북을 분실하거나 고장났을 때, 새 PC에서 이 문서 하나로 AI 조직 인프라(Docker jake-agent + GCP 서버)를
> 동일하게 재구축하기 위한 가이드. 대표님이 직접 따라할 수 있도록 명령어를 그대로 복사해서 쓸 수 있게 작성함.

---

## 0. 가장 먼저 알아야 할 것

**GCP 클라우드 서버(jake-server)는 이 PC와 완전히 독립적으로 24시간 돌아가고 있다.**
즉 PC를 잃어버려도 서버 자체(jake-agent, DB, 모든 대화 기록·채용된 페르소나 데이터)는 살아있다.
이 가이드는 두 가지 경우를 모두 다룬다:

- **A. GCP 서버는 살아있고, 새 PC에서 control(Claude Code 작업 환경)만 다시 잡는 경우** → 1~4번만 하면 됨
- **B. GCP 서버까지 통째로 사라진 최악의 경우** → 1~4번 + 6-B번까지 진행

API 키는 전부 재발급 가능하므로 미리 백업할 필요 없음. **반드시 챙겨야 할 것은 이 git 저장소 자체뿐.**

---

## 1. 새 PC에 설치할 것

1. **Git for Windows** — https://git-scm.com/download/win
2. **Docker Desktop** (로컬에서 jake-agent를 돌려볼 경우에만 필요, GCP 서버만 쓸 거면 생략 가능) — https://www.docker.com/products/docker-desktop/
3. **Node.js** (Claude Code 설치 전제 조건) — https://nodejs.org (LTS 버전)
4. **Claude Code** — 공식 설치 가이드 https://claude.com/claude-code 참고 (보통 `npm install -g @anthropic-ai/claude-code`)

---

## 2. 저장소 복원

USB에서 복사하든 GitHub에서 새로 받든, **반드시 `E:\Claude` 경로**로 맞춘다 (Claude Code의 메모리 시스템이 작업 경로 기준으로 식별되기 때문).

```powershell
# USB에서 복사한 경우: USB의 Claude 폴더를 E:\Claude 로 그대로 복사하면 끝.

# 또는 GitHub에서 새로 받는 경우:
git clone https://github.com/yeogun9222-dot/Archive.git "E:\Claude"
```

---

## 3. AI 메모리 파일 복원 (중요 — 잊으면 Claude Code가 과거 맥락을 모름)

이 저장소 안의 `E:\Claude\claude_memory_backup\` 폴더에는 AI가 그동안 쌓아온 조직 구조·인프라 현황·작업 맥락 메모리가
백업되어 있다 (원본은 평소 `C:\Users\<사용자명>\.claude\projects\e--Claude\memory\` 에 PC 로컬로만 저장됨).

새 PC에서 아래 명령으로 원래 위치에 복원한다:

```powershell
New-Item -ItemType Directory -Force "C:\Users\$env:USERNAME\.claude\projects\e--Claude\memory"
Copy-Item "E:\Claude\claude_memory_backup\*" "C:\Users\$env:USERNAME\.claude\projects\e--Claude\memory\" -Force
```

> 이후 평소처럼 작업하다 보면 이 백업 폴더가 다시 최신 메모리와 어긋날 수 있다.
> Jake COO는 메모리에 큰 변화가 생기면(조직 개편, 인프라 변경 등) `claude_memory_backup/`도 같이 갱신해서 커밋해야 한다.

---

## 4. Claude Code 실행 확인

```powershell
cd E:\Claude
claude
```

실행 후 `CLAUDE.md`가 자동 로드되고, 메모리 인덱스(`MEMORY.md`)에 적힌 항목들을 불러올 수 있으면 정상.

---

## 5. API 키 재발급 (.env 작성)

```powershell
cd E:\Claude\jake-agent
Copy-Item .env.example .env
notepad .env
```

`.env.example` 파일 안에 **각 키마다 어디서 발급받는지 전부 주석으로 적혀있다.** 그대로 따라가며 값을 채운다.
필수 항목은 `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTION_API_KEY`/`NOTION_ARCHITECTS_KEY`/`NOTION_GUIDE_KEY`, `GITHUB_TOKEN` 6종이고 나머지는 선택.

---

## 6-A. GCP 서버가 살아있는 경우 (가장 흔한 케이스)

새 PC에서는 코드 수정 → git push만 하면 되고, 서버는 그대로 GCP 콘솔에서 SSH로 접속해 운영한다.

```
GCP Console (console.cloud.google.com, Kade YEO 계정 로그인)
→ Compute Engine → VM 인스턴스 → jake-server → SSH 버튼 클릭 (브라우저 터미널 열림)
```

코드를 수정했다면 배포 절차:

```powershell
# 로컬 PC
cd E:\Claude
git add jake-agent/
git commit -m "수정 내용"
git push origin main
```

```bash
# GCP SSH 터미널
cd ~/Archive/jake-agent
git pull
docker compose up -d --build
```

---

## 6-B. GCP VM 자체도 사라진 경우 (처음부터 재구축)

### 6-B-1. GCP 프로젝트/VM 생성

```
GCP Console → 새 프로젝트 생성 (기존 프로젝트 rugged-reality-500602-d7 가 살아있으면 그대로 사용)
→ Compute Engine → VM 인스턴스 만들기
  - 이름: jake-server
  - 리전: asia-northeast3 (서울) / 영역: asia-northeast3-a
  - 머신 유형: e2-medium (2vCPU, 4GB RAM)
  - 부팅 디스크: Ubuntu 22.04 LTS, 30GB
  - 방화벽: HTTP/HTTPS 트래픽 허용 체크
```

### 6-B-2. 방화벽 규칙 추가 (jake-agent/open-webui 포트 열기)

```
VPC 네트워크 → 방화벽 → 규칙 만들기
  - 이름: jake-ports
  - 대상: 모든 인스턴스 (또는 jake-server 태그)
  - 소스 IP 범위: 0.0.0.0/0
  - 프로토콜/포트: TCP 8000, 3000
```

### 6-B-3. SSH 접속 후 Docker 설치

```bash
# GCP Console → VM 인스턴스 → jake-server → SSH 버튼으로 접속
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
exit
# 다시 SSH 재접속 (그룹 권한 적용을 위해)
```

### 6-B-4. 저장소 clone 및 환경변수 설정

```bash
git clone https://github.com/yeogun9222-dot/Archive.git ~/Archive
cd ~/Archive/jake-agent
cp .env.example .env
nano .env   # 5번에서 발급받은 값 채우기 (로컬 PC에서 채운 .env를 scp로 옮겨도 됨)
```

### 6-B-5. docker-compose가 요구하는 external network/volume 미리 생성

> `docker-compose.yml`이 `jake-network`(네트워크)와 `open-webui`(볼륨)를 **external: true**로 참조하고 있어서,
> 미리 만들어두지 않으면 `docker compose up` 시점에 에러가 난다. **이 단계를 누락하면 안 됨.**

```bash
docker network create jake-network
docker volume create open-webui
```

### 6-B-6. 컨테이너 실행

```bash
docker compose up -d --build
```

### 6-B-7. 자동 SSH 페이지 오픈 스크립트 (선택, 로컬 PC용)

부팅 시 GCP SSH 페이지를 자동으로 열어주는 `E:\Claude\gcp_ssh_open.vbs`를 시작 프로그램에 등록해두면 편하다
(시작프로그램 폴더: `Win+R` → `shell:startup` → 바로가기 생성).

---

## 7. 검증 체크리스트

- [ ] `http://<서버 외부 IP>:8000/dashboard` 접속 시 ALPHA SQUAD 대시보드가 뜨는지
- [ ] `http://<서버 외부 IP>:3000` (open-webui) 접속 및 jake-agent 모델 응답 확인
- [ ] 텔레그램 봇에게 메시지 보내서 정상 응답 오는지
- [ ] Claude Code(`E:\Claude`에서 `claude` 실행)에서 `/제이크` 등 슬래시 명령어로 페르소나 호출 정상 동작하는지
- [ ] `claude_memory_backup/` 내용이 `C:\Users\<사용자명>\.claude\projects\e--Claude\memory\` 에 잘 복원되어, 새 세션에서도 과거 맥락(조직 구조·인프라 현황)을 알고 있는지

---

## 8. USB 백업 시 챙길 것 (요약)

**`E:\Claude` 폴더 전체 하나만 USB에 복사하면 된다.** (git 저장소이고, `claude_memory_backup/`도 그 안에 포함되어 있음)

API 키 실제 값은 git에 올라가지 않으므로(`.env`는 `.gitignore` 처리됨) USB 백업과 무관하게 분실 시 재발급하면 된다.
단, 시간을 아끼고 싶다면 `.env` 파일만 별도로 (예: 1Password, 또는 USB의 암호화된 폴더에) 추가로 백업해두는 것을 권장.
