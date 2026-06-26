import json
import urllib.request
from langchain_core.tools import tool


@tool
def get_exchange_rate(from_currency: str, to_currency: str, amount: float = 1.0) -> str:
    """실시간 환율을 조회합니다.
    from_currency: 기준 통화 코드 (USD, KRW, EUR, JPY, VND, THB, CNY 등)
    to_currency: 변환할 통화 코드
    amount: 변환할 금액 (기본값 1)
    예) from_currency='USD', to_currency='KRW', amount=100
    """
    try:
        base = from_currency.upper()
        target = to_currency.upper()
        url = f"https://open.er-api.com/v6/latest/{base}"
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        if data.get("result") != "success":
            return f"환율 조회 실패: {data.get('error-type', '알 수 없는 오류')}"

        rates = data.get("rates", {})
        if target not in rates:
            available = ", ".join(list(rates.keys())[:20])
            return f"지원하지 않는 통화 코드: {target}\n사용 가능 예시: {available}"

        rate = rates[target]
        converted = rate * amount
        updated = data.get("time_last_update_utc", "알 수 없음")

        return (
            f"환율 정보\n"
            f"1 {base} = {rate:,.4f} {target}\n"
            f"{amount:,.2f} {base} = {converted:,.2f} {target}\n"
            f"업데이트: {updated}"
        )
    except Exception as e:
        return f"환율 조회 오류: {e}"


@tool
def search_flights(departure: str, destination: str, date: str, adults: int = 1, cabin_class: str = "이코노미") -> str:
    """항공권 정보를 검색합니다.
    departure: 출발지 도시명 또는 공항코드 (예: 인천, ICN, 서울, 김포)
    destination: 도착지 (예: 다낭, DAD, 방콕, BKK, 도쿄, NRT)
    date: 출발일 (예: 2025-06-29, 6월29일)
    adults: 성인 인원수 (기본값 1)
    cabin_class: 이코노미/비즈니스/일등석 (기본값 이코노미)
    """
    try:
        from duckduckgo_search import DDGS

        query = f"{departure} {destination} {date} 항공권 직항 {adults}인 {cabin_class} 가격"
        results = []
        with DDGS() as ddgs:
            results = list(ddgs.text(query, region="kr-kr", max_results=6))

        if not results:
            return (
                f"{departure} → {destination} ({date}) 항공권 검색 결과가 없습니다.\n"
                f"직접 확인: 스카이스캐너(skyscanner.co.kr), 네이버 항공, 카약(kayak.co.kr)"
            )

        lines = [f"항공권 검색: {departure} → {destination} | {date} | 성인 {adults}명 | {cabin_class}\n"]
        for r in results[:5]:
            title = r.get("title", "")
            body = r.get("body", "")[:250]
            href = r.get("href", "")
            lines.append(f"• {title}\n  {body}\n  {href}")

        lines.append(
            "\n실시간 최저가 비교 사이트:\n"
            "- 스카이스캐너: skyscanner.co.kr\n"
            "- 네이버 항공: flight.naver.com\n"
            "- 카약: kayak.co.kr"
        )
        return "\n\n".join(lines)
    except Exception as e:
        return f"항공권 검색 오류: {e}"


def get_all_external_tools():
    return [get_exchange_rate, search_flights]
