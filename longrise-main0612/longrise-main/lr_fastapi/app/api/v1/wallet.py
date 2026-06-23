"""
Wallet operation endpoints.
"""
from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_session
from app.models.user import User
from app.services.wallet_service import WalletService

router = APIRouter()


class TransferRequest(BaseModel):
    recipient: str = Field(min_length=2, max_length=255)
    amount: Decimal = Field(gt=0)
    asset: str = Field(default="USDT", min_length=3, max_length=10)
    trading_password: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")


class DepositRequest(BaseModel):
    leader_id: str = Field(min_length=2, max_length=100)
    leader_name: str = Field(min_length=2, max_length=100)
    bank_account: str | None = Field(default=None, max_length=255)
    deposit_amount: Decimal | None = Field(default=None, gt=0)
    notes: str | None = Field(default=None, max_length=1000)


class ConversionRequest(BaseModel):
    amount: Decimal = Field(gt=0)


@router.post("/transfers", status_code=status.HTTP_201_CREATED)
async def create_transfer(
    payload: TransferRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str | float]:
    try:
        return await WalletService.create_internal_transfer(
            session,
            sender=current_user,
            recipient_identifier=payload.recipient,
            amount=payload.amount,
            asset=payload.asset,
            trading_password=payload.trading_password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/deposit-requests", status_code=status.HTTP_201_CREATED)
async def create_deposit_request(
    payload: DepositRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str | float | None]:
    return await WalletService.create_deposit_request(
        session,
        user=current_user,
        leader_id=payload.leader_id,
        leader_name=payload.leader_name,
        bank_account=payload.bank_account,
        deposit_amount=payload.deposit_amount,
        notes=payload.notes,
    )


@router.get("/deposit-requests/me")
async def get_my_deposit_requests(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, str | None]]:
    tickets = await WalletService.list_deposit_requests(session, user_id=current_user.id)
    return [
        {
            "ticketId": item.ticket_id,
            "title": item.title,
            "status": item.status,
            "priority": item.priority,
            "createdAt": item.created_at.isoformat() if item.created_at else None,
        }
        for item in tickets
    ]


@router.post("/conversions")
async def convert_rewards(
    payload: ConversionRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, float | str]:
    try:
        return await WalletService.convert_usdt_to_cnyt(session, user=current_user, amount=payload.amount)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
