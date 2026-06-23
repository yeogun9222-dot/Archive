"""
Market API endpoints.
"""
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_session
from app.models.user import User
from app.services.operations_service import OperationsService

router = APIRouter()


class P2POrderRequest(BaseModel):
    asset: str = Field(default="CNYT", min_length=3, max_length=10)
    trade_type: str = Field(default="buy")
    amount: Decimal = Field(gt=0)
    price_per_unit: Decimal = Field(gt=0)
    currency: str = Field(default="USDT", min_length=3, max_length=10)
    payment_method: str | None = Field(default="BANK_TRANSFER")


class FillOrderRequest(BaseModel):
    amount: Decimal = Field(gt=0)


@router.get("/p2p")
async def get_market_snapshot(
    asset: str = Query("CNYT"),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    return await OperationsService.get_market_snapshot(session, asset=asset, user_id=current_user.id)


@router.post("/p2p/orders", status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: P2POrderRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    try:
        return await OperationsService.create_p2p_order(
            session,
            current_user,
            asset=payload.asset,
            trade_type=payload.trade_type,
            amount=payload.amount,
            price_per_unit=payload.price_per_unit,
            currency=payload.currency,
            payment_method=payload.payment_method,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/p2p/orders/me")
async def get_my_orders(
    asset: str = Query("CNYT"),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    snapshot = await OperationsService.get_market_snapshot(session, asset=asset, user_id=current_user.id)
    return {
        "asset": snapshot["asset"],
        "myOrders": snapshot["myOrders"],
    }


@router.post("/p2p/orders/{trade_id}/cancel")
async def cancel_order(
    trade_id: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    try:
        return await OperationsService.cancel_p2p_order(session, current_user, trade_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/p2p/orders/{trade_id}/complete")
async def complete_order(
    trade_id: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    try:
        return await OperationsService.complete_p2p_order(session, current_user, trade_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/p2p/orders/{trade_id}/fill")
async def fill_order(
    trade_id: str,
    payload: FillOrderRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    try:
        return await OperationsService.fill_p2p_order(
            session,
            current_user,
            trade_id=trade_id,
            amount=payload.amount,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
