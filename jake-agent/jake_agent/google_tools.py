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
            calendarId="primary",
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


@tool
def create_calendar_event(title: str, start_datetime: str, end_datetime: str, description: str = "") -> str:
    """Google Calendar에 일정을 추가합니다. start/end_datetime 형식: 2026-06-27T10:00:00+09:00"""
    try:
        svc = _calendar()
        event = {
            "summary": title,
            "description": description,
            "start": {"dateTime": start_datetime, "timeZone": "Asia/Seoul"},
            "end": {"dateTime": end_datetime, "timeZone": "Asia/Seoul"},
        }
        result = svc.events().insert(calendarId="primary", body=event).execute()
        return f"✅ 일정 추가 완료\n제목: {title}\n시작: {start_datetime}\n링크: {result.get('htmlLink', '')}"
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
    ]
