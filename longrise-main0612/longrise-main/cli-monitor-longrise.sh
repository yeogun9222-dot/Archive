#!/bin/bash

# cli-monitor-longrise.sh
# Longrise Platform 실시간 통합 모니터링 툴
# PM2 + PostgreSQL + FastAPI + React Frontend 전체 서비스 모니터링

# 🚀 LONGRISE INFRASTRUCTURE INFO - AWS RDS MIGRATION
# ════════════════════════════════════════════════════════════════════════════════════════════
# ✅ LOCAL MANAGED SERVICES:
# - FastAPI Backend: uvicorn (Port 8000)
# - User Frontend: Vite React dev server (Port 5173)
# - Admin Frontend: Vite React dev server (Port 5174)
#
# ✅ AWS MANAGED SERVICES:
# - PostgreSQL: AWS RDS PostgreSQL 15.17 (longrise-main-db)
# - Endpoint: longrise-main-db.c726s6ksmvve.ap-northeast-2.rds.amazonaws.com:5432
#
# 🔧 DEVELOPMENT STACK:
# - Backend: FastAPI + SQLModel + AWS RDS + UV package manager
# - Frontend: React + TypeScript + Vite
# - Database: AWS RDS PostgreSQL (Direct Connection)
# - Restart Detection: restart-all-services.sh monitoring
# ════════════════════════════════════════════════════════════════════════════════════════════

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m'

# 커서 제어 상수
CURSOR_UP='\033[A'
CURSOR_DOWN='\033[B'
CURSOR_HOME='\033[H'
CLEAR_LINE='\033[2K'
SAVE_CURSOR='\033[s'
RESTORE_CURSOR='\033[u'
HIDE_CURSOR='\033[?25l'
SHOW_CURSOR='\033[?25h'

# 설정
INTERVAL=2
ROOT_DIR=$(pwd)
LOG_DIR="$ROOT_DIR/logs"
FULL_REFRESH_INTERVAL=30  # 전체 화면 새로고침 주기 (초)

# 상태 추적 변수
PREV_SYSTEM_INFO=""
FIRST_RUN=true
LAST_FULL_REFRESH=0
declare -a PREV_SERVICE_STATUS
declare -a PREV_LOCAL_STATUS
declare -a PREV_AWS_STATUS
declare -a PREV_RESTART_STATUS

# 로컬 서비스 정의 배열 (app_name|display_name|port|type|description)
LOCAL_SERVICES=(
  "longrise-fastapi|FastAPI Backend|8000|LOCAL|FastAPI + SQLModel + UV"
  "longrise-user-frontend|User Frontend|5173|LOCAL|React + TypeScript + Vite"
  "longrise-admin-frontend|Admin Frontend|5174|LOCAL|React + TypeScript + Vite"
)

# AWS 서비스 정의 배열 (service_name|display_name|endpoint|type|description)
AWS_SERVICES=(
  "rds|PostgreSQL DB|longrise-main-db.c726s6ksmvve.ap-northeast-2.rds.amazonaws.com:5432|RDS|AWS RDS PostgreSQL 15.17"
)

# 재시작 스크립트 모니터링
RESTART_SCRIPT_PATTERNS=(
  "restart-all-services.sh|All Services Restart|RESTART|Restart All Services Script"
)

# 키보드 입력 모드 설정
setup_keyboard() {
  # 원래 터미널 설정 저장
  OLD_STTY_CFG=$(stty -g 2>/dev/null || echo "")
  # 키 입력을 즉시 받도록 설정
  if [ -t 0 ]; then
    stty -icanon -echo min 0 time 1 2>/dev/null
  fi
  # 커서 숨기기
  echo -e "${HIDE_CURSOR}"
}

# 터미널 설정 복원
restore_keyboard() {
  if [ -n "$OLD_STTY_CFG" ] && [ -t 0 ]; then
    stty $OLD_STTY_CFG 2>/dev/null
  fi
  echo -e "${SHOW_CURSOR}"
}

