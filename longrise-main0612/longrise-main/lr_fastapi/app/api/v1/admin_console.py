"""
Admin console endpoints for live dashboard and user management.
"""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_admin
from app.core.database import get_session
from app.models.admin import Admin
from app.models.user import User, UserRead
from app.services.account_service import AccountService
from app.services.admin_console_service import AdminConsoleService
from app.services.user_service import UserService

router = APIRouter()


class SettingUpdateRequest(BaseModel):
    setting_value: str = Field(min_length=1, max_length=2000)
    change_reason: str | None = Field(default=None, max_length=500)


class BalanceAdjustRequest(BaseModel):
    currency: str = Field(min_length=3, max_length=10)
    amount: Decimal


class RestrictionUpdateRequest(BaseModel):
    restriction_type: str = Field(min_length=2, max_length=30)
    enabled: bool


class BanUserRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=500)


@router.get("/settings/core")
async def get_core_settings(
    current_admin: Admin = Depends(get_current_active_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str | bool | float]:
    return await AdminConsoleService.get_core_settings(session, current_admin)


@router.put("/settings/{setting_key}")
async def update_core_setting(
    setting_key: str,
    payload: SettingUpdateRequest,
    current_admin: Admin = Depends(get_current_active_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    try:
        setting = await AdminConsoleService.update_core_setting(
            session,
            admin=current_admin,
            setting_key=setting_key,
            setting_value=payload.setting_value,
            change_reason=payload.change_reason,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {
        "settingKey": setting.setting_key,
        "settingValue": setting.setting_value,
    }


@router.put("/users/{user_id}/balance", response_model=UserRead)
async def adjust_user_balance(
    user_id: UUID,
    payload: BalanceAdjustRequest,
    current_admin: Admin = Depends(get_current_active_admin),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    user = await UserService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        updated = await AdminConsoleService.adjust_user_balance(
            session,
            admin=current_admin,
            user=user,
            currency=payload.currency,
            amount=payload.amount,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return UserRead.model_validate(updated)


@router.put("/users/{user_id}/restrictions", response_model=UserRead)
async def set_user_restriction(
    user_id: UUID,
    payload: RestrictionUpdateRequest,
    current_admin: Admin = Depends(get_current_active_admin),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    user = await UserService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        updated = await AdminConsoleService.set_user_restriction(
            session,
            user=user,
            restriction_type=payload.restriction_type,
            enabled=payload.enabled,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return UserRead.model_validate(updated)


@router.put("/users/{user_id}/ban", response_model=UserRead)
async def ban_user(
    user_id: UUID,
    payload: BanUserRequest,
    current_admin: Admin = Depends(get_current_active_admin),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    user = await UserService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated = await AdminConsoleService.ban_user(session, user=user, reason=payload.reason)
    return UserRead.model_validate(updated)


@router.post("/users/{user_id}/otp/reset", response_model=UserRead)
async def reset_user_otp(
    user_id: UUID,
    current_admin: Admin = Depends(get_current_active_admin),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    user = await UserService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated = await AccountService.clear_otp(session, user)
    return UserRead.model_validate(updated)
