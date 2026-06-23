#!/usr/bin/env bash
set -euo pipefail

# Longrise Platform - PM2 모든 서비스 중지

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [PM2-STOP] $1"
}

stop_pm2_services() {
    log "🛑 PM2 서비스들 중지 중..."

    # PM2 프로세스 상태 확인
    if pm2 list | grep -q "online\|stopped\|errored"; then
        # 모든 PM2 프로세스 중지
        pm2 stop all

        # Ecosystem 프로세스 삭제
        pm2 delete ecosystem.config.cjs 2>/dev/null || true

        log "✅ PM2 서비스들 중지 완료"
    else
        log "ℹ️  실행 중인 PM2 서비스가 없습니다."
    fi

    # PM2 daemon 중지 여부 묻기
    read -p "PM2 daemon도 중지하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 kill
        log "✅ PM2 daemon 중지됨"
    fi
}

stop_database() {
    log "🗄️ PostgreSQL 데이터베이스 중지 확인 중..."

    read -p "데이터베이스(PostgreSQL)도 중지하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$SCRIPT_DIR"
        if [ -f "stop-all-services.sh" ]; then
            bash stop-all-services.sh
            log "✅ 데이터베이스 중지 완료"
        else
            # 직접 Docker 컨테이너 중지
            if docker ps | grep -q longrise_database_postgres; then
                docker stop longrise_database_postgres
                log "✅ PostgreSQL 컨테이너 중지됨"
            fi
        fi
    else
        log "ℹ️  데이터베이스는 계속 실행됩니다."
    fi
}

check_remaining_processes() {
    log "🔍 남은 프로세스 확인 중..."

    # 포트 사용 프로세스 확인
    local ports=(8000 5173 5174)
    local found_processes=false

    for port in "${ports[@]}"; do
        local pids=$(lsof -ti ":$port" 2>/dev/null || true)
        if [ -n "$pids" ]; then
            log "⚠️  포트 $port에서 실행 중인 프로세스: $pids"
            found_processes=true
        fi
    done

    if [ "$found_processes" = true ]; then
        read -p "남은 프로세스들을 강제 종료하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for port in "${ports[@]}"; do
                local pids=$(lsof -ti ":$port" 2>/dev/null || true)
                if [ -n "$pids" ]; then
                    echo "$pids" | xargs -r kill -TERM 2>/dev/null || true
                    sleep 2
                    echo "$pids" | xargs -r kill -KILL 2>/dev/null || true
                    log "✅ 포트 $port 프로세스들 종료됨"
                fi
            done
        fi
    else
        log "✅ 남은 프로세스가 없습니다."
    fi
}

main() {
    log "🛑 Longrise AI Platform - PM2 중지"
    log "========================================================"

    # PM2 서비스 중지
    stop_pm2_services

    # 데이터베이스 중지 확인
    stop_database

    # 남은 프로세스 확인
    check_remaining_processes

    log ""
    log "🎉 PM2 서비스 중지 완료!"
    log "========================================================"
    log "🛠️  다시 시작하려면:"
    log "   ./pm2-start.sh"
    log ""
    log "📊 PM2 상태 확인:"
    log "   pm2 status"
    log "========================================================"
}

# 실행
main "$@"
