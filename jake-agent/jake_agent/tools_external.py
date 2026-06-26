import json
import re
import urllib.request
import urllib.parse
import os
from datetime import datetime
from langchain_core.tools import tool


# ── 도시명 → IATA 공항 코드 매핑 ──
_CITY_TO_IATA = {
    # 한국
    "인천": "ICN", "서울": "ICN", "김포": "GMP",
    "부산": "PUS", "제주": "CJU", "대구": "TAE",
    # 동남아
    "다낭": "DAD", "하노이": "HAN", "호치민": "SGN",
    "방콕": "BKK", "푸켓": "HKT",
    "싱가포르": "SIN", "코타키나발루": "BKI", "쿠알라룸푸르": "KUL",
    "마닐라": "MNL", "세부": "CEB", "보라카이": "MPH",
    "발리": "DPS", "자카르타": "CGK",
    "양곤": "RGN", "프놈펜": "PNH",
    # 일본
    "도쿄": "TYO", "오사카": "KIX", "후쿠오카": "FUK",
    "삿포로": "CTS", "나고야": "NGO",
    # 중국
    "베이징": "PEK", "상하이": "PVG", "광저우": "CAN",
    # 기타 아시아
    "홍콩": "HKG", "타이베이": "TPE", "마카오": "MFM",
    # 미주/유럽
    "뉴욕": "JFK", "로스앤젤레스": "LAX", "샌프란시스코": "SFO",
    "파리": "CDG", "런던": "LHR", "프랑크푸르트": "FRA",
    # 오세아니아
    "시드니": "SYD", "멜버른": "MEL",
    # 태평양
    "괌": "GUM", "사이판": "SPN",
}

def _to_iata(name: str) -> str:
    """도시명 또는 IATA 코드를 표준 IATA 코드로 변환"""
    n = name.strip()
    if n.upper() in _CITY_TO_IATA.values():
        return n.upper()
    return _CITY_TO_IATA.get(n, n.upper())


def _parse_date_kiwi(date_str: str) -> str:
    """다양한 날짜 형식 → Kiwi API 형식(DD/MM/YYYY)으로 변환"""
    s = date_str.strip()

    # YYYY-MM-DD
    m = re.match(r'(\d{4})-(\d{1,2})-(\d{1,2})', s)
    if m:
        return f"{int(m.group(3)):02d}/{int(m.group(2)):02d}/{m.group(1)}"

    # M월D일 또는 MM월DD일
    m = re.match(r'(\d{1,2})월\s*(\d{1,2})일?', s)
    if m:
        month, day = int(m.group(1)), int(m.group(2))
        today = datetime.now()
        year = today.year
        if (month, day) < (today.month, today.day):
            year += 1
        return f"{day:02d}/{month:02d}/{year}"

    return s  # 변환 불가 시 원본 그대로


def _parse_date_iso(date_str: str) -> str:
    """다양한 날짜 형식 → ISO 형식(YYYY-MM-DD)으로 변환"""
    s = date_str.strip()

    # 이미 YYYY-MM-DD
    m = re.match(r'(\d{4})-(\d{1,2})-(\d{1,2})', s)
    if m:
        return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"

    # M월D일
    m = re.match(r'(\d{1,2})월\s*(\d{1,2})일?', s)
    if m:
        month, day = int(m.group(1)), int(m.group(2))
        today = datetime.now()
        year = today.year
        if (month, day) < (today.month, today.day):
            year += 1
        return f"{year}-{month:02d}-{day:02d}"

    return s


# ── 항공권 검색 ──

@tool
def search_flights(departure: str, destination: str, date: str, adults: int = 1, direct_only: bool = True) -> str:
    """항공권을 상세하게 검색합니다.
    departure: 출발지 도시명 또는 공항코드 (예: 인천, ICN, 다낭, DAD)
    destination: 도착지 (예: 인천, ICN, 다낭, DAD)
    date: 출발일 (예: 2026-06-29, 6월29일)
    adults: 성인 인원수 (기본값 1)
    direct_only: True이면 직항만 (기본값 True)
    """
    rapidapi_key = os.getenv("RAPIDAPI_KEY", "")
    kiwi_key = os.getenv("KIWI_API_KEY", "")
    from_iata = _to_iata(departure)
    to_iata = _to_iata(destination)

    if rapidapi_key:
        return _search_skyscanner_rapidapi(from_iata, to_iata, departure, destination, date, adults, direct_only, rapidapi_key)
    elif kiwi_key:
        return _search_kiwi(from_iata, to_iata, date, adults, direct_only, kiwi_key)
    else:
        return _search_fallback(departure, destination, date, adults, direct_only, from_iata, to_iata)


