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

load_dotenv()

TEAM_MEMBERS = list(PERSONAS.keys())
ALL_TOOLS = get_all_tools() + get_all_web_tools() + get_all_luna_tools() + get_all_zero_tools() + get_all_google_tools() + get_all_github_tools()
TOOL_MAP = {t.name: t for t in ALL_TOOLS}


class JakeState(TypedDict):
    messages: list       # 대화 히스토리 (dict 형식)
    user_input: str
    jake_response: str
    tasks_created: list
    persona: str
    loop_msgs: list      # 현재 턴 ReAct 루프용 LangChain 메시지 객체


def _build_llm():
    return ChatAnthropic(
        model="claude-sonnet-4-6",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=4096
    ).bind_tools(ALL_TOOLS)


def agent_node(state: JakeState) -> JakeState:
    persona = state.get("persona", "제이크")
    system_prompt = get_system_prompt(persona)
    llm = _build_llm()

    loop_msgs = state.get("loop_msgs") or []

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
        msgs.append(HumanMessage(content=state["user_input"]))
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
