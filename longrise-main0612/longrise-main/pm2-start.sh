#!/usr/bin/env bash
set -euo pipefail

# Longrise Platform - PM2로 모든 서비스 시작
# PostgreSQL은 별도로 Docker로 관리

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"

# 로그 디렉터리 생성
mkdir -p "$LOG_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [PM2-START] $1"
}

start_database() {
    log "🗄️ PostgreSQL 데이터베이스 시작 중..."

    cd "$SCRIPT_DIR"
    if [ -f "restart-database.sh" ]; then
        bash restart-database.sh --bf
        log "✅ PostgreSQL 데이터베이스 시작됨"
    else
        log "⚠️  restart-database.sh 스크립트를 찾을 수 없습니다."
    fi
}

check_dependencies() {
    log "🔧 사전 조건 확인 중..."

    # PM2 확인
    if ! command -v pm2 &> /dev/null; then
        log "❌ PM2가 설치되지 않았습니다."
        log "   설치: npm install -g pm2"
        exit 1
    fi

    # UV 확인 (FastAPI용)
    if ! command -v uv &> /dev/null; then
        log "❌ UV가 설치되지 않았습니다."
        log "   설치: curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi

    # Node.js 확인
    if ! command -v node &> /dev/null; then
        log "❌ Node.js가 설치되지 않았습니다."
        exit 1
    fi

    log "✅ 사전 조건 확인 완료"
}

install_frontend_deps() {
    log "📦 프론트엔드 의존성 확인 중..."

    # User Frontend
    if [ -d "lr_user-frontend" ]; then
        cd "lr_user-frontend"
        if [ ! -d "node_modules" ]; then
            log "📦 User Frontend 의존성 설치 중..."
            npm install
        fi
        cd "$SCRIPT_DIR"
    fi

    # Admin Frontend
    if [ -d "lr_admin-frontend" ]; then
        cd "lr_admin-frontend"
        if [ ! -d "node_modules" ]; then
            log "📦 Admin Frontend 의존성 설치 중..."
            npm install
        fi
        cd "$SCRIPT_DIR"
    fi

    log "✅ 프론트엔드 의존성 확인 완료"
}

install_fastapi_deps() {
    log "📦 FastAPI 의존성 확인 중..."

    if [ -d "lr_fastapi" ]; then
        cd "lr_fastapi"
        uv sync
        cd "$SCRIPT_DIR"
        log "✅ FastAPI 의존성 확인 완료"
    fi
}

start_pm2_services() {
    log "🚀 PM2로 서비스들 시작 중..."

    # 기존 PM2 프로세스 정리
    pm2 delete ecosystem.config.cjs 2>/dev/null || true

    # PM2 ecosystem으로 모든 서비스 시작
    pm2 start ecosystem.config.cjs

    # PM2 상태 저장
    pm2 save

    log "✅ PM2 서비스들 시작 완료"
}

check_services() {
    log "🏥 서비스 상태 확인 중..."
    sleep 5  # 서비스 시작 대기

    # PM2 상태 표시
    pm2 status

    # 개별 서비스 확인
    log ""
    log "📊 개별 서비스 상태:"

    # PostgreSQL 확인
    if docker ps | grep -q longrise_database_postgres; then
        log "✅ PostgreSQL: 실행 중"
    else
        log "❌ PostgreSQL: 중지됨"
    fi

    # FastAPI 확인
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        log "✅ FastAPI: 실행 중 (http://localhost:8000)"
    else
        log "❌ FastAPI: 중지됨 또는 응답 없음"
    fi

    # User Frontend 확인
    if lsof -i :5173 >/dev/null 2>&1; then
        log "✅ User Frontend: 실행 중 (http://localhost:5173)"
    else
        log "❌ User Frontend: 중지됨"
    fi

    # Admin Frontend 확인
    if lsof -i :5174 >/dev/null 2>&1; then
        log "✅ Admin Frontend: 실행 중 (http://localhost:5174)"
    else
        log "❌ Admin Frontend: 중지됨"
    fi
}

print_summary() {
    log ""
    log "🎉 Longrise Platform PM2 시작 완료!"
    log "========================================================"
    log "📱 접속 정보:"
    log "   - User Frontend:  http://localhost:5173"
    log "   - Admin Frontend: http://localhost:5174"
    log "   - FastAPI Docs:   http://localhost:8000/api/v1/docs"
    log "   - Health Check:   http://localhost:8000/health"
    log ""
    log "🛠️  PM2 관리 명령어:"
    log "   - 상태 확인:      pm2 status"
    log "   - 로그 확인:      pm2 logs"
    log "   - 서비스 재시작:  pm2 restart all"
    log "   - 서비스 중지:    pm2 stop all"
    log "   - 서비스 삭제:    pm2 delete all"
    log "   - 모니터링:       pm2 monit"
    log ""
    log "📄 로그 파일: $LOG_DIR/"
    log "========================================================"
}

main() {
    log "🚀 Longrise AI Platform - PM2 시작"
    log "========================================================"

    # 사전 조건 확인
    check_dependencies

    # 데이터베이스 시작
    start_database

    # 의존성 설치
    install_fastapi_deps
    install_frontend_deps

    # PM2 서비스 시작
    start_pm2_services

    # 서비스 상태 확인
    check_services

    # 요약 출력
    print_summary
}

# Cleanup trap
cleanup() {
    log "🧹 정리 작업 수행 중..."
}

trap cleanup EXIT

# 실행
main "$@"