def _search_kiwi(from_iata, to_iata, date, adults, direct_only, api_key):
    """Kiwi.com Tequila API 실시간 항공권 검색"""
    try:
        date_fmt = _parse_date_kiwi(date)
        params = {
            "fly_from": from_iata,
            "fly_to": to_iata,
            "date_from": date_fmt,
            "date_to": date_fmt,
            "adults": str(adults),
            "direct_flights": "1" if direct_only else "0",
            "curr": "KRW",
            "sort": "price",
            "limit": "8",
            "locale": "ko",
        }
        url = "https://api.tequila.kiwi.com/v2/search?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"apikey": api_key})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        flights = data.get("data", [])
        if not flights:
            return (
                f"{from_iata} → {to_iata} ({date}) 직항 검색 결과가 없습니다.\n"
                f"직접 확인: skyscanner.co.kr / kr.trip.com"
            )

        lines = [f"항공권 검색 결과: {from_iata} → {to_iata} | {date} | 성인 {adults}명\n"]

        airline_map = {
            "KE": "대한항공", "OZ": "아시아나항공", "7C": "제주항공",
            "LJ": "진에어", "TW": "티웨이항공", "BX": "에어부산",
            "RS": "에어서울", "ZE": "이스타항공", "VN": "베트남항공",
            "VJ": "비엣젯항공", "BL": "퍼시픽항공", "QH": "밤부항공",
        }

        for i, f in enumerate(flights[:6], 1):
            price = f"{f['price']:,}원" if f.get("price") else "가격 미정"
            dep_local = f.get("local_departure", "")[:16].replace("T", " ")
            arr_local = f.get("local_arrival", "")[:16].replace("T", " ")
            duration_mins = f.get("duration", {}).get("departure", 0) // 60
            duration_str = f"{duration_mins // 60}시간 {duration_mins % 60}분" if duration_mins else "-"
            airline_codes = f.get("airlines", [])
            airline_names = [airline_map.get(c, c) for c in airline_codes]
            airlines_str = " + ".join(airline_names) if airline_names else "항공사 미정"
            route_type = "직항" if len(f.get("route", [])) == 1 else f"경유 {len(f.get('route', [])) - 1}회"
            booking_link = f.get("deep_link", "")

            lines.append(
                f"[{i}] {airlines_str} | {route_type}\n"
                f"    출발: {dep_local} → 도착: {arr_local}\n"
                f"    비행 시간: {duration_str}\n"
                f"    가격: {price}\n"
                f"    예약: {booking_link[:80] if booking_link else 'kiwi.com 참고'}"
            )

        lines.append(
            f"\n최저가 비교 및 결제:\n"
            f"- 스카이스캐너: https://www.skyscanner.co.kr/transport/flights/{from_iata}/{to_iata}/{date.replace('-', '')[2:8] if '-' in date else ''}/\n"
            f"- 트립닷컴: https://kr.trip.com/flights/"
        )
        return "\n\n".join(lines)
    except Exception as e:
        return f"Kiwi API 오류: {e}\n직접 확인: skyscanner.co.kr / kr.trip.com"


