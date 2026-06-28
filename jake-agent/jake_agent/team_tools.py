import os
import time
from contextvars import ContextVar
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import tool
from .personas import PERSONAS
from .db import save_chat_message, create_task, update_task, is_persona_active, set_persona_activity, clear_persona_activity, create_decision, request_decision
from .telegram import notify_delegation, notify_discussion, notify_decision_request
from .monitor import log_token_usage

HAIKU_MODEL = "claude-haiku-4-5-20251001"

# 현재 도구를 호출 중인 페르소나 — graph.py의 tool_exec_node에서 매 호출 전 설정
current_caller: ContextVar[str] = ContextVar("current_caller", default="제이크")


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
        model=HAIKU_MODEL,
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=400,
    )
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=question),
    ])
    # 그룹회의(consult_team)/1:1논의(discuss_with)는 별도 그래프 없이 여기서 직접 호출하므로
    # graph.py의 자동 토큰 기록 경로를 타지 않음 — 누락되지 않도록 여기서 직접 기록
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        log_token_usage(
            member_name,
            response.usage_metadata.get("input_tokens", 0),
            response.usage_metadata.get("output_tokens", 0),
            model=HAIKU_MODEL,
        )
    return response.content.strip()


@tool
def consult_team(question: str, members: str) -> str:
    """사업/전략/기술 질문에 대해 팀원들의 실제 의견을 수렴합니다.
    question: 팀원들에게 물어볼 질문 (원래 질문 그대로)
    members: 의견을 수렴할 팀원 이름, 쉼표 구분 (예: "다인,카이,루나") 최대 3명.
    유효한 이름: 다인, 에바, 미나, 바쿠, 피오, 리리, 설리, 카이, 렉스, 루나, 제로, 사라
    """
    requested = [m.strip() for m in members.split(",") if m.strip() in PERSONAS][:3]
    member_list = [m for m in requested if is_persona_active(m)]
    skipped = [m for m in requested if m not in member_list]
    if not member_list:
        return "(호출 가능한 팀원이 없습니다. 해임 상태이거나 유효하지 않은 이름입니다.)"

    caller = current_caller.get()
    results = []
    for member in member_list:
        set_persona_activity(member, "discussing", counterpart=caller, note=question[:80])
        try:
            response = _consult_member(member, question)
        finally:
            clear_persona_activity(member)
        results.append(f"[{member}] {response}")
        # 단체회의 발언을 해당 팀원 개인 채팅 기록에도 저장 → 1:1 탭에서 맥락 이어짐
        save_chat_message(member, "user", f"[Alpha Squad 회의] {question}", source="group-meeting")
        save_chat_message(member, "assistant", response, source="group-meeting")

    if skipped:
        results.append(f"[안내] {', '.join(skipped)}은(는) 현재 해임 상태라 의견 수렴에서 제외되었습니다.")

    return "\n\n".join(results)


def run_delegation(task_id: int, member: str, task: str, caller: str) -> str:
    """위임 실행 공통 로직 — delegate_task 도구와 실패 작업 재시도(/activity/{id}/retry) 양쪽에서 재사용.
    이미 만들어진 task_id에 결과를 반영(신규 task 생성 없음)."""
    set_persona_activity(caller, "delegating", counterpart=member, note=task[:80])
    set_persona_activity(member, "working", counterpart=caller, note=task[:80])

    try:
        from .graph import build_jake_graph
        graph = build_jake_graph()
        result = graph.invoke({
            "messages": [],
            "user_input": task,
            "jake_response": "",
            "tasks_created": [],
            "persona": member,
            "image_base64": "",
            "image_mime": "image/jpeg",
        })
        response = result["jake_response"]
        update_task(task_id, "completed", response)
        save_chat_message(member, "user", f"[위임 업무] {task}", source="delegation")
        save_chat_message(member, "assistant", response, source="delegation")
        notify_delegation(caller, member, task, response)
        clear_persona_activity(caller)
        clear_persona_activity(member)
        return f"[{member} 완료 보고]\n{response}"
    except Exception as e:
        update_task(task_id, "failed", str(e))
        clear_persona_activity(caller)
        set_persona_activity(member, "error", counterpart=caller, note=str(e)[:150])
        return f"[{member} 위임 실패] {e}"


@tool
def delegate_task(member: str, task: str) -> str:
    """특정 팀원에게 실제 업무를 위임합니다. 팀원은 본인 전용 도구를 사용해 작업을 수행하고 결과를 보고합니다.
    member: 업무를 수행할 팀원 이름 (예: 렉스, 다인, 루나, 피오 등)
    task: 위임할 업무 내용 (구체적으로 작성)
    유효한 이름: 다인, 에바, 미나, 바쿠, 피오, 리리, 설리, 카이, 렉스, 루나, 제로, 사라, 노바
    """
    if member not in PERSONAS:
        return f"[위임 실패] '{member}'은 유효한 팀원 이름이 아닙니다."
    if not is_persona_active(member):
        return f"[위임 불가] {member}은(는) 현재 비활성화(해임) 상태입니다."

    caller = current_caller.get()
    task_id = create_task(title=task[:100], instruction=task, assigned_to=member, delegated_by=caller)
    return run_delegation(task_id, member, task, caller)


