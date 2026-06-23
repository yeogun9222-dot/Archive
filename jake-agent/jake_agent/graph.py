from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import os
from dotenv import load_dotenv
from .db import create_task, log_conversation

load_dotenv()

JAKE_SYSTEM = """당신은 제이크(Jake)입니다. Kade Yeo 이사님의 정예 멤버 10인 중 PM, 팀장입니다.

말투: 명확하고 결단력 있음. 큰 그림을 봄.
성격: 조율자. 팀 간 충돌 시 중재. 의뢰인 눈높이로 설명.
전문성: 프로젝트 관리, 우선순위 결정, 타임라인 관리, 이해관계자 소통.
습관: 항상 일정과 우선순위 같이 언급.
한마디: "좋은 아이디어야. 근데 지금 당장 필요한 거야?"

역할:
- 이사님의 지시를 분석하고 팀원에게 작업 분배
- 전체 일정/로드맵 관리
- 기능 우선순위 결정

이사님을 항상 "Kade Yeo 이사님"으로 호칭하세요.
작업을 분배할 때는 다음 형식으로 명확히 정리하세요:
[팀원명] 에게 [작업 내용] 을 지시합니다. 마감: [날짜]

팀원 목록: 바쿠(데이터), 피오(백엔드), 리리(프론트), 설리(QA), 에바(UX전략), 사라(UX리서치), 미나(전환율), 카이(GTM), 렉스(AI시스템)"""

TEAM_MEMBERS = ["바쿠", "피오", "리리", "설리", "에바", "사라", "미나", "카이", "렉스"]

class JakeState(TypedDict):
    messages: list
    user_input: str
    jake_response: str
    tasks_created: list

def jake_node(state: JakeState) -> JakeState:
    llm = ChatAnthropic(
        model="claude-sonnet-4-6",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=2048
    )

    messages = [SystemMessage(content=JAKE_SYSTEM)]
    for msg in state["messages"]:
        messages.append(msg)
    messages.append(HumanMessage(content=state["user_input"]))

    response = llm.invoke(messages)
    jake_reply = response.content

    log_conversation("jake", f"이사님: {state['user_input']}", None)
    log_conversation("jake", f"제이크: {jake_reply}", None)

    # 팀원 작업 분배 감지 및 DB 저장
    tasks_created = []
    for member in TEAM_MEMBERS:
        if member in jake_reply:
            task_id = create_task(
                title=f"{member} 작업",
                instruction=jake_reply,
                assigned_to=member
            )
            tasks_created.append({"member": member, "task_id": task_id})

    new_messages = list(state["messages"]) + [
        HumanMessage(content=state["user_input"]),
        AIMessage(content=jake_reply)
    ]

    return {
        **state,
        "messages": new_messages,
        "jake_response": jake_reply,
        "tasks_created": tasks_created
    }

def build_jake_graph():
    graph = StateGraph(JakeState)
    graph.add_node("jake", jake_node)
    graph.set_entry_point("jake")
    graph.add_edge("jake", END)
    return graph.compile()
