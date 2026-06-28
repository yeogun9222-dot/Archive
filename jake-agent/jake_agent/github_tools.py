from langchain_core.tools import tool
import urllib.request
import urllib.parse
import json
import os

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO", "yeogun9222-dot/Archive")


def _gh_request(path: str, method: str = "GET", body: dict = None):
    url = f"https://api.github.com{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


@tool
def list_github_issues(repo: str = "", state: str = "open") -> str:
    """GitHub 이슈 목록을 조회합니다. repo: 'owner/repo' (미입력 시 기본 저장소), state: open/closed/all"""
    try:
        target = repo or GITHUB_REPO
        data = _gh_request(f"/repos/{target}/issues?state={state}&per_page=15")
        if not data:
            return f"이슈 없음 ({state})"

        lines = [f"[{target} 이슈 목록 — {state}]"]
        for issue in data:
            if "pull_request" in issue:
                continue
            lines.append(f"  #{issue['number']} {issue['title']} (@{issue['user']['login']})")
        return "\n".join(lines) if len(lines) > 1 else f"이슈 없음 ({state})"
    except Exception as e:
        return f"오류: {e}"


@tool
def create_github_issue(title: str, body: str = "", repo: str = "") -> str:
    """GitHub 이슈를 생성합니다. title: 제목, body: 본문, repo: 'owner/repo' (미입력 시 기본 저장소)"""
    try:
        target = repo or GITHUB_REPO
        result = _gh_request(f"/repos/{target}/issues", method="POST", body={"title": title, "body": body})
        return f"✅ 이슈 생성 완료\n#{result['number']} {result['title']}\n링크: {result['html_url']}"
    except Exception as e:
        return f"오류: {e}"


@tool
def close_github_issue(issue_number: int, comment: str = "", repo: str = "") -> str:
    """GitHub 이슈를 close 처리합니다. issue_number: 이슈 번호, comment: close 전 남길 코멘트(선택), repo: 'owner/repo' (미입력 시 기본 저장소)"""
    try:
        target = repo or GITHUB_REPO
        if comment:
            _gh_request(f"/repos/{target}/issues/{issue_number}/comments", method="POST", body={"body": comment})
        result = _gh_request(f"/repos/{target}/issues/{issue_number}", method="PATCH", body={"state": "closed"})
        return f"✅ 이슈 close 완료\n#{result['number']} {result['title']}\n링크: {result['html_url']}"
    except Exception as e:
        return f"오류: {e}"


@tool
def list_github_prs(repo: str = "", state: str = "open") -> str:
    """GitHub Pull Request 목록을 조회합니다."""
    try:
        target = repo or GITHUB_REPO
        data = _gh_request(f"/repos/{target}/pulls?state={state}&per_page=10")
        if not data:
            return f"PR 없음 ({state})"

        lines = [f"[{target} PR 목록 — {state}]"]
        for pr in data:
            lines.append(f"  #{pr['number']} {pr['title']} → {pr['base']['ref']} (@{pr['user']['login']})")
        return "\n".join(lines)
    except Exception as e:
        return f"오류: {e}"


@tool
def get_github_repo_info(repo: str = "") -> str:
    """GitHub 저장소 정보를 조회합니다. 스타, 포크, 최근 푸시 등."""
    try:
        target = repo or GITHUB_REPO
        r = _gh_request(f"/repos/{target}")
        commits = _gh_request(f"/repos/{target}/commits?per_page=5")

        lines = [
            f"[{target} 저장소 정보]",
            f"  설명: {r.get('description') or '없음'}",
            f"  기본 브랜치: {r['default_branch']}",
            f"  스타: {r['stargazers_count']} / 포크: {r['forks_count']}",
            f"  최근 푸시: {r['pushed_at'][:10]}",
            "",
            "[최근 커밋 5개]",
        ]
        for c in commits:
            msg = c['commit']['message'].split('\n')[0][:60]
            author = c['commit']['author']['name']
            date = c['commit']['author']['date'][:10]
            lines.append(f"  {date} {author}: {msg}")
        return "\n".join(lines)
    except Exception as e:
        return f"오류: {e}"


@tool
def trigger_github_workflow(workflow_id: str, repo: str = "", ref: str = "main") -> str:
    """GitHub Actions 워크플로우를 수동 실행합니다. workflow_id: 파일명 또는 ID"""
    try:
        target = repo or GITHUB_REPO
        _gh_request(
            f"/repos/{target}/actions/workflows/{workflow_id}/dispatches",
            method="POST",
            body={"ref": ref}
        )
        return f"✅ 워크플로우 실행 완료\n{target} / {workflow_id} (브랜치: {ref})"
    except Exception as e:
        return f"오류: {e}"


def get_all_github_tools():
    return [
        list_github_issues,
        create_github_issue,
        close_github_issue,
        list_github_prs,
        get_github_repo_info,
        trigger_github_workflow,
    ]