@tool
def discuss_with(member: str, topic: str, max_turns: int = 4) -> str:
    """팀원과 여러 차례 의견을 주고받아야 결론이 나는 주제에 대해 1:1 다회성 논의를 진행합니다.
    1회성 질문(consult_team)이나 단순 업무지시(delegate_task)로는 부족한, 합의가 필요한 쟁점에만 사용하세요.
    member: 논의할 상대 팀원 이름
    topic: 논의 주제 (구체적인 쟁점/질문)
    max_turns: 최대 대화 턴 수 (기본 4, 비용 보호를 위해 최대 6으로 강제 제한됨)
    유효한 이름: 다인, 에바, 미나, 바쿠, 피오, 리리, 설리, 카이, 렉스, 루나, 제로, 사라, 노바, 제이크
    """
    caller = current_caller.get()
    if member not in PERSONAS:
        return f"[논의 실패] '{member}'은 유효한 팀원 이름이 아닙니다."
    if member == caller:
        return "[논의 실패] 본인과는 1:1 논의를 할 수 없습니다."
    if not is_persona_active(member):
        return f"[논의 불가] {member}은(는) 현재 비활성화(해임) 상태입니다."
    if not is_persona_active(caller):
        return f"[논의 불가] {caller}은(는) 현재 비활성화(해임) 상태입니다."

    # 비용/무한루프 방지 — 턴 수 하드캡 + 전체 wall-clock 타임아웃
    max_turns = max(1, min(int(max_turns), 6))
    timeout_s = 90
    start = time.monotonic()

    participants = [member, caller]
    transcript = []
    last_message = topic
    resolved = False
    turns_done = 0

    set_persona_activity(caller, "discussing", counterpart=member, note=topic[:80])
    set_persona_activity(member, "discussing", counterpart=caller, note=topic[:80])

    try:
        for turn in range(1, max_turns + 1):
            if time.monotonic() - start > timeout_s:
                transcript.append("[시스템] 제한시간(90초) 초과로 논의를 종료합니다.")
                break

            speaker = participants[turn % 2]
            listener = participants[(turn + 1) % 2]

            prompt = (
                f"[{listener}와의 1:1 논의 — {turn}/{max_turns}번째 턴]\n"
                f"논의 주제: {topic}\n"
                f"직전 발언({'없음, 첫 턴' if turn == 1 else listener}): {last_message}\n\n"
                "직전 발언에 대해 동의/반대/추가의견을 명확히 밝히세요. "
                "더 논의할 필요가 없다고 판단되면 답변 끝에 반드시 '[합의완료]'를 붙이세요."
            )
            response = _consult_member(speaker, prompt)
            transcript.append(f"[{speaker}] {response}")
            turns_done += 1

            save_chat_message(speaker, "assistant", f"(1:1 논의 · {listener}) {response}", source="discussion")
            save_chat_message(listener, "user", f"(1:1 논의 · {speaker}) {response}", source="discussion")

            last_message = response
            if "[합의완료]" in response:
                resolved = True
                break
    except Exception as e:
        clear_persona_activity(caller)
        clear_persona_activity(member)
        return f"[{member}↔{caller} 논의 오류] {e}"

    status = "합의 도달" if resolved else ("최대 턴 도달" if turns_done >= max_turns else "시간 초과 종료")
    summary = "\n\n".join(transcript)

    task_id = create_task(title=f"{member}↔{caller} 1:1 논의: {topic[:60]}", instruction=topic, assigned_to=member, delegated_by=caller)
    update_task(task_id, "completed", f"[{status}]\n{summary}")

    if resolved:
        create_decision("협업합의", f"{member}↔{caller}: {topic[:80]}", summary[:1500], decided_by=f"{member},{caller}", related_task_id=task_id)

    notify_discussion(caller, member, topic, summary, status)
    clear_persona_activity(caller)
    clear_persona_activity(member)

    return f"[{member}↔{caller} 논의 종료 — {status}]\n\n{summary}"


@tool
def request_ceo_decision(category: str, summary: str, reason: str) -> str:
    """대표님(CEO)의 직접 판단/결재가 필요한 사안을 올립니다. 본인 권한으로 결정할 수 없는 예산·인사·전략 사안일 때 사용하세요.
    단순 업무 위임이나 의견 수렴에는 절대 사용하지 마세요 — delegate_task/consult_team과 혼동하지 마세요.
    category: 전략, 예산, 인사, 프로젝트, 기타 중 하나
    summary: 결정이 필요한 사안 (한 줄, 구체적으로)
    reason: 왜 CEO 판단이 필요한지 배경/맥락
    """
    requester = current_caller.get()
    decision_id = request_decision(category, summary, reason, requested_by=requester)
    notify_decision_request(requester, category, summary, reason)
    return f"[결재 요청 등록됨 #{decision_id}] 대표님의 결재 패널에 올라갔습니다. 결재가 나면 알려드리겠습니다."


def get_all_team_tools():
    return [consult_team, delegate_task, discuss_with, request_ceo_decision]
