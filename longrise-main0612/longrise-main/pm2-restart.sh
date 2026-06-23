#!/usr/bin/env bash
set -euo pipefail

# Longrise Platform - PM2 개별 서비스 재시작

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [PM2-RESTART] $1"
}

show_usage() {
    echo "사용법: $0 [서비스명] [옵션]"
    echo ""
    echo "서비스명:"
    echo "  all                - 모든 서비스 재시작"
    echo "  fastapi           - FastAPI 백엔드만 재시작"
    echo "  user-frontend     - User Frontend만 재시작"
    echo "  admin-frontend    - Admin Frontend만 재시작"
    echo "  database          - PostgreSQL 데이터베이스만 재시작"
    echo ""
    echo "옵션:"
    echo "  --status          - 재시작 후 상태 확인"
    echo "  --logs            - 재시작 후 로그 표시"
    echo ""
    echo "예시:"
    echo "  $0 all"
    echo "  $0 fastapi --status"
    echo "  $0 user-frontend --logs"
}

restart_pm2_service() {
    local service_name="$1"

    case "$service_name" in
        "fastapi")
            local pm2_name="longrise-fastapi"
            ;;
        "user-frontend")
            local pm2_name="longrise-user-frontend"
            ;;
        "admin-frontend")
            local pm2_name="longrise-admin-frontend"
            ;;
        *)
            log "❌ 알 수 없는 서비스: $service_name"
            return 1
            ;;
    esac

    log "🔄 $service_name 재시작 중..."

    if pm2 restart "$pm2_name"; then
        log "✅ $service_name 재시작 완료"
        return 0
    else
        log "❌ $service_name 재시작 실패"
        return 1
    fi
}

restart_database() {
    log "🔄 PostgreSQL 데이터베이스 재시작 중..."

    cd "$SCRIPT_DIR"
    if [ -f "restart-database.sh" ]; then
        bash restart-database.sh --bf
        log "✅ 데이터베이스 재시작 완료"
    else
        log "❌ restart-database.sh 스크립트를 찾을 수 없습니다."
        return 1
    fi
}

restart_all_services() {
    log "🔄 모든 서비스 재시작 중..."

    # 데이터베이스 먼저 재시작
    restart_database

    # PM2 서비스들 재시작
    if pm2 restart ecosystem.config.cjs; then
        log "✅ 모든 PM2 서비스 재시작 완료"
    else
        log "❌ PM2 서비스 재시작 실패"
        return 1
    fi
}

show_status() {
    log "📊 서비스 상태 확인 중..."

    # PM2 상태
    pm2 status

    echo ""
    log "개별 서비스 상태:"

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

show_logs() {
    local service="$1"

    case "$service" in
        "fastapi")
            pm2 logs longrise-fastapi
            ;;
        "user-frontend")
            pm2 logs longrise-user-frontend
            ;;
        "admin-frontend")
            pm2 logs longrise-admin-frontend
            ;;
        "all")
            pm2 logs
            ;;
        *)
            log "❌ 알 수 없는 서비스: $service"
            ;;
    esac
}

main() {
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi

    local service="${1:-}"
    local option="${2:-}"

    log "🔄 Longrise Platform - PM2 재시작"
    log "========================================================"

    case "$service" in
        "all")
            restart_all_services
            ;;
        "fastapi"|"user-frontend"|"admin-frontend")
            restart_pm2_service "$service"
            ;;
        "database")
            restart_database
            ;;
        *)
            log "❌ 알 수 없는 서비스: $service"
            show_usage
            exit 1
            ;;
    esac

    # 옵션 처리
    case "$option" in
        "--status")
            echo ""
            show_status
            ;;
        "--logs")
            echo ""
            show_logs "$service"
            ;;
    esac

    log "========================================================"
    log "🎉 재시작 작업 완료!"
}

# 실행
main "$@"