# 시그널 핸들러
cleanup() {
  restore_keyboard
  clear
  echo -e "\n${GREEN}✅ Longrise Monitor가 정상적으로 종료되었습니다.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# 로컬 서비스 상태 체크 (PM2 또는 직접 실행)
check_local_service_status() {
  local app_name=$1
  local port=$2

  # PM2 프로세스 상태 확인 우선
  if command -v pm2 >/dev/null 2>&1; then
    local pm2_status=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$app_name\") | .pm2_env.status" 2>/dev/null || echo "")

    if [ -n "$pm2_status" ]; then
      local pm2_pid=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$app_name\") | .pid" 2>/dev/null || echo "")
      local pm2_cpu=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$app_name\") | .monit.cpu" 2>/dev/null || echo "0")
      local pm2_mem=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$app_name\") | .monit.memory" 2>/dev/null || echo "0")
      local pm2_uptime=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$app_name\") | .pm2_env.pm_uptime" 2>/dev/null || echo "0")

      # 메모리를 MB로 변환
      if [ "$pm2_mem" != "0" ] && [ "$pm2_mem" != "null" ]; then
        pm2_mem=$(awk "BEGIN {printf \"%.1f\", $pm2_mem / 1024 / 1024}")
      else
        pm2_mem="0.0"
      fi

      # 업타임 계산
      if [ "$pm2_uptime" != "0" ] && [ "$pm2_uptime" != "null" ]; then
        local current_time=$(date +%s)
        local uptime_seconds=$(( (current_time * 1000 - pm2_uptime) / 1000 ))
        local uptime_formatted=$(format_uptime $uptime_seconds)
      else
        local uptime_formatted="0:00"
      fi

      case "$pm2_status" in
        "online")
          # 포트 연결 테스트
          if [ "$port" = "8000" ]; then
            # FastAPI 헬스 체크
            if curl -s --connect-timeout 1 "http://localhost:$port/health" >/dev/null 2>&1; then
              echo "HEALTHY|$pm2_pid|${pm2_cpu}%|${pm2_mem}MB|$uptime_formatted"
            else
              echo "PORT_ONLY|$pm2_pid|${pm2_cpu}%|${pm2_mem}MB|$uptime_formatted"
            fi
          else
            # 프론트엔드 서버 포트 체크 (LISTEN 상태만)
            if lsof -i :$port -sTCP:LISTEN >/dev/null 2>&1; then
              echo "RUNNING|$pm2_pid|${pm2_cpu}%|${pm2_mem}MB|$uptime_formatted"
            else
              echo "PORT_ERR|$pm2_pid|${pm2_cpu}%|${pm2_mem}MB|$uptime_formatted"
            fi
          fi
          ;;
        "stopped")
          echo "STOPPED|-|-|-|-"
          ;;
        "errored")
          echo "ERROR|$pm2_pid|-|-|-"
          ;;
        *)
          echo "UNKNOWN|-|-|-|-"
          ;;
      esac
      return
    fi
  fi

  # PM2에 없으면 직접 실행 프로세스 확인 (LISTEN 상태만)
  local listen_process=$(lsof -i :$port -sTCP:LISTEN 2>/dev/null | tail -1)
  if [ -n "$listen_process" ]; then
    local pid=$(echo "$listen_process" | awk '{print $2}')

    if [ "$port" = "8000" ]; then
      # FastAPI 헬스 체크
      if curl -s --connect-timeout 1 "http://localhost:$port/health" >/dev/null 2>&1; then
        echo "HEALTHY|$pid|0.0|0.0|direct"
      else
        echo "PORT_ONLY|$pid|0.0|0.0|direct"
      fi
    else
      echo "RUNNING|$pid|0.0|0.0|direct"
    fi
  else
    echo "STOPPED|-|-|-|-"
  fi
}

# AWS RDS 상태 체크
check_aws_rds_status() {
  local service_name=$1
  local endpoint=$2

  case "$service_name" in
    "rds")
      # RDS PostgreSQL 연결 테스트 - FastAPI의 DATABASE_URL 사용
      local db_url=$(grep "^DATABASE_URL=" lr_fastapi/.env.local 2>/dev/null | cut -d'=' -f2-)

      if [ -n "$db_url" ]; then
        # Python을 통한 실제 DB 연결 테스트 (가상환경 사용)
        if cd lr_fastapi && .venv/bin/python -c "
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_db():
    try:
        engine = create_async_engine('$db_url', pool_pre_ping=True)
        async with engine.begin() as conn:
            await conn.execute(text('SELECT 1'))
        await engine.dispose()
        print('DB_OK')
        sys.exit(0)
    except Exception as e:
        print(f'DB_ERR: {str(e)[:30]}')
        sys.exit(1)

asyncio.run(test_db())
" 2>/dev/null; then
          echo "DB_OK|rds|0.0|0.0|aws rds"
        else
          # Fallback: endpoint 연결성 테스트
          local host=$(echo "$endpoint" | cut -d':' -f1)
          local port=$(echo "$endpoint" | cut -d':' -f2)
          if nc -z -w 3 "$host" "$port" 2>/dev/null; then
            echo "DB_CONN_ONLY|rds|0.0|0.0|endpoint ok"
          else
            echo "DB_ERR|rds|0.0|0.0|no conn"
          fi
        fi
      else
        echo "DB_CONFIG_ERR|rds|0.0|0.0|no env"
      fi
      ;;
    *)
      echo "UNKNOWN_AWS|unknown|0.0|0.0|-"
      ;;
  esac
}

# 재시작 스크립트 감지
check_restart_script_status() {
  local script_name=$1

  case "$script_name" in
    "restart-all-services.sh")
      # restart-all-services.sh 실행 중인지 확인
      if pgrep -f "restart-all-services.sh" >/dev/null 2>&1; then
        local script_pid=$(pgrep -f "restart-all-services.sh" | head -1)
        echo "RESTARTING|$script_pid|0.0|0.0|active"
      else
        # 최근 실행 로그 확인 (logs/restart-all.log)
        if [ -f "logs/restart-all.log" ]; then
          local last_run=$(tail -10 logs/restart-all.log 2>/dev/null | grep "모든 서비스가 성공적으로 재시작" | tail -1)
          if [ -n "$last_run" ]; then
            echo "COMPLETED|done|0.0|0.0|recent"
          else
            echo "IDLE|none|0.0|0.0|ready"
          fi
        else
          echo "IDLE|none|0.0|0.0|ready"
        fi
      fi
      ;;
    *)
      echo "UNKNOWN|-|-|-|-"
      ;;
  esac
}

