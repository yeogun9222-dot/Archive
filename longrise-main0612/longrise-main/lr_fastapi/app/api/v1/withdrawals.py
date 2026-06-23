"""
Withdrawal API endpoints
"""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_admin, get_current_active_user
from app.core.database import get_session
from app.models.withdrawal import (
    Withdrawal,
    WithdrawalCreate,
    WithdrawalRead,
    WithdrawalUpdate,
    WithdrawalApproval,
    WithdrawalRejection,
    WithdrawalStatus,
    WithdrawalType
)
from app.models.admin import Admin
from app.models.user import User
from app.services.withdrawal_service import WithdrawalService

router = APIRouter()


@router.post("/", response_model=WithdrawalRead, status_code=status.HTTP_201_CREATED)
async def create_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_in: WithdrawalCreate,
    current_user: User = Depends(get_current_active_user),
    request: Request
) -> WithdrawalRead:
    """
    Create new withdrawal request (user endpoint)
    """
    try:
        # Get IP address and user agent from request
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

        withdrawal = await WithdrawalService.create_withdrawal(
            session=session,
            user_id=current_user.id,
            withdrawal_data=withdrawal_in,
            ip_address=ip_address,
            user_agent=user_agent
        )
        return WithdrawalRead.model_validate(withdrawal)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating withdrawal: {str(e)}"
        )


@router.get("/", response_model=List[WithdrawalRead])
async def get_withdrawals(
    *,
    session: AsyncSession = Depends(get_session),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    status: Optional[WithdrawalStatus] = Query(None, description="Filter by status"),
    user_id: Optional[UUID] = Query(None, description="Filter by user ID (admin only)"),
    asset: Optional[WithdrawalType] = Query(None, description="Filter by asset"),
    min_amount: Optional[Decimal] = Query(None, description="Minimum amount filter"),
    max_amount: Optional[Decimal] = Query(None, description="Maximum amount filter"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> List[WithdrawalRead]:
    """
    Get withdrawals (admin only)
    """
    try:
        withdrawals = await WithdrawalService.get_withdrawals(
            session=session,
            skip=skip,
            limit=limit,
            status=status,
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            asset=asset,
            min_amount=min_amount,
            max_amount=max_amount
        )
        return [WithdrawalRead.model_validate(w) for w in withdrawals]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching withdrawals: {str(e)}"
        )


@router.get("/my", response_model=List[WithdrawalRead])
async def get_my_withdrawals(
    *,
    session: AsyncSession = Depends(get_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[WithdrawalStatus] = Query(None),
    current_user: User = Depends(get_current_active_user)
) -> List[WithdrawalRead]:
    """
    Get current user's withdrawals
    """
    try:
        withdrawals = await WithdrawalService.get_withdrawals(
            session=session,
            skip=skip,
            limit=limit,
            status=status,
            user_id=current_user.id
        )
        return [WithdrawalRead.model_validate(w) for w in withdrawals]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching withdrawals: {str(e)}"
        )


@router.get("/pending", response_model=List[WithdrawalRead])
async def get_pending_withdrawals(
    *,
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=500),
    current_admin: Admin = Depends(get_current_active_admin)
) -> List[WithdrawalRead]:
    """
    Get pending withdrawals for admin review
    """
    try:
        withdrawals = await WithdrawalService.get_pending_withdrawals(
            session=session,
            limit=limit
        )
        return [WithdrawalRead.model_validate(w) for w in withdrawals]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending withdrawals: {str(e)}"
        )


@router.get("/{withdrawal_id}", response_model=WithdrawalRead)
async def get_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_id: str,
    current_admin: Admin = Depends(get_current_active_admin)
) -> WithdrawalRead:
    """
    Get a specific withdrawal by ID (admin only)
    """
    withdrawal = await WithdrawalService.get_withdrawal_by_id(session, withdrawal_id)
    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal not found"
        )

    return WithdrawalRead.model_validate(withdrawal)


@router.post("/{withdrawal_id}/approve", response_model=WithdrawalRead)
async def approve_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_id: str,
    approval_data: WithdrawalApproval,
    current_admin: Admin = Depends(get_current_active_admin)
) -> WithdrawalRead:
    """
    Approve a withdrawal request (admin only)
    """
    try:
        withdrawal = await WithdrawalService.approve_withdrawal(
            session=session,
            withdrawal_id=withdrawal_id,
            admin_id=current_admin.id,
            admin_notes=approval_data.admin_notes
        )

        if not withdrawal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Withdrawal not found"
            )

        return WithdrawalRead.model_validate(withdrawal)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving withdrawal: {str(e)}"
        )


