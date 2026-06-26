import os
import subprocess
import requests
from langchain_core.tools import tool


def _brave_search(query: str, api_key: str) -> str:
    try:
        resp = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers={
                "X-Subscription-Token": api_key,
                "Accept": "application/json",
            },
            params={"q": query, "count": 5, "country": "KR", "search_lang": "ko", "ui_lang": "ko-KR"},
            timeout=10,
        )
        data = resp.json()
        results = data.get("web", {}).get("results", [])
        if not results:
            return "검색 결과가 없어요."
        lines = []
        for r in results[:5]:
            lines.append(f"[{r.get('title','')}]\n{r.get('description','')}\n출처: {r.get('url','')}")
        return "\n\n".join(lines)
    except Exception as e:
        return f"Brave 검색 오류: {e}"


def _duckduckgo_search(query: str) -> str:
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5, region="kr-kr"))
        if not results:
            return "검색 결과가 없어요."
        lines = []
        for r in results[:4]:
            lines.append(f"[{r.get('title','')}]\n{r.get('body','')}\n출처: {r.get('href','')}")
        return "\n\n".join(lines)
    except Exception as e:
        return f"검색 오류: {e}"


# ── 웹 검색 (Brave Search 우선, 없으면 DuckDuckGo 폴백) ──
@tool
def web_search(query: str) -> str:
    """인터넷에서 정보를 검색해요. 날씨, 뉴스, 일반 정보 검색에 사용해요."""
    brave_key = os.getenv("BRAVE_API_KEY", "")
    if brave_key:
        return _brave_search(query, brave_key)
    return _duckduckgo_search(query)


# ── WMO 날씨 코드 변환 ──
def _wmo_description(code: int) -> str:
    wmo_map = {
        0: "맑음", 1: "대체로 맑음", 2: "구름 조금", 3: "흐림",
        45: "안개", 48: "안개",
        51: "가벼운 이슬비", 53: "이슬비", 55: "짙은 이슬비",
        61: "약한 비", 63: "비", 65: "강한 비",
        71: "약한 눈", 73: "눈", 75: "강한 눈", 77: "눈발",
        80: "소나기", 81: "소나기", 82: "강한 소나기",
        85: "눈소나기", 86: "강한 눈소나기",
        95: "뇌우", 96: "뇌우(우박)", 99: "강한 뇌우(우박)",
    }
    return wmo_map.get(code, f"날씨코드{code}")


# ── 날씨 조회 (Open-Meteo, API 키 불필요, 글로벌) ──
@tool
def get_weather(location: str) -> str:
    """특정 지역의 현재 날씨 및 3일 예보를 확인해요. 예) 서울, 고양시 원흥동, Tokyo, New York"""
    try:
        # 1. 지오코딩: 주소 → 좌표
        geo_url = (
            f"https://geocoding-api.open-meteo.com/v1/search"
            f"?name={requests.utils.quote(location)}&count=1&language=ko&format=json"
        )
        geo_resp = requests.get(geo_url, timeout=10)
        geo_data = geo_resp.json()
        places = geo_data.get("results", [])
        if not places:
            return f"'{location}' 위치를 찾을 수 없어요."

        place = places[0]
        lat, lon = place["latitude"], place["longitude"]
        place_name = place.get("name", location)
        admin1 = place.get("admin1", "")
        country = place.get("country", "")
        location_str = place_name
        if admin1:
            location_str += f", {admin1}"
        if country:
            location_str += f", {country}"

        # 2. 날씨 조회 (현재 + 3일 예보)
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
            f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
            f"&timezone=Asia%2FSeoul&forecast_days=4"
        )
        w_resp = requests.get(weather_url, timeout=10)
        w_data = w_resp.json()

        cur = w_data.get("current", {})
        temp = cur.get("temperature_2m", "?")
        feels = cur.get("apparent_temperature", "?")
        humidity = cur.get("relative_humidity_2m", "?")
        wind = cur.get("wind_speed_10m", "?")
        desc = _wmo_description(cur.get("weather_code", 0))

        result = (
            f"{location_str} 현재 날씨: {desc}\n"
            f"기온: {temp}°C (체감 {feels}°C)\n"
            f"습도: {humidity}%  바람: {wind}km/h\n\n"
            f"3일 예보:\n"
        )

        daily = w_data.get("daily", {})
        dates = daily.get("time", [])
        max_t = daily.get("temperature_2m_max", [])
        min_t = daily.get("temperature_2m_min", [])
        precip = daily.get("precipitation_sum", [])
        d_codes = daily.get("weather_code", [])

        for i, date in enumerate(dates[:4]):
            d_desc = _wmo_description(d_codes[i]) if i < len(d_codes) else ""
            d_max = max_t[i] if i < len(max_t) else "?"
            d_min = min_t[i] if i < len(min_t) else "?"
            d_precip = precip[i] if i < len(precip) else 0
            result += f"{date}: {d_desc} {d_min}~{d_max}°C 강수 {d_precip}mm\n"

        return result.strip()
    except Exception as e:
        return f"날씨 조회 오류: {e}"


# ── 파일 읽기 ──
@tool
def read_file(path: str) -> str:
    """파일 내용을 읽어요. 절대 경로 또는 E:\\Claude\\ 기준 상대 경로 사용."""
    try:
        # 상대 경로면 E:\Claude\ 기준으로
        if not os.path.isabs(path):
            path = os.path.join(r"E:\Claude", path)
        if not os.path.exists(path):
            return f"파일이 없어요: {path}"
        if os.path.getsize(path) > 100_000:
            return f"파일이 너무 커요 (100KB 초과): {path}"
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception as e:
        return f"파일 읽기 오류: {e}"


# ── 디렉토리 목록 ──
@tool
def list_directory(path: str) -> str:
    """폴더 안의 파일과 하위 폴더 목록을 보여줘요."""
    try:
        if not os.path.isabs(path):
            path = os.path.join(r"E:\Claude", path)
        if not os.path.isdir(path):
            return f"폴더가 없어요: {path}"
        items = os.listdir(path)
        dirs = [f"📁 {i}" for i in items if os.path.isdir(os.path.join(path, i))]
        files = [f"📄 {i}" for i in items if os.path.isfile(os.path.join(path, i))]
        return f"{path}\n" + "\n".join(sorted(dirs) + sorted(files))
    except Exception as e:
        return f"목록 조회 오류: {e}"


# ── 시스템 명령 실행 (승인된 명령만) ──
ALLOWED_COMMANDS = [
    "docker ps", "docker stats", "docker logs",
    "git status", "git log", "git branch",
    "netstat", "tasklist", "systeminfo",
    "node --version", "python --version", "npm --version",
]

@tool
def run_system_command(command: str) -> str:
    """PC 시스템 상태를 확인하는 명령을 실행해요. Docker, Git, 네트워크 상태 확인 등."""
    cmd_lower = command.lower().strip()
    if not any(cmd_lower.startswith(allowed) for allowed in ALLOWED_COMMANDS):
        return f"허용되지 않은 명령이에요. 실행 가능한 명령: {', '.join(ALLOWED_COMMANDS[:6])} 등"
    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=15, encoding="utf-8"
        )
        output = result.stdout or result.stderr or "(출력 없음)"
        return output[:3000]
    except subprocess.TimeoutExpired:
        return "명령 실행 시간 초과 (15초)"
    except Exception as e:
        return f"명령 실행 오류: {e}"


def get_all_web_tools():
    return [web_search, get_weather, read_file, list_directory, run_system_command]
