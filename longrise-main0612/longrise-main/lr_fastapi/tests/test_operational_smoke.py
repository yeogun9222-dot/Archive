from __future__ import annotations

from datetime import datetime, timedelta
from httpx import ASGITransport, AsyncClient
import pytest
from uuid import uuid4

from sqlalchemy import delete, select, text

from app.core.database import async_session_maker
from app.core.security import get_password_hash
from app.models.email_verification import EmailVerification
from app.models.user import User
from main import app
from seed_operational_data import main as seed_operational_data


USER_EMAIL = "ops.smoke@longrise.ai"
USER_PASSWORD = "Longrise!2026"
ADMIN_USERNAME = "super_ops"
ADMIN_PASSWORD = "LongriseAdmin!2026"


@pytest.mark.asyncio
async def test_operational_smoke_flow() -> None:
    await seed_operational_data()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        signup_email = f"signup-smoke-{uuid4().hex[:10]}@longrise.ai"
        signup_password = "Longrise!2026"

        email_check = await client.post(
            "/api/v1/auth/signup/check-email",
            json={"email": signup_email},
        )
        assert email_check.status_code == 200
        assert email_check.json()["available"] is True

        signup_code = "123456"
        async with async_session_maker() as session:
            session.add(
                EmailVerification(
                    email=signup_email,
                    purpose="signup",
                    code_hash=get_password_hash(signup_code),
                    expires_at=datetime.utcnow() + timedelta(minutes=10),
                )
            )
            await session.commit()

        verify_code = await client.post(
            "/api/v1/auth/signup/verify-code",
            json={"email": signup_email, "code": signup_code},
        )
        assert verify_code.status_code == 200
        assert verify_code.json()["verified"] is True

        missing_referral_signup = await client.post(
            "/api/v1/auth/signup/complete",
            json={"email": signup_email, "password": signup_password},
        )
        assert missing_referral_signup.status_code == 422

        complete_signup = await client.post(
            "/api/v1/auth/signup/complete",
            json={"email": signup_email, "password": signup_password, "referral_code": "DRAGON88"},
        )
        assert complete_signup.status_code == 200
        signup_token = complete_signup.json()["access_token"]
        signup_headers = {"Authorization": f"Bearer {signup_token}"}

        signup_me = await client.get("/api/v1/users/me", headers=signup_headers)
        assert signup_me.status_code == 200
        assert signup_me.json()["email"] == signup_email
        assert signup_me.json()["referred_by_code"] == "DRAGON88"

        duplicate_email_check = await client.post(
            "/api/v1/auth/signup/check-email",
            json={"email": signup_email},
        )
        assert duplicate_email_check.status_code == 200
        assert duplicate_email_check.json()["available"] is False

        async with async_session_maker() as session:
            signup_user = await session.scalar(select(User).where(User.email == signup_email))
            if signup_user:
                await session.execute(
                    text(
                        """
                        UPDATE users
                        SET team_size = GREATEST(team_size - 1, 0),
                            referred_count = GREATEST(referred_count - 1, 0)
                        WHERE referral_code = 'DRAGON88'
                        """
                    )
                )
                await session.delete(signup_user)
            await session.execute(delete(EmailVerification).where(EmailVerification.email == signup_email))
            await session.commit()

        user_login = await client.post(
            "/api/v1/auth/login/json",
            json={"email": USER_EMAIL, "password": USER_PASSWORD},
        )
        assert user_login.status_code == 200
        user_token = user_login.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}

        packages_response = await client.get("/api/v1/investments/packages")
        assert packages_response.status_code == 200
        packages = packages_response.json()
        assert len(packages) >= 5

        dashboard_response = await client.get("/api/v1/dashboard/me", headers=user_headers)
        assert dashboard_response.status_code == 200
        dashboard_payload = dashboard_response.json()
        assert "wallet" in dashboard_payload
        assert "market" in dashboard_payload
        assert "news" in dashboard_payload

        transactions_response = await client.get("/api/v1/transactions/me", headers=user_headers)
        assert transactions_response.status_code == 200
        initial_user_response = await client.get("/api/v1/users/me", headers=user_headers)
        assert initial_user_response.status_code == 200
        user_id = initial_user_response.json()["id"]

        trading_password_response = await client.post(
            "/api/v1/account/trading-password/verify",
            headers=user_headers,
            json={"password": "0000"},
        )
        assert trading_password_response.status_code == 200
        assert trading_password_response.json()["verified"] is True

        conversion_response = await client.post(
            "/api/v1/wallet/conversions",
            headers=user_headers,
            json={"amount": "5"},
        )
        assert conversion_response.status_code == 200
        assert conversion_response.json()["conversionId"].startswith("CNV-")

        transfer_response = await client.post(
            "/api/v1/wallet/transfers",
            headers=user_headers,
            json={
                "recipient": "ops.leader@longrise.ai",
                "amount": "3",
                "asset": "USDT",
                "trading_password": "0000",
            },
        )
        assert transfer_response.status_code == 201
        assert transfer_response.json()["transferId"].startswith("TRF-")

        deposit_response = await client.post(
            "/api/v1/wallet/deposit-requests",
            headers=user_headers,
            json={
                "leader_id": "LEAD2000",
                "leader_name": "Operations Leader",
                "bank_account": "QA-SETTLEMENT-ACCOUNT",
                "deposit_amount": "20",
                "notes": "Operational smoke deposit request",
            },
        )
        assert deposit_response.status_code == 201

        support_response = await client.post(
            "/api/v1/support/tickets",
            headers=user_headers,
            json={
                "title": "Operational smoke support",
                "description": "Verify support ticket creation from the user frontend flow.",
                "category": "GENERAL",
                "priority": "medium",
            },
        )
        assert support_response.status_code == 201

        fraud_response = await client.post(
            "/api/v1/support/fraud-reports",
            headers=user_headers,
            json={
                "fraudster_uid": "ops-risk-user",
                "fraud_reason": "impersonation",
                "description": "Smoke test evidence validates the fraud-report flow.",
                "evidence": ["internal-ledger-note"],
            },
        )
        assert fraud_response.status_code == 201

        withdrawal_response = await client.post(
            "/api/v1/withdrawals/",
            headers=user_headers,
            json={
                "amount": "10",
                "asset": "USDT",
                "network": "INTERNAL",
                "wallet_address": "ops-ledger-settlement",
                "trading_password": "0000",
            },
        )
        assert withdrawal_response.status_code == 201
        withdrawal_id = withdrawal_response.json()["withdrawal_id"]

        cancel_withdrawal_response = await client.post(
            f"/api/v1/withdrawals/my/{withdrawal_id}/cancel",
            headers=user_headers,
        )
        assert cancel_withdrawal_response.status_code == 200

        investment_response = await client.post(
            "/api/v1/investments/purchase",
            headers=user_headers,
            json={"package_id": "flexible", "amount": "100"},
        )
        assert investment_response.status_code == 201

        p2p_response = await client.post(
            "/api/v1/market/p2p/orders",
            headers=user_headers,
            json={
                "asset": "CNYT",
                "trade_type": "sell",
                "amount": "25",
                "price_per_unit": "0.0312",
                "currency": "USDT",
            },
        )
        assert p2p_response.status_code == 201

        market_response = await client.get("/api/v1/market/p2p?asset=CNYT", headers=user_headers)
        assert market_response.status_code == 200
        assert market_response.json()["stats"]["activeListings"] >= 1

        usdt_market_response = await client.get("/api/v1/market/p2p?asset=USDT", headers=user_headers)
        assert usdt_market_response.status_code == 200
        assert usdt_market_response.json()["stats"]["activeListings"] >= 1

        usdt_p2p_response = await client.post(
            "/api/v1/market/p2p/orders",
            headers=user_headers,
            json={
                "asset": "USDT",
                "trade_type": "sell",
                "amount": "10",
                "price_per_unit": "1.0000",
                "currency": "USDT",
            },
        )
        assert usdt_p2p_response.status_code == 201

        admin_login = await client.post(
            "/api/v1/admin/login/json",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        admin_dashboard = await client.get(
            "/api/v1/dashboard/admin",
            headers=admin_headers,
        )
        assert admin_dashboard.status_code == 200
        dashboard = admin_dashboard.json()
        assert "revenueData" in dashboard
        assert "actionQueue" in dashboard

        settings_response = await client.get("/api/v1/admin-console/settings/core", headers=admin_headers)
        assert settings_response.status_code == 200
        assert "withdrawals_enabled" in settings_response.json()

        update_settings_response = await client.put(
            "/api/v1/admin-console/settings/withdrawals_enabled",
            headers=admin_headers,
            json={"setting_value": "true", "change_reason": "operational smoke verification"},
        )
        assert update_settings_response.status_code == 200

        balance_adjust_response = await client.put(
            f"/api/v1/admin-console/users/{user_id}/balance",
            headers=admin_headers,
            json={"currency": "CNYT", "amount": "1"},
        )
        assert balance_adjust_response.status_code == 200

        restriction_response = await client.put(
            f"/api/v1/admin-console/users/{user_id}/restrictions",
            headers=admin_headers,
            json={"restriction_type": "withdrawal", "enabled": False},
        )
        assert restriction_response.status_code == 200

    await seed_operational_data()
