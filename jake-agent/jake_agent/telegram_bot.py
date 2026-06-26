import os
import json
import threading
import urllib.request
import time
import re
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
MONITOR_GROUP_IDS = set(
    g.strip() for g in os.getenv("TELEGRAM_GROUP_IDS", "").split(",") if g.strip()
)
RESPONSE_GROUP_IDS = set(
    g.strip() for g in os.getenv("TELEGRAM_RESPONSE_GROUP_IDS", "").split(",") if g.strip()
)
RESPONSE_TRIGGERS = ["제이크", "jake"]

# 그룹 멤버 호칭 매핑 (first_name 기준)
MEMBER_TITLES = {
    "lskim": "김과장님",
    "skim": "김과장님",
    "hyung": "천사이사님",
    "lee": "천사이사님",
    "형희": "천사이사님",
    "철재": "임의장님",
    "임": "임의장님",
    "kade": "대표님",
    "yeo": "대표님",
}


def _get_title(sender: str) -> str:
    s = sender.lower()
    for key, title in MEMBER_TITLES.items():
        if key in s:
            return title
    return f"{sender}님"

_offset = 0
_group_buffers = defaultdict(list)  # {group_id: [(time_str, sender, text), ...]}
_group_names = {}                    # {group_id: group_title}
_BUFFER_MAX = 100
_URGENT_KEYWORDS = ["긴급", "급함", "urgent", "즉시", "!!"]


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
    try:
        payload = json.dumps({"message": text, "source": "telegram"}).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
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


def send_group_message(chat_id: str, text: str):
    """그룹 채팅으로 메시지 전송"""
    if not BOT_TOKEN:
        return
    for parse_mode in ["Markdown", None]:
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            body = {"chat_id": chat_id, "text": text[:4000]}
            if parse_mode:
                body["parse_mode"] = parse_mode
            payload = json.dumps(body).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req, timeout=10)
            return
        except Exception as e:
            if parse_mode is None:
                print(f"Telegram send_group_message error: {e}")


def send_document(file_path: str, caption: str = ""):
    """파일(PDF, 엑셀 등)을 텔레그램으로 전송"""
    if not BOT_TOKEN or not CHAT_ID:
        return
    import mimetypes
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
        with open(file_path, "rb") as f:
            file_data = f.read()

        filename = os.path.basename(file_path)
        boundary = f"boundary{int(time.time())}"
        mime = mimetypes.guess_type(file_path)[0] or "application/octet-stream"

        body = b""
        body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"chat_id\"\r\n\r\n{CHAT_ID}\r\n".encode()
        if caption:
            body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"caption\"\r\n\r\n{caption[:1024]}\r\n".encode()
        body += (
            f"--{boundary}\r\n"
            f"Content-Disposition: form-data; name=\"document\"; filename=\"{filename}\"\r\n"
            f"Content-Type: {mime}\r\n\r\n"
        ).encode()
        body += file_data
        body += f"\r\n--{boundary}--\r\n".encode()

        req = urllib.request.Request(url, data=body)
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        urllib.request.urlopen(req, timeout=60)
    except Exception as e:
        print(f"Telegram send_document error: {e}")


def _buffer_group_message(group_id: str, group_title: str, sender: str, text: str):
    _group_names[group_id] = group_title
    ts = time.strftime("%H:%M")
    buf = _group_buffers[group_id]
    buf.append((ts, sender, text))
    if len(buf) > _BUFFER_MAX:
        buf.pop(0)

    # 긴급 키워드 감지 시 즉시 개인 채팅으로 전달
    if any(kw in text for kw in _URGENT_KEYWORDS):
        send_message(f"[긴급 알림 — {group_title}]\n{sender}: {text}")


