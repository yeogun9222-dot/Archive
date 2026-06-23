#!/usr/bin/env bash
set -euo pipefail

# Longrise User Frontend Restart Script
# React + TypeScript + Vite

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/lr_user-frontend"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/user-frontend.log"
PID_FILE="$LOG_DIR/user-frontend.pid"

# 기본 설정
DEFAULT_PORT=5173
DEFAULT_HOST="0.0.0.0"

# 백그라운드 모드 설정
BF_MODE=0
if [[ "${1:-}" == "--bf" ]]; then
    BF_MODE=1
fi

# 로그 디렉터리 생성
mkdir -p "$LOG_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [USER-FRONTEND] $1" | tee -a "$LOG_FILE"
}

kill_existing() {
    log "🔍 기존 User Frontend 프로세스 확인 중..."

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

    cd "$FRONTEND_DIR"

    # Node.js 확인
    if ! command -v node &> /dev/null; then
        log "❌ Node.js가 설치되지 않았습니다."
        exit 1
    fi

    # npm 확인
    if ! command -v npm &> /dev/null; then
        log "❌ npm이 설치되지 않았습니다."
        exit 1
    fi

    # package.json 확인
    if [ ! -f "package.json" ]; then
        log "❌ package.json 파일이 없습니다."
        exit 1
    fi

    # node_modules 확인 및 설치
    if [ ! -d "node_modules" ]; then
        log "📦 의존성 설치 중..."
        npm install
    else
        log "📦 의존성 확인됨"
    fi
}

check_backend() {
    log "🔗 백엔드 서버 연결 확인 중..."

    # FastAPI 서버 상태 확인
    local API_URL="http://localhost:8000/health"
    if ! curl -s "$API_URL" >/dev/null 2>&1; then
        log "⚠️  백엔드 서버(FastAPI)가 실행되지 않았습니다."
        log "   백엔드 서버를 먼저 시작해주세요: ./restart-fastapi.sh --bf"
        log "   또는 API_URL을 확인해주세요: $API_URL"
        # 경고만 표시하고 계속 진행 (프론트엔드는 독립적으로 실행 가능)
    else
        log "✅ 백엔드 서버 연결 확인됨"
    fi
}

clean_vite_cache() {
    cd "$FRONTEND_DIR"

    if [ -d "node_modules/.vite" ]; then
        log "🧹 Vite dependency optimizer 캐시 정리 중..."
        rm -rf "node_modules/.vite"
    fi
}

run_frontend() {
    log "🚀 Longrise User Frontend 재시작 시작..."

    # 기존 프로세스 종료
    kill_existing

    # 의존성 확인
    check_dependencies

    # Vite dependency optimizer 캐시 정리
    clean_vite_cache

    # 백엔드 연결 확인
    check_backend

    # Frontend 디렉터리로 이동
    cd "$FRONTEND_DIR"

    # 환경 변수 확인
    if [ ! -f ".env.local" ]; then
        log "⚠️  .env.local 파일이 없습니다."
        log "   기본 설정으로 계속 진행..."
    fi

    log "🌐 User Frontend 시작..."
    log "   - Host: $DEFAULT_HOST"
    log "   - Port: $DEFAULT_PORT"
    log "   - Environment: development"
    log "   - URL: http://localhost:$DEFAULT_PORT"
    log "   - API Endpoint: http://localhost:8000/api/v1"

    if [ $BF_MODE -eq 1 ]; then
        # 백그라운드 실행
        if command -v pm2 &> /dev/null; then
            cd "$SCRIPT_DIR"
            pm2 delete longrise-user-frontend >/dev/null 2>&1 || true
            pm2 start "$SCRIPT_DIR/ecosystem.config.cjs" --only longrise-user-frontend --update-env >/dev/null
            local PID
            PID=$(pm2 pid longrise-user-frontend)
        else
            cd "$FRONTEND_DIR"
            nohup npm run dev > "$LOG_FILE" 2>&1 < /dev/null &
            local PID=$!
        fi
        echo $PID > "$PID_FILE"
        log "✅ User Frontend가 백그라운드에서 시작됨 (PID: $PID)"
        log "📄 로그 확인: tail -f $LOG_FILE"

        # 서버 시작 대기
        sleep 5
        if [ "$PID" != "0" ] && kill -0 "$PID" 2>/dev/null; then
            log "🎉 User Frontend 시작 완료!"
            log "🌐 접속 URL: http://localhost:$DEFAULT_PORT"
        else
            log "❌ User Frontend 시작 실패!"
            exit 1
        fi
    else
        # 포그라운드 실행
        npm run dev
    fi
}

main() {
    run_frontend
}

# Cleanup trap
cleanup() {
    log "🧹 정리 작업 수행 중..."
}

trap cleanup EXIT

# 실행
main
