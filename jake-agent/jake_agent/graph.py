from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
import os
from dotenv import load_dotenv
from .db import create_task, log_conversation
from .personas import detect_persona, get_system_prompt, PERSONAS
from .monitor import log_token_usage
from .notion_tools import get_all_tools
from .web_tools import get_all_web_tools
from .luna_tools import get_all_luna_tools
from .zero_tools import get_all_zero_tools
from .google_tools import get_all_google_tools
from .github_tools import get_all_github_tools
from .tools_external import get_all_external_tools
from .team_tools import get_all_team_tools

load_dotenv()

TEAM_MEMBERS = list(PERSONAS.keys())
ALL_TOOLS = (
    get_all_tools() + get_all_web_tools() + get_all_luna_tools() +
    get_all_zero_tools() + get_all_google_tools() + get_all_github_tools() +
    get_all_external_tools() + get_all_team_tools()
)
TOOL_MAP = {t.name: t for t in ALL_TOOLS}


class JakeState(TypedDict):
    messages: list       # 대화 히스토리 (dict 형식)
    user_input: str
    jake_response: str
    tasks_created: list
    persona: str
    loop_msgs: list      # 현재 턴 ReAct 루프용 LangChain 메시지 객체
    image_base64: str    # 첨부 이미지 (base64, 없으면 "")
    image_mime: str      # 이미지 MIME 타입


_FLIGHT_KEYWORDS = ["항공권", "비행기", "항공편", "직항", "편도", "왕복", "flight", "비행편"]
_EXCHANGE_KEYWORDS = ["환율", "환전", "달러", "엔화", "유로", "원화", "USD", "JPY", "EUR", "VND", "THB"]
_ACCOMMODATION_KEYWORDS = ["숙소", "호텔", "아파트", "오피스텔", "에어비앤비", "airbnb", "렌트", "임대", "숙박", "방 찾아", "룸 찾아", "거주할"]
_HOTEL_KEYWORDS = ["호텔 찾아", "호텔 검색", "호텔 예약"]
# 날짜 명시 여부 판단 (이 키워드가 없으면 날짜 불명확 → search_flights 강제 호출 안 함)
_DATE_KEYWORDS = [
    "월", "일", "오늘", "내일", "모레", "이번주", "다음주",
    "월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일",
    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
]


_COMPLEX_KEYWORDS = [
    "검색", "찾아", "조회", "분석", "정리", "보고", "요약", "작성", "만들어",
    "항공", "비행", "flight", "호텔", "숙소", "렌트", "임대",
    "뉴스", "날씨", "환율", "주가", "코인", "비트코인",
    "노션", "일정", "캘린더", "github", "깃허브",
]


def _build_llm(forced_tool: str = "", user_input: str = ""):
    is_complex = bool(forced_tool) or any(kw in user_input for kw in _COMPLEX_KEYWORDS)
    model = "claude-sonnet-4-6" if is_complex else "claude-haiku-4-5-20251001"
    base = ChatAnthropic(
        model=model,
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=4096
    )
    if forced_tool:
        return base.bind_tools(ALL_TOOLS, tool_choice={"type": "tool", "name": forced_tool})
    return base.bind_tools(ALL_TOOLS)


def agent_node(state: JakeState) -> JakeState:
    persona = state.get("persona", "제이크")
    system_prompt = get_system_prompt(persona)

    loop_msgs = state.get("loop_msgs") or []
    user_input = state.get("user_input", "")

    # 첫 진입 시 강제 도구 선택 여부 결정
    forced_tool = ""
    if not loop_msgs:
        has_flight = any(kw in user_input for kw in _FLIGHT_KEYWORDS)
        has_date = any(kw in user_input for kw in _DATE_KEYWORDS)
        if has_flight and has_date:
            forced_tool = "search_flights"
        elif any(kw in user_input for kw in _EXCHANGE_KEYWORDS):
            forced_tool = "get_exchange_rate"
        elif any(kw in user_input for kw in _ACCOMMODATION_KEYWORDS + _HOTEL_KEYWORDS):
            forced_tool = "search_hotels"

    llm = _build_llm(forced_tool)

    if not loop_msgs:
        # 첫 진입: 히스토리 + 현재 입력으로 메시지 구성
        msgs = [SystemMessage(content=system_prompt)]
        for msg in state.get("messages", []):
            if isinstance(msg, dict):
                if msg["role"] == "user":
                    msgs.append(HumanMessage(content=msg["content"]))
                else:
                    msgs.append(AIMessage(content=msg["content"]))
            else:
                msgs.append(msg)
        image_b64 = state.get("image_base64", "")
        image_mime = state.get("image_mime", "image/jpeg")
        if image_b64:
            msgs.append(HumanMessage(content=[
                {"type": "text", "text": user_input},
                {"type": "image_url", "image_url": {"url": f"data:{image_mime};base64,{image_b64}"}},
            ]))
        else:
            msgs.append(HumanMessage(content=user_input))
        loop_msgs = msgs

    response = llm.invoke(loop_msgs)
    loop_msgs = loop_msgs + [response]

    # 토큰 사용량 기록
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        log_token_usage(
            persona,
            response.usage_metadata.get("input_tokens", 0),
            response.usage_metadata.get("output_tokens", 0),
        )

    tasks_created = state.get("tasks_created", [])
    jake_response = state.get("jake_response", "")

    # 도구 호출이 없으면 최종 응답
    if not response.tool_calls:
        jake_response = response.content
        log_conversation(persona, f"대표님: {state['user_input']}", None)
        log_conversation(persona, f"{persona}: {jake_response}", None)

        if persona == "제이크":
            for member in TEAM_MEMBERS:
                if member in jake_response and member != "제이크":
                    task_id = create_task(
                        title=f"{member} 작업",
                        instruction=jake_response,
                        assigned_to=member,
                    )
                    tasks_created.append({"member": member, "task_id": task_id})

    return {
        **state,
        "loop_msgs": loop_msgs,
        "jake_response": jake_response,
        "tasks_created": tasks_created,
    }


def tool_exec_node(state: JakeState) -> JakeState:
    loop_msgs = state["loop_msgs"]
    last_msg = loop_msgs[-1]
    tool_results = []

    for tc in last_msg.tool_calls:
        tool_name = tc["name"]
        tool_args = tc["args"]
        tool_id = tc["id"]

        if tool_name in TOOL_MAP:
            try:
                result = TOOL_MAP[tool_name].invoke(tool_args)
                result_str = str(result)
            except Exception as e:
                result_str = f"도구 실행 오류: {e}"
        else:
            result_str = f"알 수 없는 도구: {tool_name}"

        tool_results.append(
            ToolMessage(content=result_str, tool_call_id=tool_id)
        )

    return {**state, "loop_msgs": loop_msgs + tool_results}


def should_continue(state: JakeState) -> str:
    loop_msgs = state.get("loop_msgs", [])
    if not loop_msgs:
        return END
    last = loop_msgs[-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END


def build_jake_graph():
    graph = StateGraph(JakeState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_exec_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges(
        "agent",
        should_continue,
        {"tools": "tools", END: END},
    )
    graph.add_edge("tools", "agent")
    return graph.compile()
