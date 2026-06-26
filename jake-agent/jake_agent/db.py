import psycopg2
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", 5432),
        dbname=os.getenv("DB_NAME", "jakedb"),
        user=os.getenv("DB_USER", "jake"),
        password=os.getenv("DB_PASSWORD", "jake1234")
    )

def create_task(title: str, instruction: str, assigned_to: str) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tasks (title, instruction, assigned_to, status) VALUES (%s, %s, %s, 'pending') RETURNING id",
        (title, instruction, assigned_to)
    )
    task_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return task_id

def update_task(task_id: int, status: str, result: str = None):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "UPDATE tasks SET status=%s, result=%s, updated_at=%s WHERE id=%s",
        (status, result, datetime.now(), task_id)
    )
    conn.commit()
    cur.close()
    conn.close()

def log_conversation(agent: str, message: str, task_id: int = None):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO conversation_log (agent, message, related_task_id) VALUES (%s, %s, %s)",
        (agent, message, task_id)
    )
    conn.commit()
    cur.close()
    conn.close()

def get_pending_tasks():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, title, instruction, assigned_to FROM tasks WHERE status='pending' ORDER BY created_at")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

def get_recent_conversation_history(persona: str, limit: int = 20) -> list:
    """최근 대화를 messages 형식으로 반환. 새 세션 시작 시 컨텍스트 복원용."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT message FROM conversation_log WHERE agent = %s ORDER BY timestamp DESC LIMIT %s",
        (persona, limit * 2)
    )
    rows = [r[0] for r in cur.fetchall()]
    cur.close()
    conn.close()

    messages = []
    for message in reversed(rows):
        if message.startswith("대표님:"):
            content = message[len("대표님:"):].strip()
            messages.append({"role": "user", "content": content})
        elif ":" in message:
            content = message.split(":", 1)[1].strip()
            messages.append({"role": "assistant", "content": content})
    return messages
