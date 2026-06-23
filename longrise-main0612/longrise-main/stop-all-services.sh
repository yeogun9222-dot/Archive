#!/usr/bin/env bash
set -euo pipefail

# Longrise Platform - 모든 서비스 중지 스크립트

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/stop-all.log"

# 로그 디렉터리 생성
mkdir -p "$LOG_DIR"

log() {
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[$timestamp] [STOP-ALL] $1" | tee -a "$LOG_FILE"
}

is_longrise_pid() {
    local pid="$1"
    local command_line
    command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"

    [[ "$command_line" == *"$SCRIPT_DIR"* ]] || \
    [[ "$command_line" == *"longrise"* ]] || \
    [[ "$command_line" == *"lr_"* ]]
}

print_header() {
    log "🛑 Longrise AI Platform - 전체 서비스 중지"
    log "========================================================"
}

stop_processes_by_port() {
    local port="$1"
    local service_name="$2"

    local PIDS
    PIDS=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
    local TARGET_PIDS=""
    local SKIPPED_PIDS=""

    for pid in $PIDS; do
        if is_longrise_pid "$pid"; then
            TARGET_PIDS="$TARGET_PIDS $pid"
        else
            SKIPPED_PIDS="$SKIPPED_PIDS $pid"
        fi
    done

    if [ -n "$TARGET_PIDS" ]; then
        log "🚫 $service_name (포트 $port) 프로세스 중지 중..."
        echo "$TARGET_PIDS" | xargs -r kill -TERM 2>/dev/null || true
        sleep 2
        echo "$TARGET_PIDS" | xargs -r kill -KILL 2>/dev/null || true
        log "✅ $service_name 프로세스 중지 완료"
    elif [ -n "$SKIPPED_PIDS" ]; then
        log "ℹ️  $service_name (포트 $port): 다른 프로젝트 프로세스 사용 중이라 건너뜀 (PID:$SKIPPED_PIDS)"
    else
        log "ℹ️  $service_name (포트 $port): 실행 중인 프로세스 없음"
    fi
}

stop_process_by_pid_file() {
    local pid_file="$1"
    local service_name="$2"

    if [ -f "$pid_file" ]; then
        local PID=$(cat "$pid_file")
        if kill -0 "$PID" 2>/dev/null; then
            log "🚫 $service_name (PID: $PID) 프로세스 중지 중..."
            kill -TERM "$PID" 2>/dev/null || true
            sleep 2
            kill -KILL "$PID" 2>/dev/null || true
            log "✅ $service_name 프로세스 중지 완료"
        fi
        rm -f "$pid_file"
    fi
}

stop_pm2_services() {
    if ! command -v pm2 >/dev/null 2>&1; then
        log "ℹ️  PM2가 설치되어 있지 않음"
        return 0
    fi

    log "🧭 PM2 Longrise 서비스 확인 중..."

    local pm2_services=(
        "longrise-user-frontend"
        "longrise-admin-frontend"
        "longrise-fastapi"
    )
    local deleted=false

    for service in "${pm2_services[@]}"; do
        if pm2 describe "$service" >/dev/null 2>&1; then
            log "🚫 PM2 서비스 삭제 중: $service"
            pm2 delete "$service" >/dev/null 2>&1 || true
            deleted=true
        fi
    done

    if [ "$deleted" = true ]; then
        pm2 save --force >/dev/null 2>&1 || true
        log "✅ PM2 Longrise 서비스 삭제 및 저장 완료"
    else
        log "ℹ️  PM2에 등록된 Longrise 서비스 없음"
    fi

    if [ "$(pm2 jlist 2>/dev/null | tr -d '[:space:]')" = "[]" ]; then
        log "🧹 PM2에 남은 앱이 없어 daemon 중지 중..."
        pm2 kill >/dev/null 2>&1 || true
        log "✅ PM2 daemon 중지 완료"
    else
        log "ℹ️  PM2에 다른 앱이 남아 있어 daemon은 유지함"
    fi
}

stop_docker_services() {
    log "🐳 Docker 서비스 확인 중..."

    # AWS RDS 사용으로 인해 로컬 PostgreSQL 컨테이너는 더 이상 관리하지 않음
    log "ℹ️  Database: AWS RDS PostgreSQL 사용 중 (로컬 Docker 컨테이너 관리 불필요)"

    # 기타 Longrise 관련 Docker 컨테이너가 있다면 중지
    if docker ps --filter "name=longrise" --format "{{.Names}}" | grep -q .; then
        log "🗄️ 기타 Longrise Docker 컨테이너 중지 중..."
        docker ps --filter "name=longrise" --format "{{.Names}}" | xargs -r docker stop
        log "✅ Docker 컨테이너 중지 완료"
    else
        log "ℹ️  실행 중인 Longrise Docker 컨테이너 없음"
    fi
}

stop_frontend_services() {
    log "🌐 프론트엔드 서비스 중지 중..."

    # User Frontend (포트 5173)
    stop_processes_by_port 5173 "User Frontend"
    stop_process_by_pid_file "$LOG_DIR/user-frontend.pid" "User Frontend"

    # Admin Frontend (포트 5174)
    stop_processes_by_port 5174 "Admin Frontend"
    stop_process_by_pid_file "$LOG_DIR/admin-frontend.pid" "Admin Frontend"
}

