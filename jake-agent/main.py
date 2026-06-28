from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import json
import time
import uuid

from jake_agent.graph import build_jake_graph
from jake_agent.db import get_pending_tasks, get_recent_conversation_history, init_db, save_chat_message, get_chat_history, clear_chat_history, get_recent_activity, log_ceo_instruction
from jake_agent.dashboard_html import DASHBOARD_HTML
from jake_agent.telegram import notify_jake_response, notify_startup
from jake_agent.telegram_bot import start_bot_thread
from jake_agent.personas import detect_persona, detect_persona_from_system, PERSONAS
from jake_agent.analyzer import check_and_analyze, get_total_conversation_count
from jake_agent.monitor import start_monitor_thread
from jake_agent.scheduler import start_scheduler_thread

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
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


@app.post("/chat/persona/{persona_name}", response_model=ChatResponse)
async def chat_with_persona(persona_name: str, req: PersonaChatRequest):
    """VSCode 확장에서 특정 페르소나와 직접 대화하는 엔드포인트"""
    if persona_name not in PERSONAS:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"페르소나 없음: {persona_name}")

    history = get_chat_history(persona_name, limit=20)
    messages_history = [{"role": m["role"], "content": m["content"]} for m in history]

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: jake_graph.invoke({
        "messages": messages_history,
        "user_input": req.message,
        "jake_response": "",
        "tasks_created": [],
        "persona": persona_name,
        "image_base64": "",
        "image_mime": "image/jpeg",
    }))

    save_chat_message(persona_name, "user", req.message, source=req.source)
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
