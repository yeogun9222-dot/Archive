from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel
from jake_agent.graph import build_jake_graph
from jake_agent.db import get_pending_tasks
from jake_agent.telegram import notify_jake_response, notify_startup

@asynccontextmanager
async def lifespan(app: FastAPI):
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

@app.post("/chat", response_model=ChatResponse)
async def chat_with_jake(req: ChatRequest):
    result = jake_graph.invoke({
        "messages": conversation_history,
        "user_input": req.message,
        "jake_response": "",
        "tasks_created": []
    })

    conversation_history.extend([
        {"role": "user", "content": req.message},
        {"role": "assistant", "content": result["jake_response"]}
    ])

    notify_jake_response(req.message, result["jake_response"], result["tasks_created"])

    return ChatResponse(
        response=result["jake_response"],
        tasks_created=result["tasks_created"]
    )

@app.get("/tasks")
async def get_tasks():
    tasks = get_pending_tasks()
    return [{"id": t[0], "title": t[1], "instruction": t[2], "assigned_to": t[3]} for t in tasks]

@app.get("/health")
async def health():
    return {"status": "ok", "agent": "jake"}
