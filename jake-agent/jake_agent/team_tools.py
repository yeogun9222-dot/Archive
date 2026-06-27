import os
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import tool
from .personas import PERSONAS


def _consult_member(member_name: str, question: str) -> str:
    persona_info = PERSONAS.get(member_name)
    if not persona_info:
        return "(팀원 정보 없음)"

    consult_instruction = (
        "\n\n[현재 상황: 팀 내부 즉석 회의]"
        "\n질문에 대해 본인 전문 영역 관점에서만 답변하세요."
        "\n규칙:"
        "\n- 핵심만 2~3문장. 절대 그 이상 쓰지 마세요."
        "\n- 자기소개 금지. '저는 ~입니다' 시작 금지."
        "\n- 마크다운(**, ##, --) 금지."
        "\n- 이모지 금지."
        "\n- 다른 팀원 의견 언급 금지. 내 관점만."
        "\n- 불확실한 내용은 '확인 필요'로 명시."
    )
    system_prompt = persona_info["system"] + consult_instruction

    llm = ChatAnthropic(
        model="claude-haiku-4-5-20251001",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=400,
    )
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=question),
    ])
    return response.content.strip()


@tool
def consult_team(question: str, members: str) -> str:
    """사업/전략/기술 질문에 대해 팀원들의 실제 의견을 수렴합니다.
    question: 팀원들에게 물어볼 질문 (원래 질문 그대로)
    members: 의견을 수렴할 팀원 이름, 쉼표 구분 (예: "다인,카이,루나") 최대 3명.
    유효한 이름: 다인, 에바, 미나, 바쿠, 피오, 리리, 설리, 카이, 렉스, 루나, 제로, 사라
    """
    member_list = [m.strip() for m in members.split(",") if m.strip() in PERSONAS][:3]
    if not member_list:
        return "(호출 가능한 팀원이 없습니다. 유효한 이름을 확인하세요.)"

    results = []
    for member in member_list:
        response = _consult_member(member, question)
        results.append(f"[{member}] {response}")

    return "\n\n".join(results)


def get_all_team_tools():
    return [consult_team]
