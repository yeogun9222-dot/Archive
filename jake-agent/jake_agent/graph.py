from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import os
from dotenv import load_dotenv
from .db import create_task, log_conversation
from .personas import detect_persona, get_system_prompt, PERSONAS

load_dotenv()

TEAM_MEMBERS = list(PERSONAS.keys())

class JakeState(TypedDict):
    messages: list
    user_input: str
    jake_response: str
    tasks_created: list
    persona: str

def agent_node(state: JakeState) -> JakeState:
    llm = ChatAnthropic(
        model="claude-sonnet-4-6",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=2048
    )

    persona = state.get("persona", "제이크")
    system_prompt = get_system_prompt(persona)

    messages = [SystemMessage(content=system_prompt)]
    for msg in state["messages"]:
        if isinstance(msg, dict):
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        else:
            messages.append(msg)
    messages.append(HumanMessage(content=state["user_input"]))

    response = llm.invoke(messages)
    reply = response.content

    log_conversation(persona, f"이사님: {state['user_input']}", None)
    log_conversation(persona, f"{persona}: {reply}", None)

    # 제이크일 때만 팀원 작업 분배 감지
    tasks_created = []
    if persona == "제이크":
        for member in TEAM_MEMBERS:
            if member in reply and member != "제이크":
                task_id = create_task(
                    title=f"{member} 작업",
                    instruction=reply,
                    assigned_to=member
                )
                tasks_created.append({"member": member, "task_id": task_id})

    new_messages = list(state["messages"]) + [
        {"role": "user", "content": state["user_input"]},
        {"role": "assistant", "content": reply}
    ]

    return {
        **state,
        "messages": new_messages,
        "jake_response": reply,
        "tasks_created": tasks_created
    }

def build_jake_graph():
    graph = StateGraph(JakeState)
    graph.add_node("agent", agent_node)
    graph.set_entry_point("agent")
    graph.add_edge("agent", END)
    return graph.compile()