# 업타임 포맷팅
format_uptime() {
  local seconds=$1
  local days=$((seconds / 86400))
  local hours=$(( (seconds % 86400) / 3600 ))
  local minutes=$(( (seconds % 3600) / 60 ))

  if [ $days -gt 0 ]; then
    echo "${days}d${hours}h"
  elif [ $hours -gt 0 ]; then
    echo "${hours}h${minutes}m"
  else
    echo "${minutes}:$(printf "%02d" $((seconds % 60)))"
  fi
}

# 시스템 리소스 정보 (macOS/Linux 공통)
get_system_info() {
  # CPU 사용률 (OS별 분기)
  local cpu_usage="0.00"
  if [[ "$(uname)" == "Darwin" ]]; then
    local cpu_line=$(top -l 1 -n 0 2>/dev/null | grep "CPU usage")
    local cpu_user=$(echo "$cpu_line" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "0")
    local cpu_sys=$(echo "$cpu_line" | awk '{print $5}' | sed 's/%//' 2>/dev/null || echo "0")
    cpu_usage=$(awk "BEGIN {printf \"%.2f\", $cpu_user + $cpu_sys}" 2>/dev/null || echo "0.00")
  else
    # Linux: /proc/stat 이용
    local cpu_line=$(head -1 /proc/stat 2>/dev/null)
    if [[ -n "$cpu_line" ]]; then
      local user nice system idle iowait irq softirq
      read -r _ user nice system idle iowait irq softirq _ <<< "$cpu_line"
      local total=$((user + nice + system + idle + iowait + irq + softirq))
      local idle_total=$((idle + iowait))
      if [[ $total -gt 0 ]]; then
        cpu_usage=$(awk "BEGIN {printf \"%.2f\", (($total - $idle_total) / $total) * 100}" 2>/dev/null || echo "0.00")
      fi
    fi
  fi

  # 로드 평균
  local load_avg=$(uptime | sed 's/.*load averages\{0,1\}: *//' | awk '{print $1}' | tr -d ',' 2>/dev/null || echo "0.0")

  # 디스크 사용률
  local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//' 2>/dev/null || echo "0")

  echo "$cpu_usage|$load_avg|$disk_usage"
}

# 네트워크 연결 상태 확인
check_network_connections() {
  local connections=$(netstat -an 2>/dev/null | grep ESTABLISHED | wc -l)
  echo "${connections:-0}"
}

# 로그 파일 크기 확인
get_log_size() {
  local service_name=$1
  local log_file=""

  case $service_name in
    "FastAPI Backend") log_file="$LOG_DIR/fastapi.log" ;;
    "User Frontend") log_file="$LOG_DIR/user-frontend.log" ;;
    "Admin Frontend") log_file="$LOG_DIR/admin-frontend.log" ;;
    "PostgreSQL DB") log_file="$LOG_DIR/database.log" ;;
    *) log_file="$LOG_DIR/$(echo "$service_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-').log" ;;
  esac

  if [ -f "$log_file" ]; then
    local size=$(du -h "$log_file" 2>/dev/null | cut -f1)
    echo "${size:-0B}"
  else
    echo "0B"
  fi
}

# 특정 라인으로 커서 이동 후 라인 업데이트
update_line() {
  local line_num=$1
  local content="$2"
  echo -e "\033[${line_num};1H${CLEAR_LINE}${content}"
}

# 시스템 정보 라인 업데이트 (4번째 라인)
update_system_info() {
  local system_info=$(get_system_info)
  local network_conn=$(check_network_connections)
  local current_info="${system_info}|${network_conn}"

  if [ "$current_info" != "$PREV_SYSTEM_INFO" ]; then
    IFS='|' read -r sys_cpu sys_load sys_disk net_conn <<<"$current_info"
    local line_content="${WHITE}║ ${CYAN}System CPU: $(printf "%6s" "$sys_cpu")% ${WHITE}│ ${CYAN}Load: $(printf "%4s" "$sys_load") ${WHITE}│   ${CYAN}Disk: $(printf "%5s" "$sys_disk")% ${WHITE}│   ${CYAN}Network: $(printf "%3s" "$net_conn") conn ${WHITE}│ ${CYAN}Refresh: ${INTERVAL}s ${WHITE}║${NC}"

    update_line 4 "$line_content"
    PREV_SYSTEM_INFO="$current_info"
  fi
}

# 로컬 서비스 라인 업데이트
update_local_service_line() {
  local line_num=$1
  local service_index=$2
  local entry="${LOCAL_SERVICES[$service_index]}"

  IFS='|' read -r app_name display_name port type description <<<"$entry"
  IFS='|' read -r status pid cpu mem uptime <<<"$(check_local_service_status "$app_name" "$port")"
  local log_size=$(get_log_size "$display_name")
  local current_state="${status}|${pid}|${cpu}|${mem}|${log_size}"

  # 상태 텍스트 정리
  local status_text=""
  if [[ "$status" == *"HEALTHY"* ]]; then
    status_text="HEALTHY"
  elif [[ "$status" == *"RUNNING"* ]]; then
    status_text="RUNNING"
  elif [[ "$status" == *"PORT_ONLY"* ]]; then
    status_text="PORT_ONLY"
  elif [[ "$status" == *"PORT_ERR"* ]]; then
    status_text="PORT_ERR"
  elif [[ "$status" == *"STOPPED"* ]]; then
    status_text="STOPPED"
  elif [[ "$status" == *"ERROR"* ]]; then
    status_text="ERROR"
  else
    status_text="UNKNOWN"
  fi

  local padded_status=$(printf '%-9s' "$status_text")

  # 컬러 적용
  if [[ "$status_text" == "HEALTHY" ]] || [[ "$status_text" == "RUNNING" ]]; then
    status_colored="${GREEN}${padded_status}${WHITE}"
  elif [[ "$status_text" == "PORT_ONLY" ]] || [[ "$status_text" == "PORT_ERR" ]]; then
    status_colored="${YELLOW}${padded_status}${WHITE}"
  else
    status_colored="${RED}${padded_status}${WHITE}"
  fi

  local line_content=$(printf "${WHITE}║ ${CYAN}%-6s${WHITE} │ %-17s │ %-17s │ %b │ %-9s │ %-8s │ %-9s ║${NC}" \
    "LOCAL" "$display_name" "$type" "$status_colored" "$pid" "${uptime:-N/A}" "$log_size")

  update_line $line_num "$line_content"
  PREV_LOCAL_STATUS[$service_index]="$current_state"
}

