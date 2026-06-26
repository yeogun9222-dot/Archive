from langchain_core.tools import tool
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os
import json
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

_BASE = os.path.dirname(os.path.dirname(__file__))
CREDS_FILE = os.path.join(_BASE, "google_credentials.json")
TOKEN_FILE = os.path.join(_BASE, "google_token.json")

# Jake 전용 공유 캘린더 ID (기본값: primary)
_SHARED_CAL_ID = os.getenv(
    "GOOGLE_SHARED_CALENDAR_ID",
    "27e0cb7b3ca3831a335c7629c9b83cf0131b8be77a383a1795684e677d86ed4e@group.calendar.google.com"
)


def _ensure_credential_files():
    """환경변수(Base64)에서 인증 파일을 복원 — 파일이 없을 때만 실행"""
    import base64
    creds_b64 = os.getenv("GOOGLE_CREDENTIALS_B64", "")
    token_b64 = os.getenv("GOOGLE_TOKEN_B64", "")
    if creds_b64 and not os.path.exists(CREDS_FILE):
        with open(CREDS_FILE, "wb") as f:
            f.write(base64.b64decode(creds_b64))
    if token_b64 and not os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "wb") as f:
            f.write(base64.b64decode(token_b64))


def _get_creds():
    _ensure_credential_files()
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_FILE, "w") as f:
                f.write(creds.to_json())
        else:
            raise RuntimeError("Google 인증 토큰 없음. GOOGLE_TOKEN_B64 환경변수를 확인하세요.")
    return creds


def _docs():
    return build("docs", "v1", credentials=_get_creds())


def _sheets():
    return build("sheets", "v4", credentials=_get_creds())


def _slides():
    return build("slides", "v1", credentials=_get_creds())


def _drive():
    return build("drive", "v3", credentials=_get_creds())


@tool
def create_google_doc(title: str, content: str) -> str:
    """Google Docs 문서를 생성하고 내용을 작성합니다. 보고서, 기획서, 회의록 등에 사용."""
    try:
        svc = _docs()
        doc = svc.documents().create(body={"title": title}).execute()
        doc_id = doc["documentId"]

        requests = [{"insertText": {"location": {"index": 1}, "text": content}}]
        svc.documents().batchUpdate(documentId=doc_id, body={"requests": requests}).execute()

        return f"✅ Google Docs 생성 완료\n제목: {title}\n링크: https://docs.google.com/document/d/{doc_id}/edit"
    except Exception as e:
        return f"오류: {e}"


@tool
def create_google_sheet(title: str, headers: str, rows: str) -> str:
    """Google Sheets 스프레드시트를 생성합니다. headers는 쉼표 구분, rows는 줄바꿈+쉼표 구분."""
    try:
        svc = _sheets()
        sheet = svc.spreadsheets().create(body={"properties": {"title": title}}).execute()
        sheet_id = sheet["spreadsheetId"]

        header_list = [h.strip() for h in headers.split(",")]
        row_list = [[c.strip() for c in r.split(",")] for r in rows.strip().split("\n") if r.strip()]
        values = [header_list] + row_list

        svc.spreadsheets().values().update(
            spreadsheetId=sheet_id,
            range="A1",
            valueInputOption="RAW",
            body={"values": values},
        ).execute()

        return f"✅ Google Sheets 생성 완료\n제목: {title}\n링크: https://docs.google.com/spreadsheets/d/{sheet_id}/edit"
    except Exception as e:
        return f"오류: {e}"


@tool
def create_google_slides(title: str, slides_outline: str) -> str:
    """Google Slides 프레젠테이션을 생성합니다. slides_outline은 슬라이드별 내용을 줄바꿈으로 구분."""
    try:
        svc = _slides()
        prs = svc.presentations().create(body={"title": title}).execute()
        prs_id = prs["presentationId"]

        slide_texts = [s.strip() for s in slides_outline.strip().split("\n") if s.strip()]
        requests = []

        for i, text in enumerate(slide_texts[:20]):
            requests.append({
                "insertText": {
                    "objectId": prs["slides"][0]["pageElements"][0]["objectId"] if i == 0 else None,
                    "insertionIndex": 0,
                    "text": text,
                }
            }) if i == 0 else None

            if i > 0:
                requests.append({"duplicateObject": {"objectId": prs["slides"][0]["objectId"]}})

        if requests:
            try:
                svc.presentations().batchUpdate(
                    presentationId=prs_id, body={"requests": requests}
                ).execute()
            except Exception:
                pass

        return f"✅ Google Slides 생성 완료\n제목: {title}\n링크: https://docs.google.com/presentation/d/{prs_id}/edit\n\n슬라이드 내용은 직접 편집하거나 추가 요청해주세요."
    except Exception as e:
        return f"오류: {e}"


