from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse, FileResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import base64
import json
import mimetypes
import os
import time
import uuid

from jake_agent.graph import build_jake_graph
from jake_agent.db import get_pending_tasks, get_recent_conversation_history, init_db, save_chat_message, get_chat_history, clear_chat_history, get_recent_activity, log_ceo_instruction, get_attention_tasks, get_persona_statuses, update_task_status_guarded, delete_task_row, get_archived_tasks, get_task_health, get_cost_summary, is_persona_active, set_persona_active, get_persona_active_map, get_contention_personas, create_project, get_projects, update_project_status, get_archive_stats, export_and_purge_archived, create_manual_cost, get_manual_costs_this_month, delete_manual_cost, get_persona_activity_map, get_persona_performance, get_project_name, create_decision, get_decisions, get_bottleneck_detail, get_task_by_id, get_pending_decisions, resolve_decision, get_last_message_map, create_memo, get_memos, update_memo, delete_memo
from jake_agent.team_tools import run_delegation, draft_persona_from_decision
from fastapi import HTTPException
from jake_agent.dashboard_html import DASHBOARD_HTML
from jake_agent.telegram import notify_jake_response, notify_startup
from jake_agent.telegram_bot import start_bot_thread
from jake_agent.personas import detect_persona, detect_persona_from_system, PERSONAS, register_persona, load_custom_personas, rename_persona
from jake_agent.db import create_custom_persona, get_custom_personas, update_custom_persona
from jake_agent.db import mark_task_read, archive_all_tasks
from jake_agent.analyzer import check_and_analyze, get_total_conversation_count
from jake_agent.monitor import start_monitor_thread
from jake_agent.scheduler import start_scheduler_thread

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    load_custom_personas()
    start_bot_thread()
    start_monitor_thread()
    start_scheduler_thread()
    notify_startup()
    yield

app = FastAPI(title="Jake Orchestrator API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

jake_graph = build_jake_graph()

# ── 파일 첨부/다운로드 ────────────────────────────────────────
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15MB
TEXT_EXTRACT_EXT = {".txt", ".md", ".csv", ".json", ".log", ".py", ".js", ".ts",
                     ".html", ".css", ".yml", ".yaml", ".xml"}
MAX_EXTRACT_CHARS = 6000


@app.post("/uploads")
async def upload_file(file: UploadFile = File(...)):
    """대시보드 카드챗 첨부파일 업로드 — 이미지는 비전 입력용 base64, 텍스트류는 본문 추출까지 함께 반환"""
    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="파일이 너무 큽니다 (최대 15MB)")

    ext = os.path.splitext(file.filename or "")[1].lower()
    stored_name = uuid.uuid4().hex + ext
    with open(os.path.join(UPLOAD_DIR, stored_name), "wb") as f:
        f.write(raw)

    content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"
    is_image = content_type.startswith("image/")
    image_base64, text_excerpt = "", ""
    if is_image:
        image_base64 = base64.b64encode(raw).decode()
    elif ext in TEXT_EXTRACT_EXT:
        text_excerpt = raw.decode("utf-8", errors="ignore")[:MAX_EXTRACT_CHARS]

    return {
        "filename": file.filename or stored_name,
        "url": f"/uploads/{stored_name}",
        "content_type": content_type,
        "is_image": is_image,
        "image_base64": image_base64,
        "image_mime": content_type if is_image else "",
        "text_excerpt": text_excerpt,
    }


@app.get("/uploads/{stored_name}")
async def download_file(stored_name: str, name: Optional[str] = None):
    path = os.path.join(UPLOAD_DIR, stored_name)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    return FileResponse(path, filename=name or stored_name)


# ── 기존 API ──────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    source: str = "api"  # "telegram" 이면 알림 중복 방지
    image_base64: Optional[str] = None
    image_mime: Optional[str] = "image/jpeg"

class ChatResponse(BaseModel):
    response: str
    tasks_created: list
    persona: str

@app.post("/chat", response_model=ChatResponse)
async def chat_with_jake(req: ChatRequest):
    persona = detect_persona(req.message)
    history = get_recent_conversation_history(persona, limit=20)

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: jake_graph.invoke({
        "messages": history,
        "user_input": req.message,
        "jake_response": "",
        "tasks_created": [],
        "persona": persona,
        "image_base64": req.image_base64 or "",
        "image_mime": req.image_mime or "image/jpeg",
    }))

    # 대화 기록 저장
    save_chat_message(persona, "user", req.message, source=req.source)
    save_chat_message(persona, "assistant", result["jake_response"], source=req.source)
    log_ceo_instruction(persona, req.message, result["jake_response"])

    # 텔레그램 발신 시 알림 중복 방지
    if req.source != "telegram":
        notify_jake_response(req.message, result["jake_response"], result["tasks_created"])

    count = get_total_conversation_count()
    check_and_analyze(count)

    return ChatResponse(
        response=result["jake_response"],
        tasks_created=result["tasks_created"],
        persona=persona
    )


