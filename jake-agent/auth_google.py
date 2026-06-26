"""
Google OAuth2 최초 인증 스크립트 — 로컬 PC에서 1회만 실행하면 됩니다.
실행 후 생성된 google_token.json을 git push하여 서버에 배포하세요.
"""
from google_auth_oauthlib.flow import InstalledAppFlow
import os

SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

CREDS_FILE = os.path.join(os.path.dirname(__file__), "google_credentials.json")
TOKEN_FILE = os.path.join(os.path.dirname(__file__), "google_token.json")

flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
creds = flow.run_local_server(port=0)

with open(TOKEN_FILE, "w") as f:
    f.write(creds.to_json())

print(f"\n✅ 인증 완료! google_token.json 저장됨: {TOKEN_FILE}")
print("이제 git push 후 서버에 배포하세요.")
