import os
import urllib.request
import urllib.parse
import json
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_message(text: str) -> bool:
    if not BOT_TOKEN or not CHAT_ID:
        return False
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = json.dumps({"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"Telegram error: {e}")
        return False

def notify_jake_response(user_input: str, jake_reply: str, tasks: list):
    tasks_text = ""
    if tasks:
        tasks_text = "\n\n📋 *DB 저장된 작업:*\n"
        for t in tasks:
            tasks_text += f"  • {t['member']} (ID: {t['task_id']})\n"

    message = (
        f"🤖 *제이크 보고*\n\n"
        f"📌 *대표님 지시:*\n{user_input[:200]}\n\n"
        f"💬 *제이크 응답:*\n{jake_reply[:500]}{'...' if len(jake_reply) > 500 else ''}"
        f"{tasks_text}"
    )
    return send_message(message)

def notify_startup():
    message = (
        "✅ *Jake Orchestrator 시작됨*\n\n"
        "컴퓨터가 켜졌습니다. 제이크 에이전트 시스템이 활성화되었습니다.\n"
        "OpenWebUI: http://localhost:3000\n"
        "Jake API: http://localhost:8000"
    )
    return send_message(message)
