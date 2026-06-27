from langchain_core.tools import tool
import subprocess
import os
import re


_ALLOWED_CONTAINERS = {"jake-agent", "jake-postgres", "open-webui"}


def _run(cmd: list, timeout: int = 15) -> str:
    try:
        out = subprocess.check_output(cmd, timeout=timeout, stderr=subprocess.STDOUT)
        return out.decode("utf-8", errors="replace").strip()
    except subprocess.CalledProcessError as e:
        return e.output.decode("utf-8", errors="replace").strip()
    except Exception as e:
        return f"오류: {e}"


@tool
def check_docker_status() -> str:
    """실행 중인 Docker 컨테이너 목록, 포트, 업타임을 확인합니다."""
    result = _run(["docker", "ps", "--format",
                   "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"])
    if not result:
        return "실행 중인 컨테이너 없음 또는 Docker 응답 없음."
    return f"[Docker 컨테이너 현황]\n{result}"


@tool
def get_container_logs(container_name: str, lines: int = 50) -> str:
    """특정 Docker 컨테이너의 최근 로그를 가져옵니다.
    container_name: jake-agent | jake-postgres | open-webui
    lines: 가져올 줄 수 (기본 50)
    """
    if container_name not in _ALLOWED_CONTAINERS:
        return f"허용되지 않은 컨테이너: {container_name}. 허용 목록: {', '.join(_ALLOWED_CONTAINERS)}"
    lines = min(max(int(lines), 1), 200)
    result = _run(["docker", "logs", "--tail", str(lines), container_name])
    return f"[{container_name} 최근 {lines}줄 로그]\n{result}" if result else "로그 없음."


@tool
def restart_container(container_name: str) -> str:
    """Docker 컨테이너를 재시작합니다.
    container_name: jake-agent | jake-postgres | open-webui
    """
    if container_name not in _ALLOWED_CONTAINERS:
        return f"허용되지 않은 컨테이너: {container_name}."
    result = _run(["docker", "restart", container_name], timeout=60)
    return f"[재시작 완료] {container_name}\n{result}"


@tool
def check_docker_resource_usage() -> str:
    """컨테이너별 CPU, 메모리, 네트워크 I/O 실시간 사용량을 조회합니다."""
    result = _run(["docker", "stats", "--no-stream", "--format",
                   "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"])
    return f"[컨테이너 리소스 현황]\n{result}" if result else "통계 조회 실패."


@tool
def check_disk_usage() -> str:
    """Docker 이미지·볼륨·컨테이너 디스크 사용량과 시스템 디스크 상태를 확인합니다."""
    docker_df = _run(["docker", "system", "df"])
    disk = _run(["df", "-h", "/"])
    return f"[Docker 디스크 사용량]\n{docker_df}\n\n[시스템 디스크]\n{disk}"


@tool
def run_docker_prune() -> str:
    """사용하지 않는 Docker 이미지, 중단된 컨테이너, 미사용 네트워크를 정리합니다. (볼륨 제외)"""
    result = _run(["docker", "system", "prune", "-f"], timeout=120)
    return f"[Docker 정리 완료]\n{result}"


@tool
def check_gcp_agent_health() -> str:
    """jake-agent HTTP 엔드포인트 헬스 체크 (localhost:8000/health)."""
    try:
        import urllib.request
        with urllib.request.urlopen("http://localhost:8000/health", timeout=5) as resp:
            data = resp.read().decode()
            return f"[jake-agent 헬스] OK — {data}"
    except Exception as e:
        return f"[jake-agent 헬스] 응답 없음 — {e}"


def get_all_rex_tools():
    return [
        check_docker_status,
        get_container_logs,
        restart_container,
        check_docker_resource_usage,
        check_disk_usage,
        run_docker_prune,
        check_gcp_agent_health,
    ]