class PersonaChatRequest(BaseModel):
    message: str
    persona: str
    source: str = "vscode"
    image_base64: Optional[str] = None
    image_mime: Optional[str] = "image/jpeg"
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None


@app.post("/chat/persona/{persona_name}", response_model=ChatResponse)
async def chat_with_persona(persona_name: str, req: PersonaChatRequest):
    """VSCode 확장/대시보드 카드챗에서 특정 페르소나와 직접 대화하는 엔드포인트"""
    if persona_name not in PERSONAS:
        raise HTTPException(status_code=404, detail=f"페르소나 없음: {persona_name}")
    if not is_persona_active(persona_name):
        raise HTTPException(status_code=403, detail=f"{persona_name}은(는) 현재 비활성화(해임) 상태입니다. 대시보드에서 재고용 처리가 필요합니다.")

    history = get_chat_history(persona_name, limit=20)
    messages_history = [{"role": m["role"], "content": m["content"]} for m in history]

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: jake_graph.invoke({
        "messages": messages_history,
        "user_input": req.message,
        "jake_response": "",
        "tasks_created": [],
        "persona": persona_name,
        "image_base64": req.image_base64 or "",
        "image_mime": req.image_mime or "image/jpeg",
    }))

    save_chat_message(persona_name, "user", req.message, source=req.source,
                       attachment_name=req.attachment_name, attachment_url=req.attachment_url)
    save_chat_message(persona_name, "assistant", result["jake_response"], source=req.source)
    log_ceo_instruction(persona_name, req.message, result["jake_response"])

    return ChatResponse(
        response=result["jake_response"],
        tasks_created=result["tasks_created"],
        persona=persona_name
    )


@app.get("/history/{persona_name}")
async def get_persona_history(persona_name: str, limit: int = 50):
    """VSCode 확장에서 채팅창 열 때 과거 대화 기록 로드"""
    if persona_name == "alpha-squad":
        return {"persona": "alpha-squad", "messages": get_chat_history("alpha-squad", limit=limit)}
    if persona_name not in PERSONAS:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"페르소나 없음: {persona_name}")
    return {"persona": persona_name, "messages": get_chat_history(persona_name, limit=limit)}


class GroupChatRequest(BaseModel):
    message: str
    source: str = "vscode"


@app.post("/chat/group")
async def group_chat(req: GroupChatRequest):
    """Alpha Squad 단체방 — 제이크가 진행하고 관련 팀원들이 순서대로 의견 제시"""
    history = get_chat_history("alpha-squad", limit=20)
    messages_history = [{"role": m["role"], "content": m["content"]} for m in history]

    group_prompt = (
        f"[Alpha Squad 전체 회의]\n"
        f"대표님 발언: {req.message}\n\n"
        f"지금은 Alpha Squad 전체 회의입니다. 제이크 COO로서 이 안건을 받아 핵심 팀원들의 의견을 취합하여 "
        f"회의를 진행하세요. consult_team 도구로 관련 팀원 2~3명의 의견을 수렴한 뒤, "
        f"각 팀원 의견을 '[팀원명]: 내용' 형식으로 정리하고 제이크의 종합 의견으로 마무리하세요."
    )

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: jake_graph.invoke({
        "messages": messages_history,
        "user_input": group_prompt,
        "jake_response": "",
        "tasks_created": [],
        "persona": "제이크",
        "image_base64": "",
        "image_mime": "image/jpeg",
    }))

    save_chat_message("alpha-squad", "user", req.message, source=req.source)
    save_chat_message("alpha-squad", "assistant", result["jake_response"], source=req.source)

    return ChatResponse(
        response=result["jake_response"],
        tasks_created=result["tasks_created"],
        persona="alpha-squad"
    )


@app.delete("/history/{persona_name}")
async def delete_persona_history(persona_name: str):
    """채팅창 초기화 — 해당 페르소나의 저장된 대화 기록 전체 삭제"""
    historyKey = "alpha-squad" if persona_name == "alpha-squad" else persona_name
    if historyKey != "alpha-squad" and historyKey not in PERSONAS:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"페르소나 없음: {persona_name}")
    clear_chat_history(historyKey)
    return {"status": "cleared", "persona": persona_name}