# AWS 서비스 라인 업데이트
update_aws_service_line() {
  local line_num=$1
  local service_index=$2
  local entry="${AWS_SERVICES[$service_index]}"

  IFS='|' read -r service_name display_name endpoint type description <<<"$entry"
  IFS='|' read -r status pid cpu mem uptime <<<"$(check_aws_rds_status "$service_name" "$endpoint")"
  local log_size="N/A"
  local current_state="${status}|${pid}|${cpu}|${mem}|${log_size}"

  # 상태 텍스트 정리
  local status_text=""
  if [[ "$status" == *"DB_OK"* ]]; then
    status_text="DB_OK"
  elif [[ "$status" == *"DB_CONN_ONLY"* ]]; then
    status_text="CONN_ONLY"
  elif [[ "$status" == *"DB_ERR"* ]]; then
    status_text="DB_ERR"
  elif [[ "$status" == *"DB_CONFIG_ERR"* ]]; then
    status_text="CONFIG_ERR"
  else
    status_text="UNKNOWN"
  fi

  local padded_status=$(printf '%-9s' "$status_text")

  # 컬러 적용
  if [[ "$status_text" == "DB_OK" ]]; then
    status_colored="${GREEN}${padded_status}${WHITE}"
  elif [[ "$status_text" == "CONN_ONLY" ]]; then
    status_colored="${YELLOW}${padded_status}${WHITE}"
  else
    status_colored="${RED}${padded_status}${WHITE}"
  fi

  # endpoint를 짧게 표시
  local short_endpoint=$(echo "$endpoint" | cut -d'.' -f1)
  local line_content=$(printf "${WHITE}║ ${YELLOW}%-6s${WHITE} │ %-17s │ %-17s │ %b │ %-9s │ %-8s │ %-9s ║${NC}" \
    "AWS" "$display_name" "$short_endpoint" "$status_colored" "$pid" "${uptime:-N/A}" "$log_size")

  update_line $line_num "$line_content"
  PREV_AWS_STATUS[$service_index]="$current_state"
}

# 재시작 서비스 라인 업데이트
update_restart_service_line() {
  local line_num=$1
  local service_index=$2
  local entry="${RESTART_SCRIPT_PATTERNS[$service_index]}"

  IFS='|' read -r script_name display_name type description <<<"$entry"
  IFS='|' read -r status pid cpu mem uptime <<<"$(check_restart_script_status "$script_name")"
  local log_size=$(get_log_size "restart-all")
  local current_state="${status}|${pid}|${cpu}|${mem}|${log_size}"

  # 상태 텍스트 정리
  local status_text=""
  if [[ "$status" == *"RESTARTING"* ]]; then
    status_text="RUNNING"
  elif [[ "$status" == *"COMPLETED"* ]]; then
    status_text="COMPLETED"
  elif [[ "$status" == *"IDLE"* ]]; then
    status_text="IDLE"
  else
    status_text="UNKNOWN"
  fi

  local padded_status=$(printf '%-9s' "$status_text")

  # 컬러 적용
  if [[ "$status_text" == "RUNNING" ]]; then
    status_colored="${BLUE}${padded_status}${WHITE}"
  elif [[ "$status_text" == "COMPLETED" ]]; then
    status_colored="${GREEN}${padded_status}${WHITE}"
  elif [[ "$status_text" == "IDLE" ]]; then
    status_colored="${GRAY}${padded_status}${WHITE}"
  else
    status_colored="${RED}${padded_status}${WHITE}"
  fi

  local line_content=$(printf "${WHITE}║ ${CYAN}%-6s${WHITE} │ %-17s │ %-17s │ %b │ %-9s │ %-8s │ %-9s ║${NC}" \
    "SCRIPT" "$display_name" "$type" "$status_colored" "$pid" "${uptime:-N/A}" "$log_size")

  update_line $line_num "$line_content"
  PREV_RESTART_STATUS[$service_index]="$current_state"
}

