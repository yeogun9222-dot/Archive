@echo off
title Jake Agent - 자동 빌드 감시 중
color 0A

echo ================================================
echo   Jake Agent - AI 조직 시스템 시작
echo ================================================
echo.
echo  - 이 창을 닫지 마세요. (최소화는 OK)
echo  - 코드 변경 시 자동으로 빌드됩니다.
echo  - 종료하려면 이 창을 닫으세요.
echo.
echo ================================================
echo.

cd /d "E:\Claude\jake-agent"

echo [1/2] 컨테이너 시작 중...
docker compose up -d
echo.

echo [2/2] 자동 빌드 감시 시작...
echo.
docker compose watch