@tool
def read_google_doc(doc_url_or_id: str) -> str:
    """Google Docs 문서 내용을 읽어옵니다. URL 또는 문서 ID를 입력하세요."""
    try:
        doc_id = doc_url_or_id
        if "docs.google.com" in doc_url_or_id:
            doc_id = doc_url_or_id.split("/d/")[1].split("/")[0]

        svc = _docs()
        doc = svc.documents().get(documentId=doc_id).execute()
        content = ""
        for elem in doc.get("body", {}).get("content", []):
            para = elem.get("paragraph")
            if para:
                for pe in para.get("elements", []):
                    content += pe.get("textRun", {}).get("content", "")

        return f"[{doc['title']}]\n\n{content[:3000]}"
    except Exception as e:
        return f"오류: {e}"


@tool
def list_drive_files(query: str = "") -> str:
    """Google Drive 파일 목록을 조회합니다. query로 파일명 검색 가능."""
    try:
        svc = _drive()
        q = f"name contains '{query}'" if query else "trashed=false"
        results = svc.files().list(
            q=q,
            pageSize=15,
            fields="files(id, name, mimeType, modifiedTime, webViewLink)",
            orderBy="modifiedTime desc",
        ).execute()

        files = results.get("files", [])
        if not files:
            return "파일 없음."

        lines = [f"[Drive 파일 목록 — '{query}' 검색]" if query else "[최근 Drive 파일]"]
        type_map = {
            "application/vnd.google-apps.document": "Docs",
            "application/vnd.google-apps.spreadsheet": "Sheets",
            "application/vnd.google-apps.presentation": "Slides",
        }
        for f in files:
            ftype = type_map.get(f["mimeType"], "파일")
            lines.append(f"  [{ftype}] {f['name']} — {f.get('webViewLink', '')}")

        return "\n".join(lines)
    except Exception as e:
        return f"오류: {e}"


@tool
def append_to_google_sheet(sheet_url_or_id: str, rows: str) -> str:
    """기존 Google Sheets에 데이터를 추가합니다. rows는 줄바꿈+쉼표 구분."""
    try:
        sheet_id = sheet_url_or_id
        if "spreadsheets" in sheet_url_or_id:
            sheet_id = sheet_url_or_id.split("/d/")[1].split("/")[0]

        row_list = [[c.strip() for c in r.split(",")] for r in rows.strip().split("\n") if r.strip()]
        svc = _sheets()
        svc.spreadsheets().values().append(
            spreadsheetId=sheet_id,
            range="A1",
            valueInputOption="RAW",
            insertDataOption="INSERT_ROWS",
            body={"values": row_list},
        ).execute()

        return f"✅ {len(row_list)}행 추가 완료\n링크: https://docs.google.com/spreadsheets/d/{sheet_id}/edit"
    except Exception as e:
        return f"오류: {e}"


def _gmail():
    return build("gmail", "v1", credentials=_get_creds())


def _calendar():
    return build("calendar", "v3", credentials=_get_creds())


@tool
def send_gmail(to: str, subject: str, body: str) -> str:
    """Gmail로 이메일을 발송합니다. to: 수신자 이메일, subject: 제목, body: 본문."""
    try:
        msg = MIMEMultipart()
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        svc = _gmail()
        svc.users().messages().send(userId="me", body={"raw": raw}).execute()

        return f"✅ 이메일 발송 완료\n수신: {to}\n제목: {subject}"
    except Exception as e:
        return f"오류: {e}"


@tool
def list_calendar_events(days: int = 7) -> str:
    """Google Calendar 일정을 조회합니다. days: 앞으로 몇 일치 (기본 7일)."""
    try:
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        end = now + timedelta(days=days)

        svc = _calendar()
        events = svc.events().list(
            calendarId=_SHARED_CAL_ID,
            timeMin=now.isoformat(),
            timeMax=end.isoformat(),
            maxResults=20,
            singleEvents=True,
            orderBy="startTime",
        ).execute()

        items = events.get("items", [])
        if not items:
            return f"앞으로 {days}일간 일정 없음."

        lines = [f"[앞으로 {days}일 일정]"]
        for e in items:
            start = e["start"].get("dateTime", e["start"].get("date", ""))[:16].replace("T", " ")
            lines.append(f"  {start} — {e.get('summary', '(제목 없음)')}")
        return "\n".join(lines)
    except Exception as e:
        return f"오류: {e}"


def _parse_calendar_datetime(date_str: str, time_str: str) -> str:
    """날짜+시간 문자열을 Google Calendar ISO 형식(2026-07-01T14:00:00+09:00)으로 변환"""
    import re
    from datetime import datetime as dt

    # 날짜 파싱
    date_str = date_str.strip()
    m = re.match(r'(\d{1,2})월\s*(\d{1,2})일?', date_str)
    if m:
        month, day = int(m.group(1)), int(m.group(2))
        year = dt.now().year
        if (month, day) < (dt.now().month, dt.now().day):
            year += 1
        date_iso = f"{year}-{month:02d}-{day:02d}"
    elif re.match(r'\d{4}-\d{2}-\d{2}', date_str):
        date_iso = date_str[:10]
    else:
        date_iso = date_str[:10]

    # 시간 파싱
    time_str = time_str.strip()
    m = re.match(r'오후\s*(\d{1,2})시?(?:\s*(\d{2})분?)?', time_str)
    if m:
        h = int(m.group(1))
        mins = int(m.group(2)) if m.group(2) else 0
        h = h + 12 if h < 12 else h
        time_iso = f"{h:02d}:{mins:02d}:00"
    else:
        m = re.match(r'오전\s*(\d{1,2})시?(?:\s*(\d{2})분?)?', time_str)
        if m:
            h = int(m.group(1)) % 12
            mins = int(m.group(2)) if m.group(2) else 0
            time_iso = f"{h:02d}:{mins:02d}:00"
        else:
            m = re.match(r'(\d{1,2}):(\d{2})', time_str)
            if m:
                time_iso = f"{int(m.group(1)):02d}:{m.group(2)}:00"
            else:
                m = re.match(r'(\d{1,2})시', time_str)
                time_iso = f"{int(m.group(1)):02d}:00:00" if m else "09:00:00"

    return f"{date_iso}T{time_iso}+09:00"


