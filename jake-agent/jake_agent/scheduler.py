import threading
import time
import json
import urllib.request
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))


def _seconds_until_9am_kst() -> float:
    now = datetime.now(KST)
    target = now.replace(hour=9, minute=0, second=0, microsecond=0)
    if now >= target:
        target += timedelta(days=1)
    return (target - now).total_seconds()


def _run_daily_report():
    from .telegram_bot import send_message
    try:
        payload = json.dumps({
            "message": (
                "일간 업무 리포트를 생성해줘. "
                "오늘 캘린더 일정, DB의 미완료 태스크, GitHub 이슈 현황을 포함해서 간결하게 정리해줘."
            ),
            "source": "scheduler"
        }).encode()
        req = urllib.request.Request(
            "http://localhost:8000/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode())
        send_message(f"[일간 리포트]\n{result.get('response', '생성 실패')}")
    except Exception as e:
        send_message(f"[일간 리포트 오류] {e}")


def _scheduler_loop():
    while True:
        wait = _seconds_until_9am_kst()
        print(f"[Scheduler] 다음 일간 리포트까지 {wait / 3600:.1f}시간")
        time.sleep(wait)
        _run_daily_report()


def start_scheduler_thread():
    t = threading.Thread(target=_scheduler_loop, daemon=True)
    t.start()
    return t
