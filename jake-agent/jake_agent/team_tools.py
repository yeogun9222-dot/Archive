import os
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import tool
from .personas import PERSONAS


def _consult_member(member_name: str, question: str) -> str:
    persona_info = PERSONAS.get(member_name)
    if not persona_info:
        return f"(팀원 정보 없음)"

    consult_instruction = (
        "\n\n[현재 상황] 팀 내부 회의입니다. "
        "질문에 대해 본인 전문 영역 관점에서 핵심만 2~3문장으로 답변하세요. "
        "마크다운, 이모지, 인사말 금지."
    )
    system_prompt = persona_info["system"] + consult_instruction

    llm = ChatAnthropic(
        model="claude-haiku-4-5-20251001",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=300,
    )
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=question),
    ])
    return response.content


@tool
def consult_team(question: str, members: str) -> str:
    """사업/전략 질문에 대해 팀원들의 실제 의견을 수렴합니다.
    question: 팀원들에게 물어볼 질문 (원래 질문 그대로)
    members: 의견을 수렴할 팀원 이름, 쉼표 구분 (예: "다인,카이,루나") 최대 3명
    """
    member_list = [m.strip() for m in members.split(",") if m.strip()][:3]
    results = []
    for member in member_list:
        response = _consult_member(member, question)
        results.append(f"[{member}] {response}")
    return "\n\n".join(results)


def get_all_team_tools():
    return [consult_team]
