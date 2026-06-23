from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel
from jake_agent.graph import build_jake_graph
from jake_agent.db import get_pending_tasks
from jake_agent.telegram import notify_jake_response, notify_startup
from jake_agent.telegram_bot import start_bot_thread
from jake_agent.personas import detect_persona
from jake_agent.analyzer import check_and_analyze, get_total_conversation_count
from jake_agent.monitor import start_monitor_thread

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_bot_thread()
    start_monitor_thread()
    notify_startup()
    yield

app = FastAPI(title="Jake Orchestrator API", lifespan=lifespan)
jake_graph = build_jake_graph()

conversation_history = []

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    tasks_created: list
    persona: str

@app.post("/chat", response_model=ChatResponse)
async def chat_with_jake(req: ChatRequest):
    persona = detect_persona(req.message)

    result = jake_graph.invoke({
        "messages": conversation_history,
        "user_input": req.message,
        "jake_response": "",
        "tasks_created": [],
        "persona": persona
    })

    conversation_history.extend([
        {"role": "user", "content": req.message},
        {"role": "assistant", "content": result["jake_response"]}
    ])

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
