"""
Dashboard API endpoints.
"""
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_admin, get_current_active_user
from app.core.database import get_session
from app.models.admin import Admin
from app.models.user import User
from app.services.operations_service import OperationsService

router = APIRouter()


@router.get("/me")
async def get_user_dashboard(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    return await OperationsService.get_user_dashboard(session, current_user)


@router.get("/admin")
async def get_admin_dashboard(
    current_admin: Admin = Depends(get_current_active_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    return await OperationsService.get_admin_dashboard(session)
