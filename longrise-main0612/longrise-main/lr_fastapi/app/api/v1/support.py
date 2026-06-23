"""
Support and fraud-report endpoints.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user, get_current_user
from app.core.database import get_session
from app.models.user import User
from app.services.wallet_service import WalletService

router = APIRouter()


class SupportTicketRequest(BaseModel):
    title: str = Field(min_length=4, max_length=500)
    description: str = Field(min_length=4, max_length=3000)
    category: str = Field(min_length=2, max_length=100)
    priority: str = Field(default="medium", max_length=20)


class FraudReportRequest(BaseModel):
    fraudster_uid: str = Field(min_length=2, max_length=255)
    fraud_reason: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10, max_length=3000)
    evidence: list[str] = Field(min_length=1, max_length=5)


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    payload: SupportTicketRequest,
    current_user: User | None = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    try:
        ticket = await WalletService.create_support_ticket(
            session,
            user=current_user,
            title=payload.title,
            description=payload.description,
            category=payload.category,
            priority=payload.priority,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {
        "ticketId": ticket.ticket_id,
        "status": ticket.status,
    }


@router.get("/tickets/my")
async def get_my_support_tickets(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, str | None]]:
    tickets = await WalletService.list_my_tickets(session, user_id=current_user.id)
    return [
        {
            "ticketId": item.ticket_id,
            "title": item.title,
            "category": item.category,
            "status": item.status,
            "priority": item.priority,
            "createdAt": item.created_at.isoformat() if item.created_at else None,
        }
        for item in tickets
    ]


@router.post("/fraud-reports", status_code=status.HTTP_201_CREATED)
async def create_fraud_report(
    payload: FraudReportRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    try:
        ticket = await WalletService.create_support_ticket(
            session,
            user=current_user,
            title=f"Fraud report against {payload.fraudster_uid}",
            description=payload.description,
            category="FRAUD_REPORT",
            priority="high",
            tags=[payload.fraud_reason, payload.fraudster_uid],
            attachments=payload.evidence,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {
        "reportId": ticket.ticket_id,
        "status": ticket.status,
    }