@app.get("/activity/recent")
async def activity_recent(since_id: int = 0):
    """대시보드용 — 최근 위임 활동 폴링 엔드포인트"""
    return {"events": get_recent_activity(since_id=since_id, limit=50)}


@app.get("/activity/attention")
async def activity_attention():
    """대시보드 종 아이콘용 — 미완료(failed/pending) 작업 목록"""
    return {"tasks": get_attention_tasks(limit=50)}


@app.get("/activity/status_map")
async def activity_status_map():
    """대시보드 카드 배지용 — 각 페르소나의 최신 작업 상태"""
    return {"statuses": get_persona_statuses()}


@app.post("/activity/{task_id}/approve")
async def approve_task(task_id: int):
    ok = update_task_status_guarded(task_id, "approved", ["pending", "completed", "failed", "held"])
    if not ok:
        raise HTTPException(status_code=409, detail="상태가 이미 변경되어 승인할 수 없습니다. 새로고침 후 다시 시도하세요.")
    return {"status": "approved"}


@app.post("/activity/{task_id}/hold")
async def hold_task(task_id: int):
    ok = update_task_status_guarded(task_id, "held", ["pending", "failed"])
    if not ok:
        raise HTTPException(status_code=409, detail="상태가 이미 변경되어 보류할 수 없습니다. 새로고침 후 다시 시도하세요.")
    return {"status": "held"}


@app.post("/activity/{task_id}/retry")
async def retry_task(task_id: int):
    """실패한 작업을 실제로 재실행 — '승인'(확인용 라벨 변경)과는 별개의 진짜 재시도"""
    t = get_task_by_id(task_id)
    if not t:
        raise HTTPException(status_code=404, detail="해당 작업을 찾을 수 없습니다.")
    if t["status"] != "failed":
        raise HTTPException(status_code=409, detail="실패 상태인 작업만 재시도할 수 있습니다.")
    if not t["assigned_to"]:
        raise HTTPException(status_code=400, detail="담당자가 없는 작업은 재시도할 수 없습니다.")
    if not is_persona_active(t["assigned_to"]):
        raise HTTPException(status_code=403, detail=f"{t['assigned_to']}은(는) 현재 해임 상태라 재시도할 수 없습니다.")

    ok = update_task_status_guarded(task_id, "pending", ["failed"])
    if not ok:
        raise HTTPException(status_code=409, detail="상태가 이미 변경되어 재시도할 수 없습니다.")

    caller = t["delegated_by"] or "제이크"
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, lambda: run_delegation(task_id, t["assigned_to"], t["instruction"] or t["title"], caller))
    return {"status": "retried", "result": response}


@app.post("/activity/{task_id}/resume")
async def resume_task(task_id: int):
    """보류 해제 — 다시 pending으로"""
    ok = update_task_status_guarded(task_id, "pending", ["held"])
    if not ok:
        raise HTTPException(status_code=409, detail="보류 상태가 아니라 재개할 수 없습니다.")
    return {"status": "pending"}


@app.post("/activity/{task_id}/read")
async def read_task(task_id: int):
    """Activity Stream 개별 항목 읽음 처리 — 상태와 무관하게 항상 가능, 삭제와 별개"""
    ok = mark_task_read(task_id, True)
    if not ok:
        raise HTTPException(status_code=404, detail="해당 작업을 찾을 수 없습니다.")
    return {"status": "read"}


@app.post("/activity/clear-all")
async def clear_all_activity():
    """Activity Stream 전체삭제 — 화면 비우기와 동시에 서버 데이터도 일괄 보관(소프트 삭제) 처리"""
    count = archive_all_tasks()
    return {"status": "cleared", "count": count}


@app.delete("/activity/{task_id}")
async def delete_task_endpoint(task_id: int):
    ok = delete_task_row(task_id)
    if not ok:
        raise HTTPException(status_code=404, detail="해당 작업을 찾을 수 없습니다.")
    return {"status": "deleted"}


@app.get("/activity/archived")
async def activity_archived():
    """감사 로그 — 보관(삭제 처리)된 작업 전체 조회"""
    return {"tasks": get_archived_tasks(limit=100)}


@app.get("/activity/health")
async def activity_health():
    """기한초과/미배정 작업 알림"""
    return get_task_health()


