"""
Account-level services for profile and security actions.
"""
from __future__ import annotations

import base64
import io
import json
import secrets
import string
from datetime import datetime, timedelta

import pyotp
import qrcode
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.services.user_service import UserService


class AccountService:
    """Profile and security updates for authenticated users."""

    @staticmethod
    def _otp_fernet() -> Fernet:
        if settings.OTP_ENCRYPTION_KEY:
            return Fernet(settings.OTP_ENCRYPTION_KEY.encode("utf-8"))

        if not settings.is_development:
            raise ValueError("OTP_ENCRYPTION_KEY is required outside development")

        raw_key = base64.urlsafe_b64encode(settings.SECRET_KEY.encode("utf-8")[:32].ljust(32, b"0"))
        return Fernet(raw_key)

    @staticmethod
    def _encrypt_otp_secret(secret: str) -> str:
        return AccountService._otp_fernet().encrypt(secret.encode("utf-8")).decode("utf-8")

    @staticmethod
    def _decrypt_otp_secret(encrypted_secret: str | None) -> str | None:
        if not encrypted_secret:
            return None
        try:
            return AccountService._otp_fernet().decrypt(encrypted_secret.encode("utf-8")).decode("utf-8")
        except InvalidToken as exc:
            raise ValueError("OTP secret could not be decrypted") from exc

    @staticmethod
    def _build_qr_data_url(otpauth_uri: str) -> str:
        image = qrcode.make(otpauth_uri)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        return f"data:image/png;base64,{encoded}"

    @staticmethod
    def _generate_backup_codes() -> list[str]:
        alphabet = string.ascii_uppercase + string.digits
        codes = []
        for _ in range(settings.OTP_BACKUP_CODE_COUNT):
            parts = ["".join(secrets.choice(alphabet) for _ in range(4)) for _ in range(3)]
            codes.append("-".join(parts))
        return codes

    @staticmethod
    def verify_otp_code(user: User, verification_code: str | None) -> bool:
        if not user.otp_enabled:
            return True
        if not verification_code or len(verification_code) != 6 or not verification_code.isdigit():
            return False
        secret = AccountService._decrypt_otp_secret(user.otp_secret)
        if not secret:
            return False
        return pyotp.TOTP(secret).verify(verification_code, valid_window=1)

    @staticmethod
    def _assert_otp_code(user: User, verification_code: str | None) -> None:
        if not AccountService.verify_otp_code(user, verification_code):
            raise ValueError("Invalid OTP code")

    @staticmethod
    async def set_trading_password(
        session: AsyncSession,
        user: User,
        *,
        password: str,
        current_password: str | None = None,
        otp_code: str | None = None,
    ) -> User:
        if len(password) != 4 or not password.isdigit():
            raise ValueError("Trading Password must be a 4-digit PIN")
        if user.trading_password_hash:
            if not current_password:
                raise ValueError("Current trading password is required")
            if len(current_password) != 4 or not current_password.isdigit():
                raise ValueError("Current trading password must be a 4-digit PIN")
            if not verify_password(current_password, user.trading_password_hash):
                raise ValueError("Current trading password is invalid")
        AccountService._assert_otp_code(user, otp_code)
        user.trading_password_hash = get_password_hash(password)
        user.has_set_trading_password = True
        user.is_trading_password_verified = True
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def set_referral_code(
        session: AsyncSession,
        user: User,
        *,
        referral_code: str,
    ) -> User:
        db_user = await UserService.ensure_referral_code(session, user)
        db_user = await UserService.apply_referrer(session, db_user, referral_code)
        db_user.updated_at = datetime.utcnow()
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return db_user

    @staticmethod
    async def verify_trading_password(user: User, password: str) -> bool:
        if len(password) != 4 or not password.isdigit():
            return False
        if not user.trading_password_hash:
            return False
        return verify_password(password, user.trading_password_hash)

    @staticmethod
    async def enable_otp(
        session: AsyncSession,
        user: User,
        *,
        verification_code: str,
    ) -> dict[str, str | bool]:
        if not user.otp_secret:
            raise ValueError("OTP setup is required before enabling OTP")
        secret = AccountService._decrypt_otp_secret(user.otp_secret)
        if not secret or not pyotp.TOTP(secret).verify(verification_code, valid_window=1):
            raise ValueError("Invalid OTP code")
        user.otp_enabled = True
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return {"enabled": True, "configured": True}

    @staticmethod
    async def start_otp_setup(
        session: AsyncSession,
        user: User,
        *,
        current_otp_code: str | None = None,
    ) -> dict[str, str | bool]:
        if user.otp_enabled:
            AccountService._assert_otp_code(user, current_otp_code)

        secret = pyotp.random_base32()
        label = user.email
        otpauth_uri = pyotp.TOTP(secret).provisioning_uri(
            name=label,
            issuer_name=settings.OTP_ISSUER_NAME,
        )
        user.otp_pending_secret = AccountService._encrypt_otp_secret(secret)
        user.otp_pending_created_at = datetime.utcnow()
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)

        return {
            "configured": bool(user.otp_secret),
            "enabled": bool(user.otp_enabled),
            "issuer": settings.OTP_ISSUER_NAME,
            "account": label,
            "secret": secret,
            "otpauth_uri": otpauth_uri,
            "qr_code_data_url": AccountService._build_qr_data_url(otpauth_uri),
        }

    @staticmethod
    async def verify_otp_setup(
        session: AsyncSession,
        user: User,
        *,
        verification_code: str,
    ) -> dict[str, str | bool | list[str]]:
        pending_secret = AccountService._decrypt_otp_secret(user.otp_pending_secret)
        if not pending_secret or not user.otp_pending_created_at:
            raise ValueError("OTP setup has not been started")
        if datetime.utcnow() - user.otp_pending_created_at > timedelta(minutes=settings.OTP_SETUP_EXPIRE_MINUTES):
            raise ValueError("OTP setup has expired. Please start setup again")
        if not pyotp.TOTP(pending_secret).verify(verification_code, valid_window=1):
            raise ValueError("Invalid OTP code")

        backup_codes = AccountService._generate_backup_codes()
        user.otp_secret = user.otp_pending_secret
        user.otp_pending_secret = None
        user.otp_pending_created_at = None
        user.otp_backup_codes_hash = json.dumps([get_password_hash(code) for code in backup_codes])
        user.otp_enabled = True
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)

        return {
            "enabled": True,
            "configured": True,
            "backup_codes": backup_codes,
        }

    @staticmethod
    async def disable_otp(
        session: AsyncSession,
        user: User,
        *,
        verification_code: str,
        password: str,
    ) -> User:
        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid login password")
        AccountService._assert_otp_code(user, verification_code)
        user.otp_enabled = False
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def clear_otp(session: AsyncSession, user: User) -> User:
        user.otp_enabled = False
        user.otp_secret = None
        user.otp_pending_secret = None
        user.otp_pending_created_at = None
        user.otp_backup_codes_hash = None
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