stop_backend_services() {
    log "⚙️ 백엔드 서비스 중지 중..."

    # FastAPI (포트 8000)
    stop_processes_by_port 8000 "FastAPI"
    stop_process_by_pid_file "$LOG_DIR/fastapi.pid" "FastAPI"
}

cleanup_logs() {
    log "📄 로그 정리 중..."

    # PID 파일들 정리
    rm -f "$LOG_DIR"/*.pid 2>/dev/null || true

    # 오래된 로그 파일 압축 (7일 이상)
    find "$LOG_DIR" -name "*.log" -mtime +7 -exec gzip {} \; 2>/dev/null || true

    log "✅ 로그 정리 완료"
}

check_remaining_processes() {
    log "🔍 남은 프로세스 확인 중..."

    local remaining_found=false

    # 포트별 확인
    local ports=(5173 5174 8000)
    local port_names=("User Frontend" "Admin Frontend" "FastAPI")

    for i in "${!ports[@]}"; do
        local port="${ports[$i]}"
        local name="${port_names[$i]}"
        local PIDS
        PIDS=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
        local longrise_found=false

        for pid in $PIDS; do
            if is_longrise_pid "$pid"; then
                longrise_found=true
            fi
        done

        if [ "$longrise_found" = true ]; then
            log "⚠️  $name (포트 $port): Longrise 프로세스가 여전히 실행 중"
            remaining_found=true
        elif [ -n "$PIDS" ]; then
            log "ℹ️  $name (포트 $port): 다른 프로젝트가 사용 중 (Longrise 아님)"
        fi
    done

    # Docker 컨테이너 확인
    if docker ps | grep -q longrise; then
        log "⚠️  Longrise Docker 컨테이너가 여전히 실행 중:"
        docker ps --filter "name=longrise" --format "table {{.Names}}\t{{.Status}}"
        remaining_found=true
    fi

    if [ "$remaining_found" = false ]; then
        log "✅ 모든 Longrise 서비스가 정상적으로 중지됨"
    else
        log "⚠️  일부 서비스가 여전히 실행 중입니다. 수동으로 확인해주세요."
    fi
}

force_cleanup() {
    log "⚡ 강제 정리 모드 실행 중..."

    # PM2가 서비스를 자동 재시작하지 않도록 먼저 등록 해제
    stop_pm2_services

    # 모든 longrise 관련 프로세스 강제 종료
    pkill -f "longrise" 2>/dev/null || true
    pkill -f "lr_" 2>/dev/null || true

    # Docker 컨테이너 강제 제거
    docker ps -a | grep longrise | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

    # 포트 기반 강제 종료
    local ports=(5173 5174 8000)
    for port in "${ports[@]}"; do
        local PIDS
        PIDS=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
        local TARGET_PIDS=""

        for pid in $PIDS; do
            if is_longrise_pid "$pid"; then
                TARGET_PIDS="$TARGET_PIDS $pid"
            fi
        done

        if [ -n "$TARGET_PIDS" ]; then
            echo "$TARGET_PIDS" | xargs -r kill -KILL 2>/dev/null || true
        fi
    done

    log "✅ 강제 정리 완료"
}

print_summary() {
    log ""
    log "🎉 전체 서비스 중지 완료!"
    log "========================================================"
    log "📊 중지된 서비스:"
    log "   - FastAPI 백엔드 서버"
    log "   - User Frontend"
    log "   - Admin Frontend"
    log "   - AWS RDS PostgreSQL (외부 관리형 서비스, 중지되지 않음)"
    log ""
    log "🛠️  다시 시작하려면:"
    log "   - 전체 재시작: ./restart-all-services.sh --bf"
    log "   - 개별 재시작: ./restart-[서비스명].sh --bf"
    log ""
    log "📄 로그 파일: $LOG_FILE"
    log "========================================================"
}

main() {
    print_header

    # 강제 모드 확인
    if [[ "${1:-}" == "--force" ]]; then
        force_cleanup
        return 0
    fi

    # PM2가 포트 프로세스를 자동 재시작하지 않도록 먼저 정리
    stop_pm2_services

    # 정상적인 중지 순서: Frontend → Backend → Database
    stop_frontend_services
    sleep 2

    stop_backend_services
    sleep 2

    stop_docker_services
    sleep 2

    # 정리 작업
    cleanup_logs

    # 남은 프로세스 확인
    check_remaining_processes

    # 요약 출력
    print_summary
}

# Cleanup trap
cleanup() {
    log "🧹 정리 작업 수행 중..."
}

trap cleanup EXIT

# 도움말
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "Longrise Platform - 서비스 중지 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0                정상적으로 모든 서비스 중지"
    echo "  $0 --force        강제로 모든 서비스 중지"
    echo "  $0 --help         이 도움말 표시"
    echo ""
    echo "중지되는 서비스:"
    echo "  - FastAPI Backend Server"
    echo "  - User Frontend (React)"
    echo "  - Admin Frontend (React)"
    echo "  ※ AWS RDS PostgreSQL은 외부 관리형 서비스로 중지되지 않습니다"
    exit 0
fi

# 실행
main "$@"