@router.post("/{withdrawal_id}/reject", response_model=WithdrawalRead)
async def reject_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_id: str,
    rejection_data: WithdrawalRejection,
    current_admin: Admin = Depends(get_current_active_admin)
) -> WithdrawalRead:
    """
    Reject a withdrawal request (admin only)
    """
    try:
        withdrawal = await WithdrawalService.reject_withdrawal(
            session=session,
            withdrawal_id=withdrawal_id,
            admin_id=current_admin.id,
            rejection_reason=rejection_data.rejection_reason,
            admin_notes=rejection_data.admin_notes
        )

        if not withdrawal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Withdrawal not found"
            )

        return WithdrawalRead.model_validate(withdrawal)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rejecting withdrawal: {str(e)}"
        )


@router.post("/{withdrawal_id}/complete", response_model=WithdrawalRead)
async def complete_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_id: str,
    tx_hash: Optional[str] = Query(None, description="Internal settlement reference"),
    block_number: Optional[int] = Query(None, description="Optional settlement batch number"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> WithdrawalRead:
    """
    Mark withdrawal as internally settled (admin only)
    """
    try:
        withdrawal = await WithdrawalService.complete_withdrawal(
            session=session,
            withdrawal_id=withdrawal_id,
            tx_hash=tx_hash,
            block_number=block_number,
            admin_id=current_admin.id
        )

        if not withdrawal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Withdrawal not found"
            )

        return WithdrawalRead.model_validate(withdrawal)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing withdrawal: {str(e)}"
        )


@router.post("/{withdrawal_id}/cancel", response_model=WithdrawalRead)
async def cancel_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_id: str,
    reason: Optional[str] = Query(None, description="Cancellation reason"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> WithdrawalRead:
    """
    Cancel a withdrawal request (admin only)
    """
    try:
        withdrawal = await WithdrawalService.cancel_withdrawal(
            session=session,
            withdrawal_id=withdrawal_id,
            admin_id=current_admin.id,
            reason=reason
        )

        if not withdrawal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Withdrawal not found"
            )

        return WithdrawalRead.model_validate(withdrawal)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling withdrawal: {str(e)}"
        )


@router.post("/my/{withdrawal_id}/cancel", response_model=WithdrawalRead)
async def cancel_my_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_id: str,
    current_user: User = Depends(get_current_active_user)
) -> WithdrawalRead:
    """
    Cancel user's own withdrawal request
    """
    try:
        withdrawal = await WithdrawalService.cancel_withdrawal(
            session=session,
            withdrawal_id=withdrawal_id,
            user_id=current_user.id,
            reason="Cancelled by user"
        )

        if not withdrawal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Withdrawal not found"
            )

        return WithdrawalRead.model_validate(withdrawal)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling withdrawal: {str(e)}"
        )


@router.put("/{withdrawal_id}", response_model=WithdrawalRead)
async def update_withdrawal(
    *,
    session: AsyncSession = Depends(get_session),
    withdrawal_id: str,
    withdrawal_update: WithdrawalUpdate,
    current_admin: Admin = Depends(get_current_active_admin)
) -> WithdrawalRead:
    """
    Update withdrawal details (admin only)
    """
    withdrawal = await WithdrawalService.get_withdrawal_by_id(session, withdrawal_id)
    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal not found"
        )

    # Update fields
    update_data = withdrawal_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(withdrawal, field, value)

    withdrawal.updated_at = datetime.utcnow()

    session.add(withdrawal)
    await session.commit()
    await session.refresh(withdrawal)

    return WithdrawalRead.model_validate(withdrawal)


@router.get("/stats/summary")
async def get_withdrawal_statistics(
    *,
    session: AsyncSession = Depends(get_session),
    start_date: Optional[datetime] = Query(None, description="Start date for statistics"),
    end_date: Optional[datetime] = Query(None, description="End date for statistics"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> dict:
    """
    Get withdrawal statistics (admin only)
    """
    try:
        stats = await WithdrawalService.get_withdrawal_statistics(
            session=session,
            start_date=start_date,
            end_date=end_date
        )
        return stats

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching withdrawal statistics: {str(e)}"
        )