@app.get("/cost/summary")
async def cost_summary():
    """월비용 대시보드 — 토큰 비용만 집계 (GCP 등 미포함, 명시적 안내)"""
    return get_cost_summary()


@app.get("/personas/active_map")
async def personas_active_map():
    return {"active": get_persona_active_map()}


@app.get("/personas/activity_map")
async def personas_activity_map():
    """카드 하단 상태바용 — 각 페르소나의 현재 실시간 활동 상태(작업중/협업중/오류/대기)"""
    return {"activity": get_persona_activity_map()}


@app.get("/personas/last_message_map")
async def personas_last_message_map():
    """카드 💬 안읽음 배지용 — 각 페르소나가 보낸 가장 최근 발신 시각"""
    return {"last_message": get_last_message_map()}


@app.get("/personas/performance")
async def personas_performance(period: str = "month"):
    """성과 추적 — 완료율/기한준수율/실패율/평균처리시간. period: month | all"""
    return {"performance": get_persona_performance(period)}


class DecisionRequest(BaseModel):
    category: str
    summary: str
    reason: Optional[str] = None


@app.get("/decisions")
async def list_decisions(limit: int = 100):
    """결재 이력 — 해임/재고용/프로젝트 상태변경은 자동 기록, 그 외는 수동 기록"""
    return {"decisions": get_decisions(limit)}


@app.post("/decisions")
async def add_decision(req: DecisionRequest):
    decision_id = create_decision(req.category, req.summary, req.reason, decided_by="대표님")
    return {"id": decision_id, "status": "created"}


@app.get("/decisions/pending")
async def list_pending_decisions():
    """14인이 올린, 대표님 결재가 필요한 사안 목록"""
    return {"decisions": get_pending_decisions()}


class ResolveDecisionRequest(BaseModel):
    resolution: str


@app.post("/decisions/{decision_id}/resolve")
async def resolve_decision_endpoint(decision_id: int, req: ResolveDecisionRequest):
    ok = resolve_decision(decision_id, req.resolution, decided_by="대표님")
    if not ok:
        raise HTTPException(status_code=409, detail="이미 결재되었거나 존재하지 않는 사안입니다.")
    return {"status": "resolved"}


