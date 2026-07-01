from langchain_core.tools import tool
from .db import get_conn


def _query(sql, params=()):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows


def _calc_cost(input_tokens: int, output_tokens: int) -> float:
    """claude-sonnet-4-6 기준: input $3/1M, output $15/1M"""
    return (input_tokens / 1_000_000 * 3) + (output_tokens / 1_000_000 * 15)


@tool
def get_api_cost_today() -> str:
    """오늘 API 토큰 사용량과 예상 비용을 조회합니다."""
    try:
        rows = _query("""
            SELECT agent,
                   COALESCE(SUM(input_tokens), 0),
                   COALESCE(SUM(output_tokens), 0)
            FROM token_usage
            WHERE DATE(created_at) = CURRENT_DATE
            GROUP BY agent
            ORDER BY SUM(input_tokens + output_tokens) DESC
        """)
        if not rows:
            return "오늘 API 사용 기록 없음."

        lines = ["[오늘 API 사용량]"]
        total_in, total_out = 0, 0
        for agent, inp, out in rows:
            cost = _calc_cost(inp, out)
            lines.append(f"  {agent}: 입력 {inp:,} / 출력 {out:,} 토큰 → ${cost:.4f}")
            total_in += inp
            total_out += out

        total_cost = _calc_cost(total_in, total_out)
        lines.append(f"\n합계: 입력 {total_in:,} / 출력 {total_out:,} 토큰")
        lines.append(f"오늘 총 예상 비용: ${total_cost:.4f} (약 ₩{total_cost * 1380:.0f})")
        return "\n".join(lines)
    except Exception as e:
        return f"조회 오류: {e}"


@tool
def get_api_cost_report(period: str = "week") -> str:
    """기간별 API 비용 리포트. period: week(7일), month(30일)"""
    try:
        days = 30 if period == "month" else 7
        rows = _query(f"""
            SELECT DATE(created_at) as day,
                   COALESCE(SUM(input_tokens), 0),
                   COALESCE(SUM(output_tokens), 0)
            FROM token_usage
            WHERE created_at >= NOW() - INTERVAL '{days} days'
            GROUP BY day
            ORDER BY day DESC
        """)
        if not rows:
            return f"최근 {days}일간 사용 기록 없음."

        lines = [f"[최근 {days}일 일별 API 비용]"]
        total_cost = 0
        for day, inp, out in rows:
            cost = _calc_cost(inp, out)
            total_cost += cost
            lines.append(f"  {day}: ${cost:.4f} (입력 {inp:,} / 출력 {out:,})")

        lines.append(f"\n{days}일 누적 비용: ${total_cost:.4f} (약 ₩{total_cost * 1380:.0f})")
        return "\n".join(lines)
    except Exception as e:
        return f"조회 오류: {e}"


@tool
def get_cost_by_persona() -> str:
    """팀원별 누적 API 비용을 비교합니다."""
    try:
        rows = _query("""
            SELECT agent,
                   COALESCE(SUM(input_tokens), 0),
                   COALESCE(SUM(output_tokens), 0),
                   COUNT(*) as calls
            FROM token_usage
            GROUP BY agent
            ORDER BY SUM(input_tokens + output_tokens) DESC
        """)
        if not rows:
            return "누적 사용 기록 없음."

        lines = ["[팀원별 누적 API 비용]"]
        for agent, inp, out, calls in rows:
            cost = _calc_cost(inp, out)
            lines.append(f"  {agent}: ${cost:.4f} ({calls}회 호출, 총 {inp+out:,} 토큰)")
        return "\n".join(lines)
    except Exception as e:
        return f"조회 오류: {e}"


@tool
def get_credit_remaining() -> str:
    """Anthropic 크레딧 예상 잔액과 소진 예상일을 조회합니다."""
    from .db import get_anthropic_credit_remaining
    r = get_anthropic_credit_remaining()
    if not r.get("available"):
        return f"⚠️ {r.get('reason', '잔액 정보 없음')} — 대시보드 비용관리에서 충전 금액을 입력해주세요."
    lines = [
        f"[Anthropic 크레딧 현황]",
        f"  충전액: ${r['topup_amount']} (기준일: {r['topup_date']})",
        f"  사용액: ${r['used']}",
        f"  예상 잔액: ${r['remaining']}",
    ]
    if r.get("days_remaining") is not None:
        lines.append(f"  소진 예상: 약 {r['days_remaining']}일 후")
    if r.get("warning"):
        lines.append("  ⚠️ 잔액 $2 이하 — 충전 필요!")
    return "\n".join(lines)


@tool
def check_credit_status() -> str:
    """Anthropic API 크레딧 상태를 확인합니다. API 호출이 가능한지 즉시 점검합니다."""
    from .anthropic_billing import check_api_health
    result = check_api_health()
    if result.get("healthy"):
        return "✅ Anthropic API 정상 — 크레딧 사용 가능"
    status = result.get("status", "알 수 없음")
    action = result.get("action", "")
    msg = f"⚠️ Anthropic API 이상: {status}"
    if action:
        msg += f"\n👉 {action}"
    return msg


def get_all_luna_tools():
    return [get_api_cost_today, get_api_cost_report, get_cost_by_persona, check_credit_status, get_credit_remaining]
