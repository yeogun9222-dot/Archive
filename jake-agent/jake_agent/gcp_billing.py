import os
import base64
import json
from datetime import datetime

# 서비스 계정 키는 디스크에 영구 저장하지 않고, 매 호출 시 env(GCP_BILLING_KEY_B64)에서
# 메모리로만 복원해 사용 — google_tools.py의 b64 패턴과 동일한 보안 원칙
GCP_BILLING_PROJECT = os.getenv("GCP_BILLING_PROJECT", "rugged-reality-500602-d7")
GCP_BILLING_DATASET = os.getenv("GCP_BILLING_DATASET", "billing_export")
GCP_BILLING_TABLE = os.getenv("GCP_BILLING_TABLE", "")  # 예: gcp_billing_export_resource_v1_XXXXXXXXXX


def _get_credentials():
    key_b64 = os.getenv("GCP_BILLING_KEY_B64", "")
    if not key_b64:
        return None
    from google.oauth2 import service_account
    info = json.loads(base64.b64decode(key_b64))
    return service_account.Credentials.from_service_account_info(info)


def get_gcp_billing_cost_this_month() -> dict:
    """BigQuery Billing Export에서 이번 달 실제 GCP 순비용(크레딧 차감 후)을 조회.
    설정이 안 됐거나 내보내기 테이블이 아직 생성되지 않은 경우 available=False로 안전하게 반환."""
    if not GCP_BILLING_TABLE:
        return {"available": False, "reason": "GCP_BILLING_TABLE 미설정 — BigQuery에서 테이블 이름 확인 후 .env에 추가 필요"}

    creds = _get_credentials()
    if creds is None:
        return {"available": False, "reason": "GCP_BILLING_KEY_B64 미설정"}

    try:
        from google.cloud import bigquery
        client = bigquery.Client(project=GCP_BILLING_PROJECT, credentials=creds)
        month_str = datetime.now().strftime("%Y%m")
        query = f"""
            SELECT
              SUM(cost) AS gross_cost,
              SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) AS c), 0)) AS credits_total
            FROM `{GCP_BILLING_PROJECT}.{GCP_BILLING_DATASET}.{GCP_BILLING_TABLE}`
            WHERE invoice.month = @month
        """
        job = client.query(query, job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("month", "STRING", month_str)]
        ))
        row = list(job.result())[0]
        gross = float(row.gross_cost or 0)
        credits = float(row.credits_total or 0)
        net = round(gross + credits, 4)  # credits는 보통 음수로 기록되어 있어 더하면 차감됨
        return {"available": True, "net_cost_usd": net, "gross_cost_usd": round(gross, 4), "credits_usd": round(credits, 4), "month": month_str}
    except Exception as e:
        return {"available": False, "reason": f"BigQuery 조회 실패: {e}"}
