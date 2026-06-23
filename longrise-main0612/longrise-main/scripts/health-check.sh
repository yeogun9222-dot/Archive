#!/bin/bash
# LongRise Staging Health Check Script
# Verifies all services are running and accessible after deployment

set -e

# Configuration
EC2_HOST="${1:-localhost}"
TIMEOUT="${2:-10}"
RETRY_COUNT="${3:-3}"

echo "🏥 Starting LongRise health checks for host: $EC2_HOST"
echo "⏱️ Timeout: ${TIMEOUT}s, Retries: ${RETRY_COUNT}"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Health check function with retry
check_service() {
    local service_name="$1"
    local url="$2"
    local method="${3:-GET}"

    echo -n "🔍 Checking $service_name... "

    for i in $(seq 1 $RETRY_COUNT); do
        if [ "$method" = "HEAD" ]; then
            if curl -f -s --connect-timeout $TIMEOUT -I "$url" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ PASS${NC}"
                return 0
            fi
        else
            if curl -f -s --connect-timeout $TIMEOUT "$url" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ PASS${NC}"
                return 0
            fi
        fi

        if [ $i -lt $RETRY_COUNT ]; then
            echo -n "⏳ Retry $i/$RETRY_COUNT... "
            sleep 2
        fi
    done

    echo -e "${RED}❌ FAIL${NC}"
    return 1
}

# Track overall status
OVERALL_STATUS=0

# 1. API Health Check
if ! check_service "API Health" "http://$EC2_HOST:8000/health"; then
    echo "   ❌ FastAPI backend is not responding"
    OVERALL_STATUS=1
fi

# 2. User Frontend Check
if ! check_service "User Frontend" "http://$EC2_HOST:5173" "HEAD"; then
    echo "   ❌ User frontend is not accessible"
    OVERALL_STATUS=1
fi

# 3. Admin Frontend Check
if ! check_service "Admin Frontend" "http://$EC2_HOST:5174" "HEAD"; then
    echo "   ❌ Admin frontend is not accessible"
    OVERALL_STATUS=1
fi

# 4. RumbleSurge API Check (if available)
if ! check_service "RumbleSurge API" "http://$EC2_HOST:4237/api/health"; then
    echo "   ⚠️  RumbleSurge API is not responding (may be normal)"
    # Don't fail overall status for RumbleSurge API
fi

echo "=============================================="

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical services are healthy!${NC}"
    echo "🌍 Services accessible at:"
    echo "   • User Frontend: http://$EC2_HOST:5173"
    echo "   • Admin Frontend: http://$EC2_HOST:5174"
    echo "   • API: http://$EC2_HOST:8000"
    exit 0
else
    echo -e "${RED}🚨 Some services are not healthy${NC}"
    echo "📋 Manual steps required:"
    echo "   1. Check PM2 status: pm2 status"
    echo "   2. Check service logs: pm2 logs"
    echo "   3. Restart failed services: pm2 restart <service-name>"
    echo "   4. Check firewall/security group settings"
    exit 1
fi