def _search_skyscanner_rapidapi(from_iata, to_iata, departure, destination, date, adults, direct_only, api_key):
    """Skyscanner Flights & Travel API (RapidAPI) 실시간 항공권 검색"""
    try:
        date_iso = _parse_date_iso(date)
        headers = {
            "x-rapidapi-host": "skyscanner-flights-travel-api.p.rapidapi.com",
            "x-rapidapi-key": api_key,
        }

        # 1단계: 출발지/도착지 entityId 조회
        def get_entity_id(query):
            params = urllib.parse.urlencode({"market": "KR", "query": query, "locale": "en-US"})
            url = f"https://skyscanner-flights-travel-api.p.rapidapi.com/flights/searchAirport?{params}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            print(f"[search_flights DEBUG] searchAirport({query}) 키: {list(data.keys())}")
            places = data.get("places", data.get("data", []))
            print(f"[search_flights DEBUG] places 개수: {len(places)}, 첫번째: {places[0] if places else 'EMPTY'}")
            for p in places:
                if p.get("skyId", "").upper() == query.upper() or p.get("iataCode", "").upper() == query.upper():
                    return p.get("skyId"), p.get("entityId")
            if places:
                return places[0].get("skyId"), places[0].get("entityId")
            return query, None

        origin_sky, origin_entity = get_entity_id(from_iata)
        dest_sky, dest_entity = get_entity_id(to_iata)
        print(f"[search_flights DEBUG] origin=({origin_sky},{origin_entity}) dest=({dest_sky},{dest_entity})")

        if not origin_entity or not dest_entity:
            print(f"[search_flights DEBUG] entityId 없음 → 폴백")
            return _search_links_only(from_iata, to_iata, departure, destination, date_iso, adults)

        # 2단계: 항공편 검색
        params = urllib.parse.urlencode({
            "originSkyId": origin_sky,
            "destinationSkyId": dest_sky,
            "originEntityId": origin_entity,
            "destinationEntityId": dest_entity,
            "date": date_iso,
            "adults": str(adults),
            "currency": "KRW",
            "market": "KR",
            "locale": "ko-KR",
            "cabinClass": "economy",
        })
        url = f"https://skyscanner-flights-travel-api.p.rapidapi.com/flights/searchFlights?{params}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        print(f"[search_flights DEBUG] 응답 최상위 키: {list(data.keys())}")
        inner = data.get("data", {})
        if isinstance(inner, dict):
            print(f"[search_flights DEBUG] data 내부 키: {list(inner.keys())}")

        itineraries = (
            data.get("data", {}).get("itineraries") or
            data.get("itineraries") or []
        )
        print(f"[search_flights DEBUG] itineraries 개수: {len(itineraries)}")
        if itineraries:
            first = itineraries[0]
            print(f"[search_flights DEBUG] 첫번째 키: {list(first.keys())}")
            print(f"[search_flights DEBUG] price: {first.get('price')}")
            legs = first.get("legs", [])
            print(f"[search_flights DEBUG] legs 개수: {len(legs)}")
            if legs:
                print(f"[search_flights DEBUG] leg[0] 키: {list(legs[0].keys())}")

        sc_date = date_iso.replace("-", "")[2:]
        skyscanner_url = f"https://www.skyscanner.co.kr/transport/flights/{from_iata}/{to_iata}/{sc_date}/"
        tripdotcom_url = f"https://kr.trip.com/flights/showfare?dcity={from_iata}&acity={to_iata}&ddate={date_iso}&adult={adults}&cabin=Economy"

        if not itineraries:
            return _search_links_only(from_iata, to_iata, departure, destination, date_iso, adults)

        airline_map = {
            "KE": "대한항공", "OZ": "아시아나항공", "7C": "제주항공",
            "LJ": "진에어", "TW": "티웨이항공", "BX": "에어부산",
            "RS": "에어서울", "ZE": "이스타항공", "VN": "베트남항공",
            "VJ": "비엣젯항공", "BL": "퍼시픽항공", "QH": "밤부항공",
            "SQ": "싱가포르항공", "TG": "타이항공", "MH": "말레이시아항공",
        }

        lines = [f"항공권 검색 결과 ({departure} → {destination}) | {date_iso} | 성인 {adults}명\n"]

        for i, item in enumerate(itineraries[:5], 1):
            try:
                price_info = item.get("price", {})
                price_amount = price_info.get("amount", 0)
                price = f"₩{int(price_amount):,}" if price_amount else price_info.get("formatted", "가격 미정")
                booking_url = item.get("bookingUrl", "")
                legs = item.get("legs", [])
                if not legs:
                    continue
                leg = legs[0]
                dep_time = leg.get("departure", "")[:16].replace("T", " ")
                arr_time = leg.get("arrival", "")[:16].replace("T", " ")
                duration_mins = leg.get("durationMinutes", leg.get("durationInMinutes", 0))
                duration_str = f"{duration_mins // 60}시간 {duration_mins % 60}분" if duration_mins else "-"
                stop_count = leg.get("stopCount", 0)
                route_type = "직항" if stop_count == 0 else f"경유 {stop_count}회"
                carriers_raw = leg.get("carriers", {})
                if isinstance(carriers_raw, dict):
                    carriers = carriers_raw.get("marketing", [])
                elif isinstance(carriers_raw, list):
                    carriers = carriers_raw
                else:
                    carriers = []
                airline_names = [airline_map.get(c.get("alternateId", ""), c.get("name", "항공사 미정")) for c in carriers]
                airlines_str = " + ".join(airline_names) if airline_names else "항공사 미정"

                lines.append(
                    f"[{i}] {airlines_str} | {route_type}\n"
                    f"    출발: {dep_time} → 도착: {arr_time}\n"
                    f"    비행시간: {duration_str}\n"
                    f"    가격: {price}"
                    + (f"\n    예약: {booking_url}" if booking_url else "")
                )
            except Exception as e:
                print(f"[search_flights DEBUG] item {i} 파싱 오류: {e}")
                continue

        lines.append(
            f"\n예약 및 결제:\n"
            f"  스카이스캐너: {skyscanner_url}\n"
            f"  트립닷컴: {tripdotcom_url}"
        )
        return "\n\n".join(lines)

    except Exception as e:
        print(f"[search_flights 오류] {type(e).__name__}: {e}")
        return _search_links_only(from_iata, to_iata, departure, destination, _parse_date_iso(date), adults)


