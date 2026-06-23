"""
Profile and account security endpoints.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_session
from app.models.user import User, UserRead
from app.services.account_service import AccountService

router = APIRouter()


class TradingPasswordRequest(BaseModel):
    password: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")
    confirm_password: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")
    current_password: str | None = Field(default=None, min_length=4, max_length=4, pattern=r"^\d{4}$")
    otp_code: str | None = Field(default=None, min_length=6, max_length=6)


class TradingPasswordVerifyRequest(BaseModel):
    password: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")


class OTPEnableRequest(BaseModel):
    verification_code: str = Field(min_length=6, max_length=6)


class OTPSetupRequest(BaseModel):
    current_otp_code: str | None = Field(default=None, min_length=6, max_length=6)


class OTPDisableRequest(BaseModel):
    verification_code: str = Field(min_length=6, max_length=6)
    password: str = Field(min_length=1, max_length=128)


class ReferralCodeRequest(BaseModel):
    referral_code: str = Field(min_length=8, max_length=8, pattern=r"^[A-Za-z0-9]{8}$")


@router.post("/referral-code", response_model=UserRead)
async def set_referral_code(
    payload: ReferralCodeRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    try:
        user = await AccountService.set_referral_code(
            session,
            current_user,
            referral_code=payload.referral_code,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return UserRead.model_validate(user)


@router.post("/trading-password", response_model=UserRead)
async def set_trading_password(
    payload: TradingPasswordRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    try:
        user = await AccountService.set_trading_password(
            session,
            current_user,
            password=payload.password,
            current_password=payload.current_password,
            otp_code=payload.otp_code,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return UserRead.model_validate(user)


@router.post("/trading-password/verify")
async def verify_trading_password(
    payload: TradingPasswordVerifyRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict[str, bool]:
    return {"verified": await AccountService.verify_trading_password(current_user, payload.password)}


@router.post("/otp/enable")
async def enable_otp(
    payload: OTPEnableRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str | bool]:
    try:
        return await AccountService.enable_otp(session, current_user, verification_code=payload.verification_code)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/otp/setup")
async def setup_otp(
    payload: OTPSetupRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str | bool]:
    try:
        return await AccountService.start_otp_setup(
            session,
            current_user,
            current_otp_code=payload.current_otp_code,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/otp/verify")
async def verify_otp_setup(
    payload: OTPEnableRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str | bool | list[str]]:
    try:
        return await AccountService.verify_otp_setup(
            session,
            current_user,
            verification_code=payload.verification_code,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/otp/disable", response_model=UserRead)
async def disable_otp(
    payload: OTPDisableRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    try:
        user = await AccountService.disable_otp(
            session,
            current_user,
            verification_code=payload.verification_code,
            password=payload.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return UserRead.model_validate(user)
