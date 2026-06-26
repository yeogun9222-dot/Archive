@echo off
echo [Jake Agent] 자동 빌드 감시 시작...
echo 코드 변경 시 자동으로 빌드하고 재시작합니다.
echo 종료하려면 Ctrl+C 를 누르세요.
echo.
cd /d "%~dp0"
docker compose watch