def _summarize_groups() -> str:
    if not _group_buffers:
        return "모니터링 중인 그룹에 아직 메시지가 없습니다."

    parts = []
    for gid, msgs in _group_buffers.items():
        name = _group_names.get(gid, gid)
        lines = "\n".join(f"{ts} {sender}: {txt}" for ts, sender, txt in msgs[-30:])
        parts.append(f"[그룹: {name}]\n{lines}")

    combined = "\n\n".join(parts)
    return process_message(
        f"다음은 텔레그램 단톡방 최근 메시지입니다. 각 그룹별로 핵심 내용과 액션 아이템을 요약해줘:\n\n{combined}"
    )


def start_polling():
    global _offset
    # 재시작 시 기존 미처리 메시지 건너뜀 (중복 처리 방지)
    pending = get_updates()
    if pending:
        _offset = pending[-1]["update_id"] + 1

    print(f"Telegram bot polling started... (모니터링 그룹: {MONITOR_GROUP_IDS or '없음'})")

    while True:
        updates = get_updates()
        for update in updates:
            _offset = update["update_id"] + 1
            msg = update.get("message", {})
            chat = msg.get("chat", {})
            chat_id = str(chat.get("id", ""))
            chat_type = chat.get("type", "")
            text = msg.get("text", "").strip()

            if not text:
                continue

            # 그룹 메시지 처리
            if chat_type in ("group", "supergroup"):
                sender = msg.get("from", {}).get("first_name", "알 수 없음")
                group_title = chat.get("title", chat_id)

                # 응답 그룹: "제이크"/"jake" 호출 시 그룹에서 직접 응답
                if chat_id in RESPONSE_GROUP_IDS:
                    if any(t in text.lower() for t in RESPONSE_TRIGGERS):
                        print(f"[그룹 응답] {group_title} | {sender}: {text}")
                        title = _get_title(sender)

                        # 느린 작업 선응답
                        _SLOW_TOPICS = ["항공권", "비행기", "항공편", "flight", "환율", "환전", "달러", "엔화", "유로", "날씨"]
                        _ACTION_KEYWORDS = ["찾아줘", "검색해줘", "검색해주", "알려줘", "조회해줘", "확인해줘"]
                        _CONSULT_KEYWORDS = ["전략", "방법", "어떻게", "접근", "좋을까", "할까", "추천", "의견", "조언", "방향", "계획"]
                        if any(t in text for t in _SLOW_TOPICS) and any(a in text for a in _ACTION_KEYWORDS):
                            send_group_message(chat_id, "네, 잠시만요! 바로 검색해드릴게요.")
                        elif any(c in text for c in _CONSULT_KEYWORDS):
                            send_group_message(chat_id, "좋은 질문이에요! 잠시만요, 팀원들에게 의견 종합해볼게요.")

                        group_context = (
                            f"[그룹 채팅 응답]\n"
                            f"이 그룹({group_title})에는 대표님보다 연장자이신 임원진 및 그룹사 의장님들이 계십니다. "
                            f"반드시 격식체(존댓말)로 정중하게 답변하세요. "
                            f"질문자 호칭은 '{title}'입니다. 첫 문장에 자연스럽게 포함하세요.\n\n"
                            f"{title} 질문: {text}"
                        )
                        response = process_message(group_context)
                        send_group_message(chat_id, response)

                # 모니터링 그룹: 조용히 버퍼링
                if chat_id in MONITOR_GROUP_IDS:
                    _buffer_group_message(chat_id, group_title, sender, text)

                # 미등록 그룹 ID 로그 출력 (등록 도움용)
                if chat_id not in MONITOR_GROUP_IDS and chat_id not in RESPONSE_GROUP_IDS:
                    print(f"[그룹 미등록] chat_id={chat_id} title={group_title}")

                continue

            # 대표님 개인 채팅만 처리
            if chat_id != CHAT_ID or not text:
                continue

            print(f"[Telegram 수신] {text}")

            # 그룹 요약 명령
            if text in ("/그룹요약", "그룹요약", "/group_summary"):
                send_message("그룹 메시지 요약 중입니다...")
                send_message(_summarize_groups())
                continue

            send_message("처리 중입니다...")
            response = process_message(text)
            send_message(response)


def start_bot_thread():
    thread = threading.Thread(target=start_polling, daemon=True)
    thread.start()
    return thread
