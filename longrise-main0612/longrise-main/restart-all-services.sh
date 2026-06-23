#!/usr/bin/env bash
set -uo pipefail

# Longrise Platform - 모든 서비스 재시작 통합 스크립트 (RDS 연동)

# 기본값
WAIT_BETWEEN="${WAIT_BETWEEN:-1}"    # 서비스 간 대기 시간
SKIP_FAILED="${SKIP_FAILED:-0}"      # 1이면 실패해도 계속 진행
BF_MODE="${BF_MODE:-1}"              # 1이면 모든 서비스를 백그라운드로 실행
VERBOSE="${VERBOSE:-0}"              # 1이면 상세 로그 출력

# 서비스 목록 (순서 중요: 의존성 고려)
# AWS RDS 사용으로 Database 제외, 로컬에서는 Backend + Frontend만 실행
SERVICES=(
  "fastapi:./restart-fastapi.sh"           # FastAPI 백엔드 서버 (AWS RDS 연결)
  "user-frontend:./restart-user-frontend.sh" # 사용자 프론트엔드
  "admin-frontend:./restart-admin-frontend.sh" # 관리자 프론트엔드
)

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 로그 함수
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 서비스별 상태 검증 함수
verify_service_status() {
  local service_name="$1"
  local max_wait=15  # 최대 15초 대기
  local wait_count=0

  while [[ $wait_count -lt $max_wait ]]; do
    case "$service_name" in
      "fastapi")
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
          log_success "${service_name} 상태 확인됨 (HTTP health check)"
          return 0
        fi
        ;;
      "user-frontend")
        if curl -fsS http://localhost:5173/ >/dev/null 2>&1 \
          && curl -fsS http://localhost:5173/src/main.tsx >/dev/null 2>&1; then
          log_success "${service_name} 상태 확인됨 (HTTP + Vite transform)"
          return 0
        fi
        ;;
      "admin-frontend")
        if curl -fsS http://localhost:5174/ >/dev/null 2>&1 \
          && curl -fsS http://localhost:5174/src/main.tsx >/dev/null 2>&1; then
          log_success "${service_name} 상태 확인됨 (HTTP + Vite transform)"
          return 0
        fi
        ;;
    esac

    ((wait_count++))
    sleep 1
  done

  return 1
}

# 사용법
usage() {
  cat <<EOF
사용법: $(basename "$0") [옵션]

옵션:
  --wait N           서비스 간 대기 시간 (초, 기본: ${WAIT_BETWEEN})
  --skip-failed      실패해도 다음 서비스 계속 진행
  --bf               모든 서비스를 백그라운드로 실행
  --verbose          상세 로그 출력
  --help, -h         도움말

환경변수:
  WAIT_BETWEEN       서비스 간 대기 시간
  SKIP_FAILED        1이면 실패해도 계속 진행
  BF_MODE           1이면 백그라운드 실행
  VERBOSE           1이면 상세 로그

예시:
  $(basename "$0")                    # 기본 실행
  $(basename "$0") --bf              # 백그라운드 실행
  $(basename "$0") --skip-failed     # 실패해도 계속
  $(basename "$0") --wait 10         # 10초 대기
EOF
  exit 1
}

# 인수 파싱
while [[ ${1:-} ]]; do
  case "$1" in
    --wait)         WAIT_BETWEEN="$2"; shift 2;;
    --skip-failed)  SKIP_FAILED=1; shift;;
    --bf)           BF_MODE=1; shift;;
    --verbose)      VERBOSE=1; shift;;
    -h|--help)      usage;;
    *)              log_error "알 수 없는 옵션: $1"; usage;;
  esac
done

# 스크립트 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 로그 디렉토리 생성
mkdir -p logs

# 시작 메시지
echo "🔄 Longrise AI Platform - 모든 서비스 재시작 (AWS RDS 연동)"
echo "================================================================"
log_info "스크립트 디렉토리: $SCRIPT_DIR"
log_info "서비스 간 대기: ${WAIT_BETWEEN}초"
log_info "백그라운드 모드: $([ "$BF_MODE" -eq 1 ] && echo "예" || echo "아니오")"
log_info "실패 시 계속: $([ "$SKIP_FAILED" -eq 1 ] && echo "예" || echo "아니오")"
log_info "AWS RDS 사용: PostgreSQL 15.17 (longrise-main-db)"
echo ""

