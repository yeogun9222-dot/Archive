#!/usr/bin/env bash
set -euo pipefail

# Longrise FastAPI Server Restart Script
# FastAPI + SQLModel + PostgreSQL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FASTAPI_DIR="$SCRIPT_DIR/lr_fastapi"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/fastapi.log"
PID_FILE="$LOG_DIR/fastapi.pid"

# 기본 설정
DEFAULT_PORT=8000
DEFAULT_HOST="0.0.0.0"

# 백그라운드 모드 설정
BF_MODE=0
RELOAD_DEPS=0
WITH_MIGRATION=0

while [[ $# -gt 0 ]]; do
    case $1 in
        --bf)
            BF_MODE=1
            shift
            ;;
        --reload-deps)
            RELOAD_DEPS=1
            shift
            ;;
        --with-migration)
            WITH_MIGRATION=1
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# 로그 디렉터리 생성
mkdir -p "$LOG_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [FASTAPI] $1" | tee -a "$LOG_FILE"
}

kill_existing() {
    log "🔍 기존 FastAPI 프로세스 확인 중..."

    # PID 파일에서 기존 프로세스 종료
    if [ -f "$PID_FILE" ]; then
        local OLD_PID=$(cat "$PID_FILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            log "🚫 기존 프로세스 종료 중 (PID: $OLD_PID)"
            kill -TERM "$OLD_PID" 2>/dev/null || true
            sleep 2
            kill -KILL "$OLD_PID" 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
    fi

    # 포트 기반 프로세스 종료
    local PIDS=$(lsof -ti ":$DEFAULT_PORT" 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        log "🚫 포트 $DEFAULT_PORT 사용 프로세스 종료 중..."
        echo "$PIDS" | xargs -r kill -TERM 2>/dev/null || true
        sleep 2
        echo "$PIDS" | xargs -r kill -KILL 2>/dev/null || true
    fi
}

check_dependencies() {
    log "🔧 의존성 확인 중..."

    cd "$FASTAPI_DIR"

    # UV 설치 확인
    if ! command -v uv &> /dev/null; then
        log "❌ UV가 설치되지 않았습니다. 설치해주세요."
        log "   curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi

    # Python 가상환경 및 의존성 확인/설치
    if [ $RELOAD_DEPS -eq 1 ]; then
        log "📦 의존성 재설치 중..."
        uv sync --dev
    else
        log "📦 의존성 확인 중..."
        uv sync
    fi
}

check_database() {
    log "🗄️ AWS RDS 데이터베이스 연결 확인 중..."

    cd "$FASTAPI_DIR"

    # asyncpg로 실제 DB 연결 + SELECT 1 검증 (.env.local의 DATABASE_URL 사용)
    local attempts=0
    local max_attempts=3
    local check_output

    while [ $attempts -lt $max_attempts ]; do
        check_output=$(uv run --no-sync python - <<'PYEOF' 2>&1
import asyncio
import os
import sys
from pathlib import Path

env_file = Path(".env.local")
if not env_file.exists():
    print("ENV_MISSING: .env.local not found", file=sys.stderr)
    sys.exit(2)

database_url = None
for line in env_file.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, _, value = line.partition("=")
    if key.strip() == "DATABASE_URL":
        database_url = value.strip().strip('"').strip("'")
        break

if not database_url:
    print("ENV_MISSING: DATABASE_URL not set in .env.local", file=sys.stderr)
    sys.exit(2)

dsn = database_url.replace("postgresql+asyncpg://", "postgresql://", 1)

async def main():
    import asyncpg
    conn = await asyncio.wait_for(asyncpg.connect(dsn), timeout=5.0)
    try:
        result = await conn.fetchval("SELECT 1")
        if result != 1:
            print(f"UNEXPECTED_RESULT: {result}", file=sys.stderr)
            sys.exit(3)
    finally:
        await conn.close()

asyncio.run(main())
print("OK")
PYEOF
)
        local rc=$?
        if [ $rc -eq 0 ]; then
            log "✅ AWS RDS 데이터베이스 연결 확인됨 (asyncpg SELECT 1 OK)"
            return 0
        fi

        attempts=$((attempts + 1))
        if [ $attempts -lt $max_attempts ]; then
            log "⏳ AWS RDS 연결 재시도 중... ($attempts/$max_attempts) — ${check_output##*$'\n'}"
            sleep 2
        fi
    done

    log "❌ AWS RDS 데이터베이스 연결 실패!"
    log "   세부 오류: ${check_output}"
    log "   보안 그룹/자격증명/네트워크 설정을 확인해주세요."
    exit 1
}

run_migrations() {
    if [ $WITH_MIGRATION -eq 1 ]; then
        log "📊 데이터베이스 마이그레이션 실행 중..."
        cd "$FASTAPI_DIR"
        uv run alembic upgrade head
        log "✅ 마이그레이션 완료"
    fi
}

run_fastapi() {
    log "🚀 Longrise FastAPI 서버 재시작 시작..."

    # 기존 프로세스 종료
    kill_existing

    # 의존성 확인
    check_dependencies

    # 데이터베이스 확인
    check_database

    # 마이그레이션 실행
    run_migrations

    # FastAPI 디렉터리로 이동
    cd "$FASTAPI_DIR"

    # 환경 변수 확인
    if [ ! -f ".env.local" ]; then
        log "⚠️  .env.local 파일이 없습니다."
        exit 1
    fi

    log "🌐 FastAPI 서버 시작..."
    log "   - Host: $DEFAULT_HOST"
    log "   - Port: $DEFAULT_PORT"
    log "   - Environment: development"
    log "   - Docs URL: http://localhost:$DEFAULT_PORT/api/v1/docs"

    if [ $BF_MODE -eq 1 ]; then
        # 백그라운드 실행
        if command -v pm2 &> /dev/null; then
            cd "$SCRIPT_DIR"
            pm2 delete longrise-fastapi >/dev/null 2>&1 || true
            pm2 start "$SCRIPT_DIR/ecosystem.config.cjs" --only longrise-fastapi --update-env >/dev/null
            local PID
            PID=$(pm2 pid longrise-fastapi)
        else
            cd "$FASTAPI_DIR"
            nohup uv run python main.py > "$LOG_FILE" 2>&1 < /dev/null &
            local PID=$!
        fi
        echo $PID > "$PID_FILE"
        log "✅ FastAPI 서버가 백그라운드에서 시작됨 (PID: $PID)"
        log "📄 로그 확인: tail -f $LOG_FILE"

        # 서버 시작 대기
        sleep 3
        if [ "$PID" != "0" ] && kill -0 "$PID" 2>/dev/null; then
            log "🎉 FastAPI 서버 시작 완료!"
        else
            log "❌ FastAPI 서버 시작 실패!"
            exit 1
        fi
    else
        # 포그라운드 실행
        uv run python main.py
    fi
}

main() {
    run_fastapi
}

# Cleanup trap
cleanup() {
    log "🧹 정리 작업 수행 중..."
}

trap cleanup EXIT

# 실행
main
