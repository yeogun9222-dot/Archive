"""
Email verification models for public signup.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from pydantic import EmailStr
from sqlalchemy import Boolean, Column, DateTime, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlmodel import Field, SQLModel


class EmailVerification(SQLModel, table=True):
    """Stores hashed one-time signup email verification codes."""

    __tablename__ = "email_verifications"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()"),
        ),
    )
    email: EmailStr = Field(sa_column=Column(String(255), nullable=False, index=True))
    purpose: str = Field(default="signup", max_length=30, index=True)
    code_hash: str = Field(sa_column=Column(String(255), nullable=False))
    expires_at: datetime = Field(sa_column=Column(DateTime, nullable=False))
    verified_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime))
    attempts: int = Field(default=0, sa_column=Column(Integer, nullable=False, server_default="0"))
    consumed: bool = Field(default=False, sa_column=Column(Boolean, nullable=False, server_default="false"))
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP")),
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP")),
    )


class EmailAvailabilityRequest(SQLModel):
    email: EmailStr


class EmailAvailabilityResponse(SQLModel):
    available: bool
    message: str


class SendSignupVerificationRequest(SQLModel):
    email: EmailStr


class SendSignupVerificationResponse(SQLModel):
    sent: bool
    cooldown_seconds: int
    expires_in_seconds: int
    message: str


class VerifySignupCodeRequest(SQLModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, regex=r"^\d{6}$")


class VerifySignupCodeResponse(SQLModel):
    verified: bool
    message: str


class SignupCompleteRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    referral_code: str = Field(min_length=8, max_length=8, regex=r"^[A-Za-z0-9]{8}$")