@tool
def create_calendar_event(title: str, date: str, start_time: str, end_time: str = "", description: str = "") -> str:
    """Google Calendar에 일정을 추가합니다.
    title: 일정 제목
    date: 날짜 (예: 2026-07-01, 7월1일)
    start_time: 시작 시간 (예: 14:00, 오후2시, 오전10시)
    end_time: 종료 시간 (비우면 시작+1시간 자동 설정)
    description: 메모 (선택)
    """
    try:
        start_iso = _parse_calendar_datetime(date, start_time)

        if end_time:
            end_iso = _parse_calendar_datetime(date, end_time)
        else:
            # 시작 시간 +1시간
            from datetime import datetime as dt, timedelta, timezone
            kst = timezone(timedelta(hours=9))
            start_dt = dt.fromisoformat(start_iso)
            end_iso = (start_dt + timedelta(hours=1)).isoformat()

        svc = _calendar()
        event = {
            "summary": title,
            "description": description,
            "start": {"dateTime": start_iso, "timeZone": "Asia/Seoul"},
            "end": {"dateTime": end_iso, "timeZone": "Asia/Seoul"},
        }
        result = svc.events().insert(calendarId=_SHARED_CAL_ID, body=event).execute()
        return (
            f"일정 추가 완료\n"
            f"제목: {title}\n"
            f"날짜: {date}\n"
            f"시간: {start_time} ~ {end_time or '(+1시간)'}\n"
            f"링크: {result.get('htmlLink', '')}"
        )
    except Exception as e:
        return f"오류: {e}"


@tool
def search_calendar_events(keyword: str, date: str = "") -> str:
    """Google Calendar에서 특정 키워드와 날짜로 일정을 검색합니다.
    keyword: 검색할 일정 제목 키워드
    date: 검색 날짜 (예: 2026-07-03, 7월3일). 비우면 향후 30일 전체 검색.
    반환값에 event_id가 포함되어 있어 삭제 시 사용 가능.
    """
    try:
        from datetime import timezone, timedelta
        svc = _calendar()

        if date:
            # 날짜 파싱
            import re
            m = re.match(r'(\d{1,2})월\s*(\d{1,2})일?', date)
            if m:
                month, day = int(m.group(1)), int(m.group(2))
                year = datetime.now().year
                date_iso = f"{year}-{month:02d}-{day:02d}"
            else:
                date_iso = date[:10]
            time_min = f"{date_iso}T00:00:00+09:00"
            time_max = f"{date_iso}T23:59:59+09:00"
        else:
            now = datetime.now(timezone(timedelta(hours=9)))
            time_min = now.isoformat()
            time_max = (now + timedelta(days=30)).isoformat()

        events = svc.events().list(
            calendarId=_SHARED_CAL_ID,
            timeMin=time_min,
            timeMax=time_max,
            q=keyword,
            maxResults=10,
            singleEvents=True,
            orderBy="startTime",
        ).execute()

        items = events.get("items", [])
        if not items:
            return f"'{keyword}' 관련 일정을 찾을 수 없습니다."

        lines = [f"['{keyword}' 검색 결과]"]
        for e in items:
            start = e["start"].get("dateTime", e["start"].get("date", ""))[:16].replace("T", " ")
            lines.append(f"  {start} — {e.get('summary', '(제목 없음)')} [ID: {e['id']}]")
        return "\n".join(lines)
    except Exception as e:
        return f"오류: {e}"


@tool
def delete_calendar_event(event_id: str) -> str:
    """Google Calendar 일정을 삭제합니다.
    event_id: search_calendar_events로 조회한 이벤트 ID
    반복 일정의 경우 해당 날짜 1건만 삭제됩니다.
    """
    try:
        svc = _calendar()
        svc.events().delete(calendarId=_SHARED_CAL_ID, eventId=event_id).execute()
        return "✅ 일정 삭제 완료"
    except Exception as e:
        return f"오류: {e}"


def get_all_google_tools():
    return [
        create_google_doc,
        create_google_sheet,
        create_google_slides,
        read_google_doc,
        list_drive_files,
        append_to_google_sheet,
        send_gmail,
        list_calendar_events,
        create_calendar_event,
        search_calendar_events,
        delete_calendar_event,
    ]
