from langchain_core.tools import tool
from .db import create_memo, get_memos, get_projects


@tool
def save_memo(content: str) -> str:
    """대표님(CEO)의 메모를 대시보드 메모장에 저장합니다.
    대표님이 업무·할일·아이디어를 공유하며 "메모해줘", "저장해줘", "정리해서 넣어줘" 등으로 요청할 때 사용하세요.
    content: 저장할 메모 내용. 대표님이 구어체/나열식으로 말한 내용을 읽기 편한 문장이나 항목으로 다듬어서 작성하세요.
             여러 항목이면 줄바꿈으로 구분해 보기 좋게 정리하세요.
    """
    memo_id = create_memo(content)
    return f"[메모 저장 완료 #{memo_id}] 대시보드 메모장에 등록했습니다."


@tool
def get_my_board() -> str:
    """대표님의 메모장(미완료 메모)과 프로젝트 진행 현황을 조회합니다.
    "내가 해야할 것들이 뭐야", "할일 뭐 있어", "프로젝트 현황 어때" 같은 질문에 사용하세요.
    """
    memos = get_memos()
    projects = get_projects()

    lines = ["[메모]"]
    if memos:
        for m in memos:
            mark = "📌" if m["pinned"] else "-"
            lines.append(f"{mark} {m['content']}")
    else:
        lines.append("없음")

    lines.append("")
    lines.append("[프로젝트 진행 현황]")
    if projects:
        for p in projects:
            lines.append(f"- {p['name']} ({p['status']}) — {p['done_tasks']}/{p['total_tasks']} 완료")
    else:
        lines.append("없음")

    return "\n".join(lines)


def get_all_memo_tools():
    return [save_memo, get_my_board]
