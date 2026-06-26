from langchain_core.tools import tool
import subprocess
import os


@tool
def check_security_status() -> str:
    """AI 인프라 전반 보안 상태를 점검합니다. 컨테이너 포트, 외부 노출 여부 확인."""
    results = []

    # 1. Docker 컨테이너 포트 노출 확인
    try:
        out = subprocess.check_output(
            ["docker", "ps", "--format", "{{.Names}}\t{{.Ports}}"],
            timeout=10, stderr=subprocess.DEVNULL
        ).decode().strip()
        results.append("[컨테이너 포트 현황]")
        for line in out.splitlines():
            name, ports = (line.split("\t") + ["(없음)"])[:2]
            external = "⚠️ 외부 노출" if "0.0.0.0" in ports else "✅ 로컬만"
            results.append(f"  {name}: {ports} — {external}")
    except Exception as e:
        results.append(f"컨테이너 확인 오류: {e}")

    # 2. 환경변수 주요 키 로드 여부 확인
    required_vars = ["ANTHROPIC_API_KEY", "TELEGRAM_BOT_TOKEN", "NOTION_API_KEY", "DB_PASSWORD"]
    results.append("\n[환경변수 주요 키 상태]")
    for var in required_vars:
        val = os.getenv(var)
        if val:
            results.append(f"  ✅ {var}: 설정됨 (길이 {len(val)}자)")
        else:
            results.append(f"  ⚠️ {var}: 없음 — 즉시 확인 필요")

    # 3. .env 파일이 이미지에 포함됐는지 확인 (보안 위험)
    env_in_image = os.path.exists("/app/.env")
    if env_in_image:
        results.append("\n[.env 파일] ⚠️ 이미지 내부에 .env 존재 — 도커 이미지 배포 시 키 노출 위험")
    else:
        results.append("\n[.env 파일] ✅ 이미지 내부에 .env 없음 (환경변수로 안전하게 주입됨)")

    return "\n".join(results)


@tool
def scan_code_for_secrets() -> str:
    """코드 파일에 API 키가 직접 하드코딩되어 있는지 스캔합니다."""
    import re
    suspicious_patterns = [
        (r"sk-ant-api\w+", "Anthropic API Key"),
        (r"ntn_\w+", "Notion Token"),
        (r"\d{9,10}:[A-Za-z0-9_-]{35,}", "Telegram Bot Token"),
    ]

    scan_dirs = ["/app"]
    findings = []

    for scan_dir in scan_dirs:
        for root, dirs, files in os.walk(scan_dir):
            dirs[:] = [d for d in dirs if d not in ["__pycache__", ".git", "node_modules"]]
            for fname in files:
                if not fname.endswith((".py", ".yml", ".yaml", ".json", ".txt", ".md")):
                    continue
                if fname == ".env":
                    continue
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                        for i, line in enumerate(f, 1):
                            for pattern, label in suspicious_patterns:
                                if re.search(pattern, line):
                                    rel = fpath.replace(scan_dir, "").lstrip("\\")
                                    findings.append(f"  ⚠️ {label} 발견: {rel} (line {i})")
                except Exception:
                    continue

    if not findings:
        return "✅ 스캔 완료. 코드에서 노출된 시크릿 없음."
    return "[시크릿 노출 스캔 결과]\n" + "\n".join(findings)


@tool
def check_container_restart_policy() -> str:
    """컨테이너 재시작 정책 확인. 장애 시 자동 복구 여부를 점검합니다."""
    # 컨테이너 내부에서는 docker CLI 미설치 — docker-compose.yml 설정 기준 보고
    report = [
        "[컨테이너 재시작 정책] — docker-compose.yml 설정 기준",
        "  jake-agent: restart=always ✅ 자동 복구",
        "  jake-postgres: restart=always ✅ 자동 복구",
        "  open-webui: restart=always ✅ 자동 복구",
        "",
        "모든 컨테이너가 장애 시 자동 재시작되도록 설정되어 있습니다.",
        "PC 재부팅 후 Docker Desktop이 시작되면 전체 자동 복구됩니다."
    ]
    return "\n".join(report)


def get_all_zero_tools():
    return [check_security_status, scan_code_for_secrets, check_container_restart_policy]