def _search_links_only(from_iata, to_iata, departure, destination, date_iso, adults):
    """링크만 제공하는 폴백"""
    sc_date = date_iso.replace("-", "")[2:]
    skyscanner_url = f"https://www.skyscanner.co.kr/transport/flights/{from_iata}/{to_iata}/{sc_date}/"
    tripdotcom_url = f"https://kr.trip.com/flights/showfare?dcity={from_iata}&acity={to_iata}&ddate={date_iso}&adult={adults}&cabin=Economy"
    return (
        f"항공권 검색: {departure}({from_iata}) → {destination}({to_iata}) | {date_iso} | 성인 {adults}명\n\n"
        f"실시간 최저가 확인:\n"
        f"  스카이스캐너: {skyscanner_url}\n"
        f"  트립닷컴: {tripdotcom_url}\n\n"
        f"※ 위 링크에서 직접 확인 후 결제해주세요."
    )


def _search_fallback(departure, destination, date, adults, direct_only, from_iata, to_iata):
    """API 키 없을 때 링크 방식"""
    date_iso = _parse_date_iso(date)
    return _search_links_only(from_iata, to_iata, departure, destination, date_iso, adults)


# ── 환율 조회 ──

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
            return f"지원하지 않는 통화 코드: {target}"

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


# ── TimeTree 캘린더 ──

def _timetree_headers():
    token = os.getenv("TIMETREE_ACCESS_TOKEN", "")
    if not token:
        raise RuntimeError("TIMETREE_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.")
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.timetree.v1+json",
        "Content-Type": "application/json",
    }


