import os
import json
import threading
import urllib.request
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

_offset = 0

def get_updates():
    global _offset
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?offset={_offset}&timeout=30"
        with urllib.request.urlopen(url, timeout=35) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("result", [])
    except Exception:
        return []

def process_message(text: str) -> str:
    """Jake API에 메시지 전달하고 응답 받기"""
    try:
        payload = json.dumps({"message": text}).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result.get("response", "응답 없음")
    except Exception as e:
        return f"오류 발생: {e}"

def send_message(text: str):
    if not BOT_TOKEN or not CHAT_ID:
        return
    for parse_mode in ["Markdown", None]:
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            body = {"chat_id": CHAT_ID, "text": text[:4000]}
            if parse_mode:
                body["parse_mode"] = parse_mode
            payload = json.dumps(body).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req, timeout=10)
            return
        except Exception as e:
            if parse_mode is None:
                print(f"Telegram send error: {e}")

def start_polling():
    global _offset
    print("Telegram bot polling started...")

    while True:
        updates = get_updates()
        for update in updates:
            _offset = update["update_id"] + 1
            msg = update.get("message", {})
            chat_id = str(msg.get("chat", {}).get("id", ""))
            text = msg.get("text", "").strip()

            # 대표님 채팅만 처리
            if chat_id != CHAT_ID or not text:
                continue

            print(f"[Telegram 수신] {text}")
            send_message("처리 중입니다...")

            response = process_message(text)
            send_message(response)

def start_bot_thread():
    thread = threading.Thread(target=start_polling, daemon=True)
    thread.start()
    return thread
