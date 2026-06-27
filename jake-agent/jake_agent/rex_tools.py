from langchain_core.tools import tool
import os


_ALLOWED_CONTAINERS = {"jake-agent", "jake-postgres", "open-webui"}
_SOCKET = "unix:///var/run/docker.sock"


def _get_client():
    import docker
    return docker.DockerClient(base_url=_SOCKET)


@tool
def check_docker_status() -> str:
    """GCP 서버에서 실행 중인 Docker 컨테이너 목록, 포트, 상태, 업타임을 확인합니다."""
    try:
        client = _get_client()
        containers = client.containers.list(all=True)
        if not containers:
            return "실행 중인 컨테이너 없음."

        lines = ["[Docker 컨테이너 현황 — GCP jake-server]"]
        for c in containers:
            ports = c.ports or {}
            port_str = ", ".join(
                f"{v[0]['HostPort']}→{k}" for k, v in ports.items() if v
            ) if ports else "포트 없음"
            lines.append(f"{c.name}: {c.status} | {port_str} | {c.image.tags[0] if c.image.tags else c.image.short_id}")
        return "\n".join(lines)
    except Exception as e:
        return f"Docker 소켓 연결 실패: {e}"


@tool
def get_container_logs(container_name: str, lines: int = 50) -> str:
    """GCP 서버의 특정 Docker 컨테이너 최근 로그를 가져옵니다.
    container_name: jake-agent | jake-postgres | open-webui
    lines: 가져올 줄 수 (기본 50, 최대 200)
    """
    if container_name not in _ALLOWED_CONTAINERS:
        return f"허용되지 않은 컨테이너: {container_name}. 허용: {', '.join(_ALLOWED_CONTAINERS)}"
    lines = min(max(int(lines), 1), 200)
    try:
        client = _get_client()
        container = client.containers.get(container_name)
        log = container.logs(tail=lines, timestamps=True).decode("utf-8", errors="replace")
        return f"[{container_name} 최근 {lines}줄 로그]\n{log}" if log else "로그 없음."
    except Exception as e:
        return f"로그 조회 실패: {e}"


@tool
def restart_container(container_name: str) -> str:
    """GCP 서버의 Docker 컨테이너를 재시작합니다.
    container_name: jake-agent | jake-postgres | open-webui
    """
    if container_name not in _ALLOWED_CONTAINERS:
        return f"허용되지 않은 컨테이너: {container_name}."
    try:
        client = _get_client()
        container = client.containers.get(container_name)
        container.restart(timeout=30)
        return f"{container_name} 재시작 완료."
    except Exception as e:
        return f"재시작 실패: {e}"


@tool
def check_docker_resource_usage() -> str:
    """GCP 서버 컨테이너별 CPU, 메모리 사용량을 조회합니다."""
    try:
        client = _get_client()
        containers = client.containers.list()
        if not containers:
            return "실행 중인 컨테이너 없음."

        lines = ["[컨테이너 리소스 현황]"]
        for c in containers:
            stats = c.stats(stream=False)
            cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
            sys_delta = stats["cpu_stats"]["system_cpu_usage"] - stats["precpu_stats"].get("system_cpu_usage", 0)
            cpu_pct = round(cpu_delta / sys_delta * 100, 2) if sys_delta > 0 else 0.0
            mem_usage = stats["memory_stats"].get("usage", 0)
            mem_limit = stats["memory_stats"].get("limit", 1)
            mem_mb = round(mem_usage / 1024 / 1024, 1)
            mem_pct = round(mem_usage / mem_limit * 100, 1)
            lines.append(f"{c.name}: CPU {cpu_pct}% | 메모리 {mem_mb}MB ({mem_pct}%)")
        return "\n".join(lines)
    except Exception as e:
        return f"리소스 조회 실패: {e}"


@tool
def check_disk_usage() -> str:
    """GCP 서버 Docker 이미지/볼륨/컨테이너 디스크 사용량을 확인합니다."""
    try:
        import subprocess
        result = subprocess.check_output(["df", "-h", "/"], timeout=10).decode()
        disk_info = f"[시스템 디스크]\n{result}"

        client = _get_client()
        df = client.df()
        img_size = sum(i.get("Size", 0) for i in df.get("Images", []))
        vol_size = sum(v.get("UsageData", {}).get("Size", 0) for v in df.get("Volumes", []))
        con_size = sum(c.get("SizeRw", 0) for c in df.get("Containers", []))

        docker_info = (
            f"[Docker 디스크 사용량]\n"
            f"이미지: {round(img_size/1024/1024, 1)} MB\n"
            f"볼륨: {round(vol_size/1024/1024, 1)} MB\n"
            f"컨테이너 레이어: {round(con_size/1024/1024, 1)} MB"
        )
        return f"{disk_info}\n{docker_info}"
    except Exception as e:
        return f"디스크 조회 실패: {e}"


@tool
def run_docker_prune() -> str:
    """GCP 서버에서 사용하지 않는 Docker 이미지·중단 컨테이너·미사용 네트워크를 정리합니다. (볼륨 제외)"""
    try:
        client = _get_client()
        result = client.containers.prune()
        img_result = client.images.prune(filters={"dangling": True})
        net_result = client.networks.prune()
        space = img_result.get("SpaceReclaimed", 0)
        return f"정리 완료. 회수된 공간: {round(space/1024/1024, 1)} MB"
    except Exception as e:
        return f"정리 실패: {e}"


@tool
def check_gcp_agent_health() -> str:
    """jake-agent HTTP 헬스 체크 (localhost:8000/health)."""
    try:
        import urllib.request
        with urllib.request.urlopen("http://localhost:8000/health", timeout=5) as resp:
            data = resp.read().decode()
            return f"jake-agent 응답 정상: {data}"
    except Exception as e:
        return f"jake-agent 응답 없음: {e}"


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
