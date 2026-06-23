"""
Signup verification business logic.
"""
import random
import re
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models.email_verification import EmailVerification
from app.models.user import User, UserCreate
from app.services.email_service import EmailService
from app.services.user_service import UserService


PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$")


class SignupService:
    """Coordinates email verification and public account creation."""

    @staticmethod
    def normalize_email(email: str) -> str:
        return email.strip().lower()

    @staticmethod
    def validate_password(password: str) -> None:
        if not PASSWORD_PATTERN.match(password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be 8+ characters and include uppercase, lowercase, number, and special character.",
            )

    @staticmethod
    async def ensure_email_available(session: AsyncSession, email: str) -> None:
        existing_user = await UserService.get_user_by_email(session, SignupService.normalize_email(email))
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists.",
            )

    @staticmethod
    async def send_verification(session: AsyncSession, email: str) -> tuple[int, int]:
        normalized_email = SignupService.normalize_email(email)
        await SignupService.ensure_email_available(session, normalized_email)
        if not EmailService.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="이메일 발송 설정이 완료되지 않아 인증번호를 보낼 수 없습니다.",
            )

        latest = await SignupService.get_latest_verification(session, normalized_email)
        now = datetime.utcnow()
        if latest:
            elapsed = (now - latest.created_at).total_seconds()
            if elapsed < settings.SIGNUP_VERIFICATION_RESEND_SECONDS:
                remaining = settings.SIGNUP_VERIFICATION_RESEND_SECONDS - int(elapsed)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Please wait {remaining} seconds before requesting another code.",
                )

        code = f"{random.SystemRandom().randint(0, 999999):06d}"
        verification = EmailVerification(
            email=normalized_email,
            purpose="signup",
            code_hash=get_password_hash(code),
            expires_at=now + timedelta(minutes=settings.SIGNUP_VERIFICATION_EXPIRE_MINUTES),
        )
        session.add(verification)
        await session.commit()

        try:
            await EmailService.send_signup_verification(normalized_email, code)
        except Exception as exc:
            verification.consumed = True
            verification.updated_at = datetime.utcnow()
            session.add(verification)
            await session.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="인증 이메일 발송에 실패했습니다. 잠시 후 다시 시도하세요.",
            ) from exc

        return (
            settings.SIGNUP_VERIFICATION_RESEND_SECONDS,
            settings.SIGNUP_VERIFICATION_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    async def get_latest_verification(session: AsyncSession, email: str) -> Optional[EmailVerification]:
        statement = (
            select(EmailVerification)
            .where(
                EmailVerification.email == SignupService.normalize_email(email),
                EmailVerification.purpose == "signup",
                EmailVerification.consumed.is_(False),
            )
            .order_by(EmailVerification.created_at.desc())
            .limit(1)
        )
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def verify_code(session: AsyncSession, email: str, code: str) -> None:
        verification = await SignupService.get_latest_verification(session, email)
        if not verification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification code not found.")
        if verification.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification code expired.")
        if verification.attempts >= settings.SIGNUP_VERIFICATION_MAX_ATTEMPTS:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many verification attempts.")

        verification.attempts += 1
        verification.updated_at = datetime.utcnow()
        if not verify_password(code, verification.code_hash):
            session.add(verification)
            await session.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code.")

        verification.verified_at = datetime.utcnow()
        session.add(verification)
        await session.commit()

    @staticmethod
    async def complete_signup(
        session: AsyncSession,
        email: str,
        password: str,
        referral_code: str,
    ) -> User:
        normalized_email = SignupService.normalize_email(email)
        SignupService.validate_password(password)
        await SignupService.ensure_email_available(session, normalized_email)

        normalized_referral_code = UserService.normalize_referral_code(referral_code)
        sponsor = None
        if not normalized_referral_code:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Referral code is required.")
        if len(normalized_referral_code) != 8:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Referral code must be 8 uppercase letters or numbers.")

        sponsor = await UserService.get_user_by_referral_code(session, normalized_referral_code)
        if not sponsor:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referral code not found.")

        verification = await SignupService.get_latest_verification(session, normalized_email)
        if not verification or not verification.verified_at:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email verification is required.")
        if verification.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification code expired.")

        nickname = await SignupService.generate_nickname(session, normalized_email)
        user = await UserService.create_user(
            session,
            UserCreate(
                email=normalized_email,
                nickname=nickname,
                password=password,
                sponsor_id=sponsor.id,
                referred_by_code=sponsor.referral_code,
            ),
        )
        sponsor.team_size = (sponsor.team_size or 0) + 1
        sponsor.referred_count = (sponsor.referred_count or 0) + 1
        session.add(sponsor)

        verification.consumed = True
        verification.updated_at = datetime.utcnow()
        session.add(verification)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def generate_nickname(session: AsyncSession, email: str) -> str:
        base = re.sub(r"[^A-Za-z0-9_]", "", email.split("@", 1)[0])[:30] or "longrise"
        candidate = base
        suffix = 1
        while await UserService.get_user_by_nickname(session, candidate):
            suffix += 1
            candidate = f"{base[:44]}{suffix}"
        return candidate
