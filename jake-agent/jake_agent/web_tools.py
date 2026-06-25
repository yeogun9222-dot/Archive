import os
import subprocess
import requests
from langchain_core.tools import tool

# ── 웹 검색 ──
@tool
def web_search(query: str) -> str:
    """인터넷에서 정보를 검색해요. 날씨, 뉴스, 일반 정보 검색에 사용해요."""
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


# ── 날씨 조회 (wttr.in 무료 API, 키 불필요) ──
@tool
def get_weather(location: str) -> str:
    """특정 지역의 현재 날씨를 확인해요. 예) 서울, 원흥동, Seoul"""
    try:
        url = f"https://wttr.in/{requests.utils.quote(location)}?format=j1&lang=ko"
        resp = requests.get(url, timeout=8)
        data = resp.json()
        current = data["current_condition"][0]
        desc = current["lang_ko"][0]["value"] if current.get("lang_ko") else current["weatherDesc"][0]["value"]
        temp_c = current["temp_C"]
        feels_like = current["FeelsLikeC"]
        humidity = current["humidity"]
        wind_kmph = current["windspeedKmph"]
        return (
            f"{location} 현재 날씨: {desc}\n"
            f"기온: {temp_c}°C (체감 {feels_like}°C)\n"
            f"습도: {humidity}%  바람: {wind_kmph}km/h"
        )
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
