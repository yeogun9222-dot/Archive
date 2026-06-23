---
name: service-restart
description: Longrise 프로젝트 서비스 재시작 관리 (반드시 restart-*.sh --bf 사용). 직접 npm run dev, uvicorn 등의 명령어를 금지하고, 전용 스크립트를 통한 백그라운드 실행을 강제합니다.
argument-hint: [service-name] [--bf|--fg]
allowed-tools: Bash, Read
user-invocable: true
---

# Service Restart Skill

## 🚨 CRITICAL RULES
- **직접 실행 금지**: `npm run dev`, `uvicorn`, `vite` 등을 절대 직접 호출하지 마십시오.
- **전용 스크립트 강제**: 반드시 루트의 `restart-*.sh` 스크립트를 사용합니다.
- **백그라운드 필수**: 모든 실행 시 `--bf` 플래그를 접미사로 붙입니다.
- **재시작 원리**: 각 스크립트는 내부적으로 **기존 프로세스 종료 → 새 프로세스 시작** 순서로 동작합니다.

## 🛠 실행 워크플로우
1. **사전 확인**: 데이터베이스 상태 확인 (`docker ps | grep longrise`)
2. **명령어 실행**: `./restart-[서비스명].sh --bf`
3. **사후 검증**: `./cli-monitor-longrise.sh` 또는 `./logs/[서비스명].log` 내용 확인

## 📋 Longrise 웹 서비스 재시작 스크립트 (프로젝트 루트)

### 개별 서비스 재시작
| 서비스 | 포트 | 실행 명령어 (항상 --bf 포함) | 위치 |
| :--- | :---: | :--- | :--- |
| FastAPI Server | 8000 | `./restart-fastapi.sh --bf` | 프로젝트 루트 |
| User Frontend | 5173 | `./restart-user-frontend.sh --bf` | 프로젝트 루트 |
| Admin Frontend | 5174 | `./restart-admin-frontend.sh --bf` | 프로젝트 루트 |
| PostgreSQL Database | 5432 | `./restart-database.sh --bf` | 프로젝트 루트 |

### 전체 서비스 관리
| 명령어 | 용도 | 위치 |
| :--- | :--- | :--- |
| `./restart-all-services.sh --bf` | 모든 웹 서비스 일괄 재시작 | 프로젝트 루트 |
| `./stop-all-services.sh` | 모든 웹 서비스 일괄 종료 | 프로젝트 루트 |
| `./cli-monitor-longrise.sh` | 전체 서비스 상태 모니터링 | 프로젝트 루트 |

## 🐳 Docker 기반 데이터베이스 관리

### 데이터베이스 서비스 확인
```bash
# PostgreSQL 컨테이너 상태 확인
docker ps | grep longrise_postgres

# 데이터베이스 로그 확인
docker logs longrise_postgres

# 데이터베이스 재시작
./restart-database.sh --bf
```

### 데이터베이스 의존성 확인
FastAPI 서버는 PostgreSQL 데이터베이스에 의존하므로:
1. 먼저 데이터베이스가 실행 중인지 확인
2. 데이터베이스가 정상 응답하는지 확인
3. 그 후 FastAPI 서버 재시작

## 💻 FastAPI 서버 특별 고려사항

### 개발 서버 관리
```bash
# FastAPI 개발 서버 재시작
./restart-fastapi.sh --bf

# 의존성 업데이트 후 재시작
./restart-fastapi.sh --bf --reload-deps

# 데이터베이스 마이그레이션 후 재시작
./restart-fastapi.sh --bf --with-migration
```

### 환경 변수 확인
FastAPI 서버 실행 전 다음 환경 변수들이 설정되어야 함:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `SECRET_KEY`: JWT 토큰 시크릿
- `ENVIRONMENT`: 개발/프로덕션 환경 구분

## 🎯 일반적인 재시작 시나리오

### 개발 중 코드 변경 후
```bash
# 백엔드 코드 변경 시
./restart-fastapi.sh --bf

# 프론트엔드 코드 변경 시
./restart-user-frontend.sh --bf

# 전체 스택 재시작
./restart-all-services.sh --bf
```

### 포트 충돌 해결
```bash
# 포트 5173 충돌 시
lsof -ti :5173 | xargs kill -9
./restart-user-frontend.sh --bf

# 포트 8000 충돌 시
lsof -ti :8000 | xargs kill -9
./restart-fastapi.sh --bf
```

### 의존성/환경 변경 후
```bash
# Python 의존성 변경 후
cd lr_fastapi && uv sync
cd .. && ./restart-fastapi.sh --bf

# Node.js 의존성 변경 후
cd lr_user-frontend && npm install
cd .. && ./restart-user-frontend.sh --bf
```

## 💡 주요 예시 (Longrise 특화)
- **요청**: "유저 프론트엔드 재시작해줘" → **실행**: `./restart-user-frontend.sh --bf`
- **요청**: "API 서버 재시작" → **실행**: `./restart-fastapi.sh --bf`
- **요청**: "데이터베이스 재시작" → **실행**: `./restart-database.sh --bf`
- **요청**: "포트 8000 충돌나" → **실행**: `lsof -ti :8000 | xargs kill -9` 후 `./restart-fastapi.sh --bf`
- **요청**: "전체 서비스 재시작" → **실행**: `./restart-all-services.sh --bf`
- **요청**: "관리자 페이지 안 열려" → **실행**: `./restart-admin-frontend.sh --bf`

## ⚠️ 주의사항
1. **데이터베이스 우선**: 웹 서비스 재시작 전 반드시 데이터베이스 상태 확인
2. **--bf 필수**: 없으면 터미널이 무한 대기 상태로 블록됨
3. **환경 변수 확인**: 서비스별 필요한 환경 변수 설정 확인
4. **포트 충돌**: 동일 포트 사용 시 기존 프로세스 종료 필수
5. **로그 모니터링**: 재시작 후 `./cli-monitor-longrise.sh`로 상태 확인

## 🔍 트러블슈팅
- **데이터베이스 연결 실패**: PostgreSQL 컨테이너 상태 및 포트 확인
- **환경 변수 오류**: `.env.local` 파일 존재 및 내용 확인
- **포트 점유**: `lsof -i :[포트번호]`로 점유 프로세스 확인
- **의존성 오류**: `uv sync` 또는 `npm install` 실행 후 재시작