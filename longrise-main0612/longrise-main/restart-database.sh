#!/usr/bin/env bash
set -euo pipefail

# Longrise Database Restart Script
# PostgreSQL 15 Docker 컨테이너 관리

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$SCRIPT_DIR/lr_database"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/database.log"

# 백그라운드 모드 설정
BF_MODE=0
if [[ "${1:-}" == "--bf" ]]; then
    BF_MODE=1
fi

# 로그 디렉터리 생성
mkdir -p "$LOG_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DATABASE] $1" | tee -a "$LOG_FILE"
}

run_database() {
    log "🐳 Longrise PostgreSQL 데이터베이스 재시작 시작..."

    # 데이터베이스 디렉터리로 이동
    cd "$DATABASE_DIR"

    # 기존 컨테이너 중지 및 제거
    log "📦 기존 PostgreSQL 컨테이너 중지 중..."
    docker-compose down -v --remove-orphans 2>/dev/null || {
        log "⚠️  기존 컨테이너 정리 실패 (무시하고 계속)"
    }

    # 컨테이너 시작
    log "🚀 PostgreSQL 컨테이너 시작..."
    docker-compose up -d

    # 헬스체크 대기
    log "🏥 데이터베이스 헬스체크 대기 중..."
    local MAX_ATTEMPTS=30
    local ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if docker exec longrise_database_postgres pg_isready -U longrise -d longrise >/dev/null 2>&1; then
            log "✅ PostgreSQL 데이터베이스 준비 완료!"
            break
        fi

        ATTEMPT=$((ATTEMPT + 1))
        log "⏳ 헬스체크 대기... ($ATTEMPT/$MAX_ATTEMPTS)"
        sleep 2
    done

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        log "❌ PostgreSQL 데이터베이스 시작 실패!"
        exit 1
    fi

    # 연결 정보 출력
    log "📊 데이터베이스 연결 정보:"
    log "   - Host: localhost"
    log "   - Port: 5432"
    log "   - Database: longrise"
    log "   - Username: longrise"
    log "   - Container: longrise_database_postgres"

    # 컨테이너 상태 확인
    log "📋 컨테이너 상태:"
    docker ps --filter "name=longrise_database_postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    log "🎉 PostgreSQL 데이터베이스 재시작 완료!"
}

main() {
    if [ $BF_MODE -eq 1 ]; then
        log "🌟 백그라운드 모드로 데이터베이스 시작..."
        run_database &
        log "✅ 백그라운드 프로세스 시작됨 (PID: $!)"
        log "📄 로그 확인: tail -f $LOG_FILE"
    else
        run_database
    fi
}

# Cleanup trap
cleanup() {
    log "🧹 정리 작업 수행 중..."
}

trap cleanup EXIT

# 실행
main "$@"