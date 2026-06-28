import os
import threading
import time
import urllib.request
import urllib.error
import subprocess
import json
from datetime import datetime
from .telegram import send_message
from .db import get_conn

CHECK_INTERVAL = 300  # 5분마다 체크
OPENWEBUI_ENABLED = os.getenv("OPENWEBUI_ENABLED", "false").lower() == "true"

# 이전 상태 저장 (변화가 생길 때만 알림)
_prev_status = {}

def check_openwebui():
    try:
        req = urllib.request.Request("http://open-webui:8080", method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 301, 302), "정상"
    except Exception as e:
        return False, str(e)[:80]

def check_jake_api():
    try:
        with urllib.request.urlopen("http://localhost:8000/health", timeout=10) as resp:
            return resp.status == 200, "정상"
    except Exception as e:
        return False, str(e)[:80]

def check_postgres():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return True, "정상"
    except Exception as e:
        return False, str(e)[:80]

def check_docker_containers():
    results = {}
    for name in ["open-webui", "jake-agent", "jake-postgres"]:
        try:
            out = subprocess.check_output(
                ["docker", "inspect", "--format", "{{.State.Status}}", name],
                timeout=10, stderr=subprocess.DEVNULL
            ).decode().strip()
            results[name] = (out == "running", out)
        except Exception:
            results[name] = (False, "없음")
    return results

def get_token_usage_today():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT COALESCE(SUM(input_tokens), 0), COALESCE(SUM(output_tokens), 0)
            FROM token_usage
            WHERE DATE(created_at) = CURRENT_DATE
        """)
        row = cur.fetchone()
        cur.close()
        conn.close()
        return row[0], row[1]
    except Exception:
        return 0, 0

def ensure_token_table():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS token_usage (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP DEFAULT NOW(),
                agent VARCHAR(50),
                input_tokens INT DEFAULT 0,
                output_tokens INT DEFAULT 0,
                api_error TEXT
            )
        """)
        cur.execute("ALTER TABLE token_usage ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'claude-sonnet-4-6'")
        conn.commit()
        cur.close()
        conn.close()
    except Exception:
        pass

def log_token_usage(agent: str, input_tokens: int, output_tokens: int, error: str = None, model: str = "claude-sonnet-4-6"):
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO token_usage (agent, input_tokens, output_tokens, api_error, model) VALUES (%s, %s, %s, %s, %s)",
            (agent, input_tokens, output_tokens, error, model)
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception:
        pass

def run_health_check():
    global _prev_status
    alerts = []

    # 1. OpenWebUI 체크 (OPENWEBUI_ENABLED=true 일 때만)
    if OPENWEBUI_ENABLED:
        ok, msg = check_openwebui()
        key = "openwebui"
        if _prev_status.get(key) != ok:
            if not ok:
                alerts.append(f"🔴 *OpenWebUI 접속 불가*\n원인: {msg}\n→ open-webui 컨테이너 확인 필요")
            elif key in _prev_status:
                alerts.append(f"🟢 *OpenWebUI 복구됨*")
            _prev_status[key] = ok

    # 2. Jake API 체크
    ok, msg = check_jake_api()
    key = "jake_api"
    if _prev_status.get(key) != ok:
        if not ok:
            alerts.append(f"🔴 *Jake API 중단*\n원인: {msg}\n→ docker restart jake-agent 필요")
        elif key in _prev_status:
            alerts.append(f"🟢 *Jake API 복구됨*\n→ http://localhost:8000 정상")
        _prev_status[key] = ok

    # 3. PostgreSQL 체크
    ok, msg = check_postgres()
    key = "postgres"
    if _prev_status.get(key) != ok:
        if not ok:
            alerts.append(f"🔴 *PostgreSQL 연결 불가*\n원인: {msg}\n→ docker restart jake-postgres 필요")
        elif key in _prev_status:
            alerts.append(f"🟢 *PostgreSQL 복구됨*")
        _prev_status[key] = ok

    # 4. Docker 컨테이너 체크 (docker CLI 없는 환경에선 스킵)

    # 5. 토큰 사용량 (하루 1회 오전 9시 근처 리포트)
    now = datetime.now()
    if now.hour == 9 and now.minute < 10:
        input_t, output_t = get_token_usage_today()
        if input_t > 0 or output_t > 0:
            cost = (input_t / 1_000_000 * 3) + (output_t / 1_000_000 * 15)
            alerts.append(
                f"📈 *오늘 API 사용량*\n"
                f"입력: {input_t:,} 토큰\n"
                f"출력: {output_t:,} 토큰\n"
                f"예상 비용: ${cost:.3f}"
            )

    for alert in alerts:
        send_message(alert)

def _silent_init():
    """시작 시 현재 상태를 알림 없이 기록 — 이후부터 변화만 알림"""
    global _prev_status
    if OPENWEBUI_ENABLED:
        ok, _ = check_openwebui()
        _prev_status["openwebui"] = ok
    ok, _ = check_jake_api()
    _prev_status["jake_api"] = ok
    ok, _ = check_postgres()
    _prev_status["postgres"] = ok
    print(f"[Monitor] 초기 상태 기록 완료: {_prev_status}")


def start_monitor_thread():
    ensure_token_table()

    def loop():
        time.sleep(60)
        _silent_init()
        while True:
            try:
                run_health_check()
            except Exception as e:
                print(f"Monitor error: {e}")
            time.sleep(CHECK_INTERVAL)

    thread = threading.Thread(target=loop, daemon=True)
    thread.start()
    return thread
