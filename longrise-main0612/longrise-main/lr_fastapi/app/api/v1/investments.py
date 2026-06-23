"""
Investment and package API endpoints.
"""
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_session
from app.models.user import User
from app.services.operations_service import OperationsService

router = APIRouter()


class InvestmentPurchaseRequest(BaseModel):
    package_id: str = Field(min_length=2)
    amount: Decimal | None = Field(default=None, gt=0)


@router.get("/packages")
async def list_packages(session: AsyncSession = Depends(get_session)) -> list[dict[str, Any]]:
    return await OperationsService.get_public_packages(session)


@router.get("/me")
async def get_my_investments(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, Any]]:
    return await OperationsService.get_user_investments(session, current_user.id)


@router.post("/purchase", status_code=status.HTTP_201_CREATED)
async def purchase_investment(
    payload: InvestmentPurchaseRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    try:
        return await OperationsService.create_investment(
            session,
            current_user,
            payload.package_id,
            payload.amount,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/{investment_id}/terminate")
async def terminate_investment(
    investment_id: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    try:
        return await OperationsService.terminate_investment(session, current_user, investment_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