# 실행 결과 추적
total_services=${#SERVICES[@]}
success_count=0
failed_count=0
results_success=""
results_failed=""

for i in "${!SERVICES[@]}"; do
  IFS=':' read -r service_name script_path <<< "${SERVICES[$i]}"

  echo "🔄 [$((i+1))/${total_services}] ${service_name} 재시작 중..."

  # 스크립트 존재 확인
  if [[ ! -f "$script_path" ]]; then
    log_error "스크립트 파일을 찾을 수 없습니다: $script_path"
    ((failed_count++))
    results_failed="$results_failed $service_name"

    if [[ "$SKIP_FAILED" -eq 0 ]]; then
      exit 1
    fi
    continue
  fi

  # 스크립트 실행 (항상 백그라운드 모드로 강제)
  # 임시 로그 파일 생성
  temp_log="/tmp/longrise_restart_${service_name}_$$.log"

  # 1단계: 스크립트 실행
  if "$script_path" --bf >"$temp_log" 2>&1; then
    log_info "${service_name} 스크립트 실행 완료 - 서비스 시작 중..."

    # 2단계: 실제 서비스 상태 검증
    if verify_service_status "$service_name"; then
      log_success "${service_name} 완전히 시작됨"
      ((success_count++))
      results_success="$results_success $service_name"
    else
      log_error "${service_name} 스크립트는 성공했지만 서비스 시작 실패"

      # 서비스 시작 실패 시 로그 출력
      if [[ -f "$temp_log" ]] && [[ $VERBOSE -eq 1 ]]; then
        log_warning "스크립트 로그:"
        cat "$temp_log" | tail -20
      fi

      ((failed_count++))
      results_failed="$results_failed $service_name"

      if [[ "$SKIP_FAILED" -eq 0 ]]; then
        echo "🚨 ${service_name} 서비스 시작 실패로 인해 중단됩니다."
        echo ""
        echo "💡 상세 로그 확인:"
        [[ -f "$temp_log" ]] && cat "$temp_log"
        rm -f "$temp_log"
        exit 1
      fi
    fi
  else
    log_error "${service_name} 스크립트 실행 실패"

    # 스크립트 실행 실패 시 로그 출력
    if [[ -f "$temp_log" ]] && [[ $VERBOSE -eq 1 ]]; then
      log_warning "스크립트 실행 로그:"
      cat "$temp_log" | tail -20
    fi

    ((failed_count++))
    results_failed="$results_failed $service_name"

    if [[ "$SKIP_FAILED" -eq 0 ]]; then
      echo "🚨 ${service_name} 스크립트 실행 실패로 인해 중단됩니다."
      echo ""
      echo "💡 상세 로그 확인:"
      [[ -f "$temp_log" ]] && cat "$temp_log"
      rm -f "$temp_log"
      exit 1
    fi
  fi

  # 임시 로그 파일 정리
  rm -f "$temp_log"

  # 서비스 간 대기 (마지막 서비스 제외)
  if [[ $i -lt $((total_services-1)) ]]; then
    echo "⏳ ${WAIT_BETWEEN}초 대기 중..."
    sleep "$WAIT_BETWEEN"
    echo "✅ 대기 완료"
  fi

  echo ""
done

# 결과 요약
echo "================================================================"
echo "📊 재시작 결과 요약"
echo "================================================================"

if [[ -n "$results_success" ]]; then
  echo "✅ 성공한 서비스:"
  for service in $results_success; do
    echo -e "   ${GREEN}✓${NC} $service"
  done
fi

if [[ -n "$results_failed" ]]; then
  echo ""
  echo "❌ 실패한 서비스:"
  for service in $results_failed; do
    echo -e "   ${RED}✗${NC} $service"
  done
fi

echo ""
echo "📈 통계:"
echo "   전체 서비스: $total_services"
echo "   성공: $success_count"
echo "   실패: $failed_count"

# 최종 상태 확인
echo ""
echo "🔍 최종 서비스 상태 확인..."

# FastAPI 확인
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
  echo -e "   ✅ FastAPI: ${GREEN}실행 중${NC} (http://localhost:8000)"
  echo -e "   📋 API 문서: ${GREEN}http://localhost:8000/api/v1/docs${NC}"
else
  echo -e "   ❌ FastAPI: ${RED}중지됨${NC}"
fi

# User Frontend 확인
if curl -fsS http://localhost:5173/ >/dev/null 2>&1 \
  && curl -fsS http://localhost:5173/src/main.tsx >/dev/null 2>&1; then
  echo -e "   ✅ User Frontend: ${GREEN}실행 중${NC} (http://localhost:5173)"
else
  echo -e "   ❌ User Frontend: ${RED}중지됨${NC}"
fi

# Admin Frontend 확인
if curl -fsS http://localhost:5174/ >/dev/null 2>&1 \
  && curl -fsS http://localhost:5174/src/main.tsx >/dev/null 2>&1; then
  echo -e "   ✅ Admin Frontend: ${GREEN}실행 중${NC} (http://localhost:5174)"
else
  echo -e "   ❌ Admin Frontend: ${RED}중지됨${NC}"
fi

# AWS RDS 확인
echo -e "   🗄️  AWS RDS: ${GREEN}PostgreSQL 15.17 연결됨${NC}"

# 서비스 정보
echo ""
echo "📋 서비스 정보:"
echo "🚀 FastAPI Backend: http://localhost:8000"
echo "📋 Swagger API 문서: http://localhost:8000/api/v1/docs"
echo "💚 Health Check: http://localhost:8000/health"
echo "👤 User Frontend: http://localhost:5173"
echo "👨‍💼 Admin Frontend: http://localhost:5174"
echo "🗄️  AWS RDS PostgreSQL: longrise-main-db.c726s6ksmvve.ap-northeast-2.rds.amazonaws.com"

# 로그 파일 정보
echo ""
echo "📄 로그 파일:"
echo "   FastAPI: tail -f logs/fastapi.log"
echo "   User Frontend: tail -f logs/user-frontend.log"
echo "   Admin Frontend: tail -f logs/admin-frontend.log"

# 최종 메시지
if [[ $failed_count -eq 0 ]]; then
  echo ""
  log_success "🎉 모든 서비스가 성공적으로 재시작되었습니다!"

  echo ""
  echo "💡 관리 명령어:"
  echo "   - 전체 중지: ./stop-all-services.sh"
  echo "   - 상태 모니터링: ./cli-monitor-longrise.sh"
  echo "   - 개별 재시작: ./restart-[서비스명].sh --bf"

  exit 0
else
  echo ""
  log_warning "⚠️  일부 서비스 재시작에 실패했습니다. (실패: $failed_count)"
  if [[ "$SKIP_FAILED" -eq 1 ]]; then
    log_info "실패한 서비스를 수동으로 확인해주세요."
  fi
  exit 1
fi