def _get_default_calendar_id() -> str:
    """기본 캘린더 ID 반환 (환경변수 또는 첫 번째 캘린더)"""
    cal_id = os.getenv("TIMETREE_CALENDAR_ID", "")
    if cal_id:
        return cal_id

    # 캘린더 목록에서 첫 번째 가져오기
    headers = _timetree_headers()
    req = urllib.request.Request(
        "https://timetreeapp.com/api/v1/calendars",
        headers=headers,
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    calendars = data.get("data", [])
    if not calendars:
        raise RuntimeError("TimeTree 캘린더가 없습니다.")
    return calendars[0]["id"]


@tool
def timetree_list_calendars() -> str:
    """TimeTree에 연결된 캘린더 목록을 조회합니다."""
    try:
        headers = _timetree_headers()
        req = urllib.request.Request(
            "https://timetreeapp.com/api/v1/calendars",
            headers=headers,
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        calendars = data.get("data", [])
        if not calendars:
            return "연결된 TimeTree 캘린더가 없습니다."

        lines = ["[TimeTree 캘린더 목록]"]
        for c in calendars:
            attrs = c.get("attributes", {})
            lines.append(f"- {attrs.get('name', '이름 없음')} (ID: {c['id']})")
        return "\n".join(lines)
    except RuntimeError as e:
        return str(e)
    except Exception as e:
        return f"TimeTree 조회 오류: {e}"


@tool
def timetree_create_event(title: str, date: str, start_time: str = "00:00", end_time: str = "", notes: str = "", all_day: bool = False) -> str:
    """TimeTree 캘린더에 일정을 등록합니다.
    title: 일정 제목 (예: 전체회의)
    date: 날짜 (예: 2026-07-07, 7월7일)
    start_time: 시작 시간 24시간제 (예: 13:00, 오후1시 → 13:00)
    end_time: 종료 시간 (선택, 비우면 시작+1시간)
    notes: 메모 (선택)
    all_day: 종일 일정 여부 (기본 False)
    """
    try:
        date_iso = _parse_date_iso(date)

        # 시간 파싱 (오전/오후 한국어 지원)
        def parse_time(t: str) -> str:
            t = t.strip()
            m = re.match(r'오후\s*(\d{1,2})시?', t)
            if m:
                h = int(m.group(1))
                return f"{h + 12 if h < 12 else h:02d}:00"
            m = re.match(r'오전\s*(\d{1,2})시?', t)
            if m:
                h = int(m.group(1))
                return f"{h:02d}:00"
            m = re.match(r'(\d{1,2}):(\d{2})', t)
            if m:
                return f"{int(m.group(1)):02d}:{m.group(2)}"
            m = re.match(r'(\d{1,2})시', t)
            if m:
                return f"{int(m.group(1)):02d}:00"
            return t

        start_t = parse_time(start_time)
        if end_time:
            end_t = parse_time(end_time)
        else:
            h, mm = map(int, start_t.split(":"))
            h = (h + 1) % 24
            end_t = f"{h:02d}:{mm:02d}"

        start_at = f"{date_iso}T{start_t}:00+09:00"
        end_at = f"{date_iso}T{end_t}:00+09:00"

        cal_id = _get_default_calendar_id()
        headers = _timetree_headers()

        body = {
            "data": {
                "attributes": {
                    "title": title,
                    "category": "schedule",
                    "all_day": all_day,
                    "start_at": start_at,
                    "end_at": end_at,
                    "start_timezone": "Asia/Seoul",
                    "end_timezone": "Asia/Seoul",
                    "description": notes,
                }
            }
        }

        payload = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            f"https://timetreeapp.com/api/v1/calendars/{cal_id}/events",
            data=payload,
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        event_id = result.get("data", {}).get("id", "")
        attrs = result.get("data", {}).get("attributes", {})
        return (
            f"TimeTree 일정 등록 완료\n"
            f"제목: {attrs.get('title', title)}\n"
            f"날짜: {date_iso}\n"
            f"시간: {start_t} ~ {end_t}\n"
            f"메모: {notes or '없음'}"
        )
    except RuntimeError as e:
        return str(e)
    except Exception as e:
        return f"TimeTree 일정 등록 오류: {e}"


@tool
def timetree_list_events(days: int = 7) -> str:
    """TimeTree 캘린더의 앞으로의 일정을 조회합니다.
    days: 앞으로 몇 일치 조회 (기본 7일)
    """
    try:
        from datetime import timezone, timedelta
        cal_id = _get_default_calendar_id()
        headers = _timetree_headers()

        now = datetime.now(timezone(timedelta(hours=9)))
        end = now + timedelta(days=days)
        params = {
            "days": str(days),
            "timezone": "Asia/Seoul",
        }
        url = f"https://timetreeapp.com/api/v1/calendars/{cal_id}/upcoming_events?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        events = data.get("data", [])
        if not events:
            return f"앞으로 {days}일간 TimeTree 일정이 없습니다."

        lines = [f"[앞으로 {days}일 TimeTree 일정]"]
        for e in events:
            attrs = e.get("attributes", {})
            start = attrs.get("start_at", "")[:16].replace("T", " ")
            title_e = attrs.get("title", "(제목 없음)")
            lines.append(f"  {start} — {title_e}")
        return "\n".join(lines)
    except RuntimeError as e:
        return str(e)
    except Exception as e:
        return f"TimeTree 조회 오류: {e}"


def get_all_external_tools():
    return [
        search_flights,
        get_exchange_rate,
        timetree_list_calendars,
        timetree_create_event,
        timetree_list_events,
    ]
