import os
import requests
import anthropic
from datetime import datetime, timezone

# Anthropic Console의 "조직 설정 > API 키"에서 발급하는 Admin API 키 (일반 ANTHROPIC_API_KEY와는 별개 권한)
ADMIN_KEY_ENV = "ANTHROPIC_ADMIN_KEY"

LOW_CREDIT_THRESHOLD_USD = 2.0  # 이 금액 이하면 경고


def check_api_health() -> dict:
    """Anthropic API 접근 가능 여부 확인 (크레딧 소진 조기 감지).
    Haiku 최소 호출로 실제 API 가용 여부를 테스트한다."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"healthy": False, "status": "ANTHROPIC_API_KEY 미설정"}
    try:
        client = anthropic.Anthropic(api_key=api_key)
        client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1,
            messages=[{"role": "user", "content": "1"}],
        )
        return {"healthy": True, "status": "정상"}
    except anthropic.BadRequestError as e:
        err = str(e)
        if "credit balance is too low" in err:
            return {"healthy": False, "status": "크레딧 소진", "action": "console.anthropic.com → Plans & Billing에서 크레딧 충전 필요"}
        return {"healthy": False, "status": f"API 오류: {err}"}
    except Exception as e:
        return {"healthy": False, "status": f"알 수 없는 오류: {e}"}


def get_anthropic_actual_cost_this_month() -> dict:
    """Anthropic Cost Report API로 이번 달 실제 청구액(콘솔 결제 기준)을 조회.
    by_persona 추정치(token_usage 기반)와 별개로, 진짜 청구 금액을 보여주는 교차검증용."""
    admin_key = os.getenv(ADMIN_KEY_ENV, "")
    if not admin_key:
        return {"available": False, "reason": "ANTHROPIC_ADMIN_KEY 미설정 — Console에서 Admin API 키 발급 후 .env에 추가 필요"}

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    try:
        resp = requests.get(
            "https://api.anthropic.com/v1/organizations/cost_report",
            headers={"x-api-key": admin_key, "anthropic-version": "2023-06-01"},
            params={
                "starting_at": month_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "ending_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "limit": 31,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        total = 0.0
        for bucket in data.get("data", []):
            for item in bucket.get("results", []):
                amount = item.get("amount", {})
                value = amount.get("value") if isinstance(amount, dict) else amount
                total += float(value or 0)

        return {"available": True, "actual_cost_usd": round(total, 4), "month": month_start.strftime("%Y%m")}
    except Exception as e:
        return {"available": False, "reason": f"Anthropic Cost Report API 조회 실패: {e}"}