# 안전한 테이블 출력 (항상 전체 새로고침)
print_initial_table() {
  clear
  local system_info=$(get_system_info)
  IFS='|' read -r sys_cpu sys_load sys_disk <<<"$system_info"
  local network_conn=$(check_network_connections)

  # 메인 헤더
  echo -e "${WHITE}╔════════════════════════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${WHITE}║                              ${YELLOW}🚀 LONGRISE PLATFORM MONITOR${WHITE}                                  ║${NC}"
  echo -e "${WHITE}╠════════════════════════════════════════════════════════════════════════════════════════════╣${NC}"
  printf "${WHITE}║ ${CYAN}System CPU: %6s%% ${WHITE}│ ${CYAN}Load: %4s ${WHITE}│   ${CYAN}Disk: %5s%% ${WHITE}│   ${CYAN}Network: %3s conn ${WHITE}│ ${CYAN}Refresh: %ds ${WHITE}║${NC}\n" "$sys_cpu" "$sys_load" "$sys_disk" "$network_conn" "$INTERVAL"

  # 로컬 서비스 섹션
  echo -e "${WHITE}╠════════════════════════════════════════════════════════════════════════════════════════════╣${NC}"
  echo -e "${WHITE}║                                ${PURPLE}🖥️  LOCAL SERVICES${WHITE}                                          ║${NC}"
  echo -e "${WHITE}╠════════╤═══════════════════╤═══════════════════╤═══════════╤═══════════╤══════════╤═══════════╣${NC}"
  printf "${WHITE}║ %-6s │ %-17s │ %-17s │ %-9s │ %-9s │ %-8s │ %-9s ║${NC}\n" \
    "TYPE" "SERVICE" "PROCESS" "STATUS" "PID" "UPTIME" "LOG SIZE"
  echo -e "${WHITE}╠════════╪═══════════════════╪═══════════════════╪═══════════╪═══════════╪══════════╪═══════════╣${NC}"

  # 로컬 서비스들
  print_local_services

  # AWS 서비스 섹션
  echo -e "${WHITE}╠════════╪═══════════════════╪═══════════════════╪═══════════╪═══════════╪══════════╪═══════════╣${NC}"
  echo -e "${WHITE}║                                 ${YELLOW}☁️  AWS SERVICES${WHITE}                                          ║${NC}"
  echo -e "${WHITE}╠════════╪═══════════════════╪═══════════════════╪═══════════╪═══════════╪══════════╪═══════════╣${NC}"

  # AWS 서비스들
  print_aws_services

  # 재시작 모니터링 섹션
  echo -e "${WHITE}╠════════╪═══════════════════╪═══════════════════╪═══════════╪═══════════╪══════════╪═══════════╣${NC}"
  echo -e "${WHITE}║                               ${CYAN}🔄 RESTART MONITORING${WHITE}                                      ║${NC}"
  echo -e "${WHITE}╠════════╪═══════════════════╪═══════════════════╪═══════════╪═══════════╪══════════╪═══════════╣${NC}"

  # 재시작 모니터링
  print_restart_monitoring

  echo -e "${WHITE}╚════════╧═══════════════════╧═══════════════════╧═══════════╧═══════════╧══════════╧═══════════╝${NC}"

  # 타임스탬프 표시
  echo -e "${GRAY}Last updated: $(date '+%H:%M:%S') - Press 'h' for help, 'q' to quit${NC}"

  # 시스템 정보 저장 (부분 업데이트용)
  PREV_SYSTEM_INFO="${sys_cpu}|${sys_load}|${sys_disk}|${network_conn}"
}

