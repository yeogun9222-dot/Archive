"""
Transaction API endpoints.
"""
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_session
from app.models.user import User
from app.services.operations_service import OperationsService

router = APIRouter()


@router.get("/me")
async def get_my_transactions(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, Any]]:
    return await OperationsService.get_user_transactions(session, current_user.id, limit=limit)
