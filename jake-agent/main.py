from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import json
import time
import uuid

from jake_agent.graph import build_jake_graph
from jake_agent.db import get_pending_tasks, get_recent_conversation_history, init_db
from jake_agent.telegram import notify_jake_response, notify_startup
from jake_agent.telegram_bot import start_bot_thread
from jake_agent.personas import detect_persona, detect_persona_from_system
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
    return {
        "object": "list",
        "data": [
            {
                "id": "jake-agent",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "longrise"
            }
        ]
    }

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

    # 시스템 프롬프트 페르소나 우선, 없으면 메시지 키워드 감지
    persona = system_persona or detect_persona(user_message)

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