# 로컬 서비스 출력 (상태 저장 포함)
print_local_services() {
  for ((i=0; i<${#LOCAL_SERVICES[@]}; i++)); do
    local entry="${LOCAL_SERVICES[$i]}"
    IFS='|' read -r app_name display_name port type description <<<"$entry"
    IFS='|' read -r status pid cpu mem uptime <<<"$(check_local_service_status "$app_name" "$port")"
    local log_size=$(get_log_size "$display_name")

    # 상태 저장 (부분 업데이트용)
    PREV_LOCAL_STATUS[$i]="${status}|${pid}|${cpu}|${mem}|${log_size}"

    # 상태 텍스트 정리
    local status_text=""
    if [[ "$status" == *"HEALTHY"* ]]; then
      status_text="HEALTHY"
    elif [[ "$status" == *"RUNNING"* ]]; then
      status_text="RUNNING"
    elif [[ "$status" == *"PORT_ONLY"* ]]; then
      status_text="PORT_ONLY"
    elif [[ "$status" == *"PORT_ERR"* ]]; then
      status_text="PORT_ERR"
    elif [[ "$status" == *"STOPPED"* ]]; then
      status_text="STOPPED"
    elif [[ "$status" == *"ERROR"* ]]; then
      status_text="ERROR"
    else
      status_text="UNKNOWN"
    fi

    local padded_status=$(printf '%-9s' "$status_text")

    # 컬러 적용
    if [[ "$status_text" == "HEALTHY" ]] || [[ "$status_text" == "RUNNING" ]]; then
      status_colored="${GREEN}${padded_status}${WHITE}"
    elif [[ "$status_text" == "PORT_ONLY" ]] || [[ "$status_text" == "PORT_ERR" ]]; then
      status_colored="${YELLOW}${padded_status}${WHITE}"
    else
      status_colored="${RED}${padded_status}${WHITE}"
    fi

    printf "${WHITE}║ ${CYAN}%-6s${WHITE} │ %-17s │ %-17s │ %b │ %-9s │ %-8s │ %-9s ║${NC}\n" \
      "LOCAL" "$display_name" "$type" "$status_colored" "$pid" "${uptime:-N/A}" "$log_size"
  done
}

# AWS 서비스 출력 (상태 저장 포함)
print_aws_services() {
  for ((i=0; i<${#AWS_SERVICES[@]}; i++)); do
    local entry="${AWS_SERVICES[$i]}"
    IFS='|' read -r service_name display_name endpoint type description <<<"$entry"
    IFS='|' read -r status pid cpu mem uptime <<<"$(check_aws_rds_status "$service_name" "$endpoint")"
    local log_size="N/A"

    # 상태 저장 (부분 업데이트용)
    PREV_AWS_STATUS[$i]="${status}|${pid}|${cpu}|${mem}|${log_size}"

    # 상태 텍스트 정리
    local status_text=""
    if [[ "$status" == *"DB_OK"* ]]; then
      status_text="DB_OK"
    elif [[ "$status" == *"DB_CONN_ONLY"* ]]; then
      status_text="CONN_ONLY"
    elif [[ "$status" == *"DB_ERR"* ]]; then
      status_text="DB_ERR"
    elif [[ "$status" == *"DB_CONFIG_ERR"* ]]; then
      status_text="CONFIG_ERR"
    else
      status_text="UNKNOWN"
    fi

    local padded_status=$(printf '%-9s' "$status_text")

    # 컬러 적용
    if [[ "$status_text" == "DB_OK" ]]; then
      status_colored="${GREEN}${padded_status}${WHITE}"
    elif [[ "$status_text" == "CONN_ONLY" ]]; then
      status_colored="${YELLOW}${padded_status}${WHITE}"
    else
      status_colored="${RED}${padded_status}${WHITE}"
    fi

    # endpoint를 짧게 표시
    local short_endpoint=$(echo "$endpoint" | cut -d'.' -f1)
    printf "${WHITE}║ ${YELLOW}%-6s${WHITE} │ %-17s │ %-17s │ %b │ %-9s │ %-8s │ %-9s ║${NC}\n" \
      "AWS" "$display_name" "$short_endpoint" "$status_colored" "$pid" "${uptime:-N/A}" "$log_size"
  done
}

# 재시작 모니터링 출력
print_restart_monitoring() {
  for ((i=0; i<${#RESTART_SCRIPT_PATTERNS[@]}; i++)); do
    local entry="${RESTART_SCRIPT_PATTERNS[$i]}"
    IFS='|' read -r script_name display_name type description <<<"$entry"
    IFS='|' read -r status pid cpu mem uptime <<<"$(check_restart_script_status "$script_name")"
    local log_size=$(get_log_size "restart-all")

    # 상태 저장 (부분 업데이트용)
    PREV_RESTART_STATUS[$i]="${status}|${pid}|${cpu}|${mem}|${log_size}"

    # 상태 텍스트 정리
    local status_text=""
    if [[ "$status" == *"RESTARTING"* ]]; then
      status_text="RUNNING"
    elif [[ "$status" == *"COMPLETED"* ]]; then
      status_text="COMPLETED"
    elif [[ "$status" == *"IDLE"* ]]; then
      status_text="IDLE"
    else
      status_text="UNKNOWN"
    fi

    local padded_status=$(printf '%-9s' "$status_text")

    # 컬러 적용
    if [[ "$status_text" == "RUNNING" ]]; then
      status_colored="${BLUE}${padded_status}${WHITE}"
    elif [[ "$status_text" == "COMPLETED" ]]; then
      status_colored="${GREEN}${padded_status}${WHITE}"
    elif [[ "$status_text" == "IDLE" ]]; then
      status_colored="${GRAY}${padded_status}${WHITE}"
    else
      status_colored="${RED}${padded_status}${WHITE}"
    fi

    printf "${WHITE}║ ${CYAN}%-6s${WHITE} │ %-17s │ %-17s │ %b │ %-9s │ %-8s │ %-9s ║${NC}\n" \
      "SCRIPT" "$display_name" "$type" "$status_colored" "$pid" "${uptime:-N/A}" "$log_size"
  done
}

# 업데이트된 부분만 다시 그리기 (정확한 라인 번호)
update_display() {
  # 시스템 정보 업데이트 (4번째 줄)
  update_system_info

  # 로컬 서비스 업데이트 (10번째 줄부터)
  local local_line_start=10
  for ((i=0; i<${#LOCAL_SERVICES[@]}; i++)); do
    update_local_service_line $((local_line_start + i)) $i
  done

  # AWS 서비스 업데이트 (로컬 서비스 끝 + 구분선 2줄)
  local aws_line_start=$((10 + ${#LOCAL_SERVICES[@]} + 3))
  for ((i=0; i<${#AWS_SERVICES[@]}; i++)); do
    update_aws_service_line $((aws_line_start + i)) $i
  done

  # 재시작 모니터링 업데이트 (AWS 서비스 끝 + 구분선 2줄)
  local restart_line_start=$((aws_line_start + ${#AWS_SERVICES[@]} + 3))
  for ((i=0; i<${#RESTART_SCRIPT_PATTERNS[@]}; i++)); do
    update_restart_service_line $((restart_line_start + i)) $i
  done

  # 타임스탬프 업데이트 (맨 마지막 줄)
  local timestamp_line=$((restart_line_start + ${#RESTART_SCRIPT_PATTERNS[@]} + 1))
  local timestamp_content="${GRAY}Last updated: $(date '+%H:%M:%S') - Press 'h' for help, 'q' to quit${NC}"
  update_line $timestamp_line "$timestamp_content"
}

# 컨트롤 메뉴
print_controls() {
  echo ""
  echo -e "${WHITE}╔════════════════════════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${WHITE}║                                  ${YELLOW}🎮 INTERACTIVE CONTROLS${WHITE}                                   ║${NC}"
  echo -e "${WHITE}╠════════════════════════════════════════════════════════════════════════════════════════════╣${NC}"
  echo -e "${WHITE}║   ${GREEN}[r]${WHITE} Restart Service    ${GREEN}[l]${WHITE} View Logs        ${GREEN}[s]${WHITE} Start Service      ${GREEN}[q]${WHITE} Quit Monitor      ║${NC}"
  echo -e "${WHITE}║   ${GREEN}[k]${WHITE} Kill Service       ${GREEN}[c]${WHITE} Clear Logs       ${GREEN}[d]${WHITE} Docker Status      ${GREEN}[h]${WHITE} Show Help         ║${NC}"
  echo -e "${WHITE}║   ${GREEN}[p]${WHITE} PM2 Status         ${GREEN}[m]${WHITE} PM2 Monitor      ${GREEN}[f]${WHITE} Full Refresh       ${GREEN}[x]${WHITE} Expert Mode       ║${NC}"
  echo -e "${WHITE}╚════════════════════════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# 로그 뷰어
show_logs() {
  local service=$1
  local log_file=""

  case $service in
    "fastapi" | "api" | "backend") log_file="$LOG_DIR/fastapi.log" ;;
    "user-frontend" | "user" | "frontend") log_file="$LOG_DIR/user-frontend.log" ;;
    "admin-frontend" | "admin") log_file="$LOG_DIR/admin-frontend.log" ;;
    "database" | "db" | "postgres") log_file="$LOG_DIR/database.log" ;;
    *)
      echo -e "${RED}❌ Unknown service: $service${NC}"
      echo -e "${YELLOW}Available: fastapi, user-frontend, admin-frontend, database${NC}"
      read -p "Press Enter to continue..."
      return
      ;;
  esac

  if [ -f "$log_file" ]; then
    clear
    echo -e "${BLUE}📋 Viewing last 50 lines of $log_file${NC}"
    echo -e "${BLUE}Press 'q' to quit log view${NC}"
    echo "----------------------------------------"
    tail -50 "$log_file"
    echo "----------------------------------------"
    read -p "Press Enter to continue..."
  else
    echo -e "${RED}❌ Log file not found: $log_file${NC}"
    read -p "Press Enter to continue..."
  fi
}

# 서비스 재시작
restart_service() {
  local service=$1
  echo -e "${YELLOW}🔄 Restarting $service...${NC}"

  case $service in
    "all")
      if [ -f "./restart-all-services.sh" ]; then
        ./restart-all-services.sh
      else
        echo "⚠️ restart-all-services.sh not found"
      fi
      ;;
    "fastapi" | "api" | "backend")
      if [ -f "./restart-fastapi.sh" ]; then
        ./restart-fastapi.sh --bf
      else
        pm2 restart longrise-fastapi 2>/dev/null || echo "Service not found"
      fi
      ;;
    "user-frontend" | "user" | "frontend")
      if [ -f "./restart-user-frontend.sh" ]; then
        ./restart-user-frontend.sh --bf
      else
        pm2 restart longrise-user-frontend 2>/dev/null || echo "Service not found"
      fi
      ;;
    "admin-frontend" | "admin")
      if [ -f "./restart-admin-frontend.sh" ]; then
        ./restart-admin-frontend.sh --bf
      else
        pm2 restart longrise-admin-frontend 2>/dev/null || echo "Service not found"
      fi
      ;;
    "database" | "db" | "postgres" | "rds")
      echo "⚠️ AWS RDS는 직접 재시작할 수 없습니다. (AWS 관리형 서비스)"
      ;;
    *)
      echo -e "${RED}❌ Unknown service: $service${NC}"
      echo -e "${YELLOW}Available: all, fastapi, user-frontend, admin-frontend${NC}"
      echo -e "${GRAY}Note: RDS is managed by AWS and cannot be restarted locally${NC}"
      ;;
  esac

  echo -e "${GREEN}✅ Service restart command executed${NC}"
  sleep 2
  read -p "Press Enter to continue..."
}

# 키보드 입력 처리
handle_input() {
  local key=""
  read -n 1 key

  case $key in
    'q' | 'Q') cleanup ;;
    'r' | 'R')
      echo -e "\n${YELLOW}Enter service to restart: ${NC}"
      read -p "> " service
      restart_service "$service"
      ;;
    'l' | 'L')
      echo -e "\n${YELLOW}Enter service to view logs: ${NC}"
      read -p "> " service
      show_logs "$service"
      ;;
    's' | 'S')
      echo -e "\n${YELLOW}Enter service to start: ${NC}"
      read -p "> " service
      restart_service "$service"
      ;;
    'k' | 'K')
      echo -e "\n${YELLOW}Stopping all services...${NC}"
      if [ -f "./pm2-stop.sh" ]; then
        ./pm2-stop.sh
        echo -e "${GREEN}✅ All services stopped${NC}"
      else
        echo -e "${RED}❌ pm2-stop.sh not found${NC}"
      fi
      sleep 1
      read -p "Press Enter to continue..."
      ;;
    'c' | 'C')
      echo -e "\n${YELLOW}Clearing all log files...${NC}"
      rm -f "$LOG_DIR"/*.log
      echo -e "${GREEN}✅ Log files cleared${NC}"
      read -p "Press Enter to continue..."
      ;;
    'p' | 'P')
      clear
      echo -e "${BLUE}📊 PM2 Status:${NC}\n"
      pm2 status
      echo ""
      read -p "Press Enter to continue..."
      ;;
    'm' | 'M')
      clear
      echo -e "${BLUE}📈 Launching PM2 Monitor (Press Ctrl+C to exit)...${NC}"
      sleep 1
      pm2 monit
      ;;
    'd' | 'D')
      clear
      echo -e "${BLUE}🐳 Docker Container Status:${NC}\n"
      docker ps -a
      echo ""
      read -p "Press Enter to continue..."
      ;;
    'f' | 'F')
      echo -e "\n${YELLOW}🔄 Full refresh...${NC}"
      FIRST_RUN=true
      ;;
    'x' | 'X')
      clear
      echo -e "${BLUE}🔧 Expert Mode - Quick Commands:${NC}\n"
      echo -e "${CYAN}PM2 Commands:${NC}"
      echo "  pm2 status          - Show PM2 processes"
      echo "  pm2 logs            - Show all logs"
      echo "  pm2 restart all     - Restart all PM2 processes"
      echo -e "\n${CYAN}Docker Commands:${NC}"
      echo "  docker ps           - Show running containers"
      echo "  docker logs [name]  - Show container logs"
      echo "  docker restart [name] - Restart container"
      echo -e "\n${CYAN}Service URLs:${NC}"
      echo "  http://localhost:8000/health  - FastAPI Health"
      echo "  http://localhost:8000/docs    - FastAPI Docs"
      echo "  http://localhost:5173         - User Frontend"
      echo "  http://localhost:5174         - Admin Frontend"
      echo ""
      read -p "Press Enter to continue..."
      ;;
    'h' | 'H')
      clear
      echo -e "${BLUE}📚 Longrise Monitor Help:${NC}\n"
      echo -e "${YELLOW}Commands:${NC}"
      echo -e "  r - Restart service (all, fastapi, user-frontend, admin-frontend, database)"
      echo -e "  l - View logs (fastapi, user-frontend, admin-frontend, database)"
      echo -e "  s - Start service (same options as restart)"
      echo -e "  k - Stop all services via pm2-stop.sh"
      echo -e "  c - Clear all log files"
      echo -e "  p - Show PM2 status"
      echo -e "  m - Launch PM2 monitor (real-time)"
      echo -e "  d - Show Docker container status"
      echo -e "  f - Force full refresh"
      echo -e "  x - Expert mode (show useful commands)"
      echo -e "  q - Quit monitor"
      echo ""
      read -p "Press Enter to continue..."
      ;;
  esac
}

# 메인 실행 함수
main() {
  setup_keyboard

  echo -e "${GREEN}🚀 Starting Longrise Platform Monitor...${NC}"
  echo -e "${YELLOW}Press 'h' for help, 'q' to quit${NC}"
  sleep 2

  # 초기 컨트롤 메뉴 표시
  print_controls

  while true; do
    local current_time=$(date +%s)

    # 30초마다 전체 새로고침, 그 외에는 부분 업데이트
    if [ "$FIRST_RUN" = true ] || [ $((current_time - LAST_FULL_REFRESH)) -ge $FULL_REFRESH_INTERVAL ]; then
      print_initial_table
      if [ "$FIRST_RUN" = true ]; then
        FIRST_RUN=false
      fi
      LAST_FULL_REFRESH=$current_time
      # 상태 배열 초기화
      unset PREV_LOCAL_STATUS
      unset PREV_AWS_STATUS
      unset PREV_RESTART_STATUS
      declare -a PREV_LOCAL_STATUS
      declare -a PREV_AWS_STATUS
      declare -a PREV_RESTART_STATUS
      PREV_SYSTEM_INFO=""
    else
      # 부분 업데이트 (정확한 라인 번호로)
      update_display
    fi

    # 비차단 키 입력 확인
    if read -t 0; then
      handle_input
      # 입력 후 즉시 전체 새로고침
      print_initial_table
      LAST_FULL_REFRESH=$(date +%s)
    fi

    sleep $INTERVAL
  done
}

# jq가 없는 경우 대체 함수
pm2_status_fallback() {
  local app_name=$1
  local pm2_list=$(pm2 list 2>/dev/null | grep "$app_name" | head -1)

  if [ -n "$pm2_list" ]; then
    if echo "$pm2_list" | grep -q "online"; then
      echo "online"
    elif echo "$pm2_list" | grep -q "stopped"; then
      echo "stopped"
    elif echo "$pm2_list" | grep -q "error"; then
      echo "errored"
    else
      echo "unknown"
    fi
  else
    echo ""
  fi
}

# jq 설치 확인 및 대체 로직
check_dependencies() {
  if ! command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Warning: jq not found. Installing via npm...${NC}"
    if command -v npm >/dev/null 2>&1; then
      npm install -g jq 2>/dev/null || echo -e "${RED}Failed to install jq. Some features may be limited.${NC}"
    fi
  fi
}

# 의존성 확인
check_dependencies

# 스크립트 시작
main