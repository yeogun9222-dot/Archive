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


def _check_credit_health():
    from .db import get_anthropic_credit_remaining
    from .anthropic_billing import check_api_health
    from .telegram_bot import send_message

    # 1. 예상 잔액 기반 경고
    credit = get_anthropic_credit_remaining()
    if credit.get("available") and credit.get("warning"):
        remaining = credit.get("remaining", 0)
        days = credit.get("days_remaining")
        msg = f"⚠️ [크레딧 경고] Anthropic 예상 잔액: ${remaining}"
        if days is not None:
            msg += f" (약 {days}일 후 소진 예상)"
        msg += "\n👉 console.anthropic.com에서 크레딧 충전 후 대시보드에 잔액 업데이트해주세요."
        send_message(msg)
        return

    # 2. 잔액 정보 없으면 canary 호출로 실제 가용 여부 확인
    result = check_api_health()
    if not result.get("healthy"):
        status = result.get("status", "알 수 없음")
        action = result.get("action", "")
        msg = f"🚨 [긴급] Anthropic API 이상: {status}"
        if action:
            msg += f"\n👉 {action}"
        send_message(msg)
        print(f"[Scheduler] 크레딧 경고 발송: {status}")


def _credit_check_loop():
    # 시작 후 10분 뒤 첫 점검, 이후 2시간 간격
    time.sleep(600)
    while True:
        _check_credit_health()
        time.sleep(2 * 3600)


def _scheduler_loop():
    while True:
        wait = _seconds_until_9am_kst()
        print(f"[Scheduler] 다음 일간 리포트까지 {wait / 3600:.1f}시간")
        time.sleep(wait)
        _run_daily_report()


def start_scheduler_thread():
    t = threading.Thread(target=_scheduler_loop, daemon=True)
    t.start()
    t2 = threading.Thread(target=_credit_check_loop, daemon=True)
    t2.start()
    return t