@app.post("/decisions/{decision_id}/approve_hire")
async def approve_hire(decision_id: int):
    """인사(채용) 결재 승인 — 실제로 신규 페르소나를 생성해 즉시 대화 가능하게 만듦"""
    target = next((d for d in get_pending_decisions() if d["id"] == decision_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="대기 중인 결재가 아닙니다. 새로고침 후 다시 시도하세요.")
    if target["category"] != "인사":
        raise HTTPException(status_code=400, detail="인사 카테고리 결재만 채용 승인할 수 있습니다.")

    persona = draft_persona_from_decision(target["summary"], target["reason"])
    register_persona(persona["name"], persona["role"], persona["icon"], persona["parent"], persona["system_prompt"])
    create_custom_persona(persona["name"], persona["role"], persona["icon"], persona["parent"], persona["system_prompt"], decision_id)

    ok = resolve_decision(
        decision_id,
        f"채용 승인 — {persona['name']}({persona['role']}, {persona['parent']} 산하) 온보딩 완료. 즉시 호출 가능합니다.",
        decided_by="대표님",
    )
    if not ok:
        raise HTTPException(status_code=409, detail="이미 결재되었거나 존재하지 않는 사안입니다.")
    return {"status": "hired", "persona": persona}


@app.get("/personas/custom")
async def list_custom_personas():
    """결재 승인으로 실제 채용된 신규 페르소나 목록 — 대시보드 조직도 동적 표시용"""
    return {"personas": get_custom_personas()}


class CustomPersonaEditRequest(BaseModel):
    new_name: Optional[str] = None
    role: Optional[str] = None
    parent: Optional[str] = None
    system_prompt: Optional[str] = None


@app.patch("/personas/custom/{name}")
async def edit_custom_persona(name: str, req: CustomPersonaEditRequest):
    """채용 직후 잘못 배정된 소속/직책 교정, 이름 변경용"""
    if name not in PERSONAS or not PERSONAS[name].get("custom"):
        raise HTTPException(status_code=404, detail="커스텀 페르소나가 아닙니다.")
    if req.new_name and req.new_name in PERSONAS:
        raise HTTPException(status_code=409, detail="이미 존재하는 이름입니다.")
    ok = update_custom_persona(name, new_name=req.new_name, role=req.role, parent=req.parent, system_prompt=req.system_prompt)
    if not ok:
        raise HTTPException(status_code=404, detail="해당 페르소나를 찾을 수 없습니다.")
    rename_persona(name, req.new_name or name, role=req.role, parent=req.parent, system_prompt=req.system_prompt)
    return {"status": "updated", "name": req.new_name or name}


# ── Kade YEO 카드 메모 ────────────────────────────────────────
class MemoRequest(BaseModel):
    content: str


class MemoUpdateRequest(BaseModel):
    content: Optional[str] = None
    pinned: Optional[bool] = None
    checked: Optional[bool] = None
    done: Optional[bool] = None


@app.get("/memos")
async def list_memos():
    return {"memos": get_memos()}


@app.post("/memos")
async def add_memo(req: MemoRequest):
    memo_id = create_memo(req.content)
    return {"id": memo_id, "status": "created"}


@app.patch("/memos/{memo_id}")
async def patch_memo(memo_id: int, req: MemoUpdateRequest):
    ok = update_memo(memo_id, content=req.content, pinned=req.pinned, checked=req.checked, done=req.done)
    if not ok:
        raise HTTPException(status_code=404, detail="존재하지 않는 메모입니다.")
    return {"status": "updated"}


@app.delete("/memos/{memo_id}")
async def remove_memo(memo_id: int):
    ok = delete_memo(memo_id)
    if not ok:
        raise HTTPException(status_code=404, detail="존재하지 않는 메모입니다.")
    return {"status": "deleted"}


class PersonaStatusRequest(BaseModel):
    reason: Optional[str] = None


@app.post("/personas/{persona_name}/deactivate")
async def deactivate_persona(persona_name: str, req: PersonaStatusRequest = PersonaStatusRequest()):
    """비용 승인 게이트 — 페르소나 비활성화(해임). 프론트에서 비용 확인 후 호출."""
    if persona_name not in PERSONAS:
        raise HTTPException(status_code=404, detail=f"페르소나 없음: {persona_name}")
    set_persona_active(persona_name, False, updated_by="대표님")
    create_decision("인사", f"{persona_name} 해임(비활성화)", req.reason, decided_by="대표님")
    return {"status": "deactivated", "persona": persona_name}


@app.post("/personas/{persona_name}/activate")
async def activate_persona(persona_name: str, req: PersonaStatusRequest = PersonaStatusRequest()):
    if persona_name not in PERSONAS:
        raise HTTPException(status_code=404, detail=f"페르소나 없음: {persona_name}")
    set_persona_active(persona_name, True, updated_by="대표님")
    create_decision("인사", f"{persona_name} 재고용(활성화)", req.reason, decided_by="대표님")
    return {"status": "activated", "persona": persona_name}


@app.get("/activity/contention")
async def activity_contention():
    """워크플로 충돌 감지 — 동일 인물에게 미해결 작업 2건 이상 쌓인 경우"""
    return {"contention": get_contention_personas()}


@app.get("/activity/bottlenecks")
async def activity_bottlenecks():
    """병목 상세 — 누구에게 어떤 작업이 얼마나 오래 쌓여있는지 (다인 제안 경영기능 3/3)"""
    return {"bottlenecks": get_bottleneck_detail()}


class ProjectCreateRequest(BaseModel):
    name: str
    owner: Optional[str] = None
    due_date: Optional[str] = None


class ProjectStatusRequest(BaseModel):
    status: str


@app.get("/projects")
async def list_projects():
    return {"projects": get_projects()}


@app.post("/projects")
async def create_project_endpoint(req: ProjectCreateRequest):
    project_id = create_project(req.name, req.owner, req.due_date)
    return {"id": project_id, "status": "created"}


@app.patch("/projects/{project_id}/status")
async def update_project_status_endpoint(project_id: int, req: ProjectStatusRequest):
    ok = update_project_status(project_id, req.status)
    if not ok:
        raise HTTPException(status_code=404, detail="해당 프로젝트를 찾을 수 없습니다.")
    if req.status in ("done", "paused"):
        name = get_project_name(project_id)
        label = "완료" if req.status == "done" else "보류"
        create_decision("프로젝트", f"'{name}' 프로젝트 {label} 처리", decided_by="대표님")
    return {"status": req.status}


class ManualCostRequest(BaseModel):
    label: str
    amount: float
    billed_date: str
    currency: str = "USD"
    recurring: bool = False
    note: Optional[str] = None


class PurgeRequest(BaseModel):
    older_than_days: int = 180


@app.get("/admin/db_health")
async def admin_db_health():
    """감사 로그 포화 감지 — 보관(archived) 데이터 규모 및 가장 오래된 기록 시점"""
    return get_archive_stats()


@app.post("/admin/purge_archived")
async def admin_purge_archived(req: PurgeRequest):
    """오래된 보관(archived) 데이터를 JSON으로 백업한 뒤 영구 삭제. archived=FALSE인 살아있는 작업은 절대 건드리지 않음."""
    if req.older_than_days < 30:
        raise HTTPException(status_code=400, detail="최소 30일 이전 데이터만 정리할 수 있습니다 (안전장치).")
    return export_and_purge_archived(req.older_than_days)


@app.get("/cost/manual")
async def cost_manual_list():
    return {"costs": get_manual_costs_this_month()}


@app.post("/cost/manual")
async def cost_manual_add(req: ManualCostRequest):
    cost_id = create_manual_cost(req.label, req.amount, req.billed_date, req.currency, req.recurring, req.note)
    return {"id": cost_id, "status": "created"}


@app.delete("/cost/manual/{cost_id}")
async def cost_manual_delete(cost_id: int):
    ok = delete_manual_cost(cost_id)
    if not ok:
        raise HTTPException(status_code=404, detail="해당 항목을 찾을 수 없습니다.")
    return {"status": "deleted"}


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    return DASHBOARD_HTML


@app.get("/personas")
async def list_personas():
    """모든 팀원 페르소나 목록 반환 (VSCode 확장용)"""
    return {
        "personas": [
            {"name": name, "keywords": info["keywords"]}
            for name, info in PERSONAS.items()
        ]
    }

@app.get("/tasks")
async def get_tasks():
    tasks = get_pending_tasks()
    return [{"id": t[0], "title": t[1], "instruction": t[2], "assigned_to": t[3]} for t in tasks]

@app.get("/health")
async def health():
    return {"status": "ok", "agent": "jake"}


# ── OpenAI 호환 API (Open WebUI 연결용) ───────────────────────

@app.get("/v1/models")
async def list_models():
    created = int(time.time())
    models = [{"id": "jake-agent", "object": "model", "created": created, "owned_by": "longrise"}]
    for name in PERSONAS:
        models.append({"id": f"jake-{name}", "object": "model", "created": created, "owned_by": "longrise"})
    return {"object": "list", "data": models}

class OpenAIMessage(BaseModel):
    role: str
    content: str

class OpenAIChatRequest(BaseModel):
    model: str = "jake-agent"
    messages: List[OpenAIMessage]
    stream: Optional[bool] = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

@app.post("/v1/chat/completions")
async def openai_chat_completions(req: OpenAIChatRequest):
    user_message = ""
    history = []
    system_persona = None

    for msg in req.messages:
        if msg.role == "system":
            system_persona = detect_persona_from_system(msg.content)
        else:
            history.append({"role": msg.role, "content": msg.content})
        if msg.role == "user":
            user_message = msg.content

    # 마지막 user 메시지는 user_input으로 전달하므로 히스토리에서 제외
    history_without_last = history[:-1] if history and history[-1]["role"] == "user" else history

    # 모델 ID 페르소나 우선 (jake-렉스 → 렉스), 없으면 시스템 프롬프트, 없으면 키워드 감지
    model_persona = None
    if req.model.startswith("jake-") and req.model != "jake-agent":
        candidate = req.model[len("jake-"):]
        if candidate in PERSONAS:
            model_persona = candidate
    persona = model_persona or system_persona or detect_persona(user_message)

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: jake_graph.invoke({
        "messages": history_without_last,
        "user_input": user_message,
        "jake_response": "",
        "tasks_created": [],
        "persona": persona
    }))

    response_text = result["jake_response"]

    notify_jake_response(user_message, response_text, result["tasks_created"])
    count = get_total_conversation_count()
    check_and_analyze(count)

    completion_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"

    if req.stream:
        def generate():
            chunk_data = {
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": "jake-agent",
                "choices": [{
                    "index": 0,
                    "delta": {"role": "assistant", "content": response_text},
                    "finish_reason": None
                }]
            }
            yield f"data: {json.dumps(chunk_data, ensure_ascii=False)}\n\n"

            end_chunk = {
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": "jake-agent",
                "choices": [{
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop"
                }]
            }
            yield f"data: {json.dumps(end_chunk)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    return {
        "id": completion_id,
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "jake-agent",
        "choices": [{
            "index": 0,
            "message": {
                "role": "assistant",
                "content": response_text
            },
            "finish_reason": "stop"
        }],
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0
        }
    }
