"""
Withdrawal service for handling withdrawal operations
"""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.core.security import verify_password
from app.models.withdrawal import (
    Withdrawal,
    WithdrawalCreate,
    WithdrawalUpdate,
    WithdrawalStatus,
    WithdrawalType,
    Network
)
from app.models.user import User
from app.models.admin import Admin
from app.services.audit_service import AuditService
from app.services.managed_asset_service import ManagedAssetService
from app.services.account_service import AccountService
from app.core.config import settings
import secrets


class WithdrawalService:
    """Service for withdrawal operations"""

    @staticmethod
    async def _safe_audit_log(**kwargs) -> None:
        return

    @staticmethod
    async def create_withdrawal(
        session: AsyncSession,
        user_id: UUID,
        withdrawal_data: WithdrawalCreate,
        ip_address: str = None,
        user_agent: str = None
    ) -> Withdrawal:
        """Create a new withdrawal request"""
        user_result = await session.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")
        if user.is_withdrawal_blocked:
            raise ValueError("Withdrawals are blocked for this account")
        if not user.trading_password_hash or not verify_password(
            withdrawal_data.trading_password,
            user.trading_password_hash,
        ):
            raise ValueError("Trading password verification failed")
        if not AccountService.verify_otp_code(user, withdrawal_data.otp_code):
            raise ValueError("Invalid OTP code")

        asset_code = withdrawal_data.asset.value
        if ManagedAssetService.get_balance(user, asset_code) < withdrawal_data.amount:
            raise ValueError(f"Insufficient {asset_code} balance")

        # Generate unique withdrawal ID
        withdrawal_id = f"WD{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(4).upper()}"

        # Calculate fees
        fee_rate = Decimal(str(settings.WITHDRAWAL_FEE_RATE if hasattr(settings, 'WITHDRAWAL_FEE_RATE') else "0.005"))
        fee_amount = withdrawal_data.amount * fee_rate
        final_amount = withdrawal_data.amount - fee_amount

        # Auto-approval for small amounts
        auto_approval_limit = Decimal(str(settings.AUTO_APPROVAL_LIMIT if hasattr(settings, 'AUTO_APPROVAL_LIMIT') else "5000"))
        auto_approved = withdrawal_data.amount <= auto_approval_limit
        initial_status = WithdrawalStatus.APPROVED if auto_approved else WithdrawalStatus.PENDING

        # Risk assessment (basic implementation)
        risk_score = await WithdrawalService._calculate_risk_score(session, user_id, withdrawal_data.amount)
        stored_network = withdrawal_data.network
        if stored_network == Network.INTERNAL:
            stored_network = Network.TRC20

        withdrawal = Withdrawal(
            user_id=user_id,
            withdrawal_id=withdrawal_id,
            amount=withdrawal_data.amount,
            asset=withdrawal_data.asset,
            network=stored_network,
            wallet_address=withdrawal_data.wallet_address,
            fee_amount=fee_amount,
            final_amount=final_amount,
            status=initial_status,
            auto_approved=auto_approved,
            ip_address=ip_address,
            user_agent=user_agent,
            risk_score=risk_score,
            admin_notes="Managed ledger settlement request",
        )

        ManagedAssetService.adjust_balance(user, asset_code, -withdrawal_data.amount)

        session.add(withdrawal)
        session.add(user)
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=user.id,
            asset=asset_code,
            tx_type="withdrawal",
            amount=withdrawal_data.amount,
            status="pending" if initial_status == WithdrawalStatus.PENDING else "completed",
            description=f"Managed ledger settlement request created ({withdrawal_id})",
            reference_id=withdrawal_id,
            fee=fee_amount,
        )
        await session.commit()
        await session.refresh(withdrawal)

        # Log the creation
        await WithdrawalService._safe_audit_log(
            session=session,
            action="create",
            resource="withdrawal",
            resource_id=withdrawal.withdrawal_id,
            new_values={"amount": float(withdrawal_data.amount), "status": initial_status.value},
            description=f"Managed ledger settlement request created for {withdrawal_data.amount} {withdrawal_data.asset.value}"
        )

        refreshed = await WithdrawalService.get_withdrawal_by_id(session, withdrawal.withdrawal_id)
        return refreshed or withdrawal

    @staticmethod
    async def get_withdrawal_by_id(session: AsyncSession, withdrawal_id: str) -> Optional[Withdrawal]:
        """Get withdrawal by ID"""
        result = await session.execute(
            select(Withdrawal).where(Withdrawal.withdrawal_id == withdrawal_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_withdrawals(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: Optional[WithdrawalStatus] = None,
        user_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        asset: Optional[WithdrawalType] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None
    ) -> List[Withdrawal]:
        """Get withdrawals with filters"""
        query = select(Withdrawal)

        # Apply filters
        conditions = []
        if status:
            conditions.append(Withdrawal.status == status)
        if user_id:
            conditions.append(Withdrawal.user_id == user_id)
        if start_date:
            conditions.append(Withdrawal.created_at >= start_date)
        if end_date:
            conditions.append(Withdrawal.created_at <= end_date)
        if asset:
            conditions.append(Withdrawal.asset == asset)
        if min_amount:
            conditions.append(Withdrawal.amount >= min_amount)
        if max_amount:
            conditions.append(Withdrawal.amount <= max_amount)

        if conditions:
            query = query.where(and_(*conditions))

        query = query.order_by(Withdrawal.created_at.desc()).offset(skip).limit(limit)
        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_pending_withdrawals(
        session: AsyncSession,
        limit: int = 50
    ) -> List[Withdrawal]:
        """Get pending withdrawals for admin review"""
        query = select(Withdrawal).where(
            Withdrawal.status == WithdrawalStatus.PENDING
        ).order_by(Withdrawal.created_at.asc()).limit(limit)

        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    async def approve_withdrawal(
        session: AsyncSession,
        withdrawal_id: str,
        admin_id: UUID,
        admin_notes: str = None
    ) -> Optional[Withdrawal]:
        """Approve a withdrawal request"""
        withdrawal = await WithdrawalService.get_withdrawal_by_id(session, withdrawal_id)
        if not withdrawal:
            return None

        if withdrawal.status != WithdrawalStatus.PENDING:
            raise ValueError(f"Cannot approve withdrawal with status: {withdrawal.status}")

        old_status = withdrawal.status
        withdrawal.status = WithdrawalStatus.APPROVED
        withdrawal.processed_by = admin_id
        withdrawal.processed_at = datetime.utcnow()
        if admin_notes:
            withdrawal.admin_notes = admin_notes
        withdrawal.updated_at = datetime.utcnow()

        session.add(withdrawal)
        await session.commit()
        await session.refresh(withdrawal)

        # Log the approval
        await WithdrawalService._safe_audit_log(
            session=session,
            admin_id=admin_id,
            action="approve",
            resource="withdrawal",
            resource_id=withdrawal.withdrawal_id,
            old_values={"status": old_status.value},
            new_values={"status": withdrawal.status.value},
            description=f"Withdrawal approved: {withdrawal.amount} {withdrawal.asset.value}",
        )

        refreshed = await WithdrawalService.get_withdrawal_by_id(session, withdrawal.withdrawal_id)
        return refreshed or withdrawal

    @staticmethod
    async def reject_withdrawal(
        session: AsyncSession,
        withdrawal_id: str,
        admin_id: UUID,
        rejection_reason: str,
        admin_notes: str = None
    ) -> Optional[Withdrawal]:
        """Reject a withdrawal request"""
        withdrawal = await WithdrawalService.get_withdrawal_by_id(session, withdrawal_id)
        if not withdrawal:
            return None

        if withdrawal.status not in [WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED]:
            raise ValueError(f"Cannot reject withdrawal with status: {withdrawal.status}")

        old_status = withdrawal.status
        withdrawal.status = WithdrawalStatus.REJECTED
        withdrawal.processed_by = admin_id
        withdrawal.processed_at = datetime.utcnow()
        withdrawal.rejection_reason = rejection_reason
        if admin_notes:
            withdrawal.admin_notes = admin_notes
        withdrawal.updated_at = datetime.utcnow()

        user_result = await session.execute(select(User).where(User.id == withdrawal.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            ManagedAssetService.adjust_balance(user, withdrawal.asset.value, withdrawal.amount)
            session.add(user)
            await ManagedAssetService.record_ledger_entry(
                session,
                user_id=user.id,
                asset=withdrawal.asset.value,
                tx_type="adjustment",
                amount=withdrawal.amount,
                status="completed",
                description=f"Managed ledger refund after withdrawal rejection ({withdrawal.withdrawal_id})",
                reference_id=f"{withdrawal.withdrawal_id}-REJECT",
            )

        session.add(withdrawal)
        await session.commit()
        await session.refresh(withdrawal)

        # Log the rejection
        await WithdrawalService._safe_audit_log(
            session=session,
            admin_id=admin_id,
            action="reject",
            resource="withdrawal",
            resource_id=withdrawal.withdrawal_id,
            old_values={"status": old_status.value},
            new_values={"status": withdrawal.status.value, "rejection_reason": rejection_reason},
            description=f"Managed ledger withdrawal rejected: {withdrawal.amount} {withdrawal.asset.value}",
        )

        refreshed = await WithdrawalService.get_withdrawal_by_id(session, withdrawal.withdrawal_id)
        return refreshed or withdrawal

    @staticmethod
    async def complete_withdrawal(
        session: AsyncSession,
        withdrawal_id: str,
        tx_hash: str | None,
        block_number: int = None,
        admin_id: UUID = None
    ) -> Optional[Withdrawal]:
        """Mark withdrawal as completed with internal settlement reference"""
        withdrawal = await WithdrawalService.get_withdrawal_by_id(session, withdrawal_id)
        if not withdrawal:
            return None

        if withdrawal.status != WithdrawalStatus.APPROVED:
            raise ValueError(f"Cannot complete withdrawal with status: {withdrawal.status}")

        old_status = withdrawal.status
        withdrawal.status = WithdrawalStatus.COMPLETED
        withdrawal.tx_hash = tx_hash or f"MANUAL-SETTLEMENT-{withdrawal.withdrawal_id}"
        withdrawal.block_number = block_number
        withdrawal.confirmations = 1
        withdrawal.updated_at = datetime.utcnow()

        session.add(withdrawal)
        await session.commit()
        await session.refresh(withdrawal)

        # Log the completion
        await WithdrawalService._safe_audit_log(
            session=session,
            admin_id=admin_id,
            action="complete",
            resource="withdrawal",
            resource_id=withdrawal.withdrawal_id,
            old_values={"status": old_status.value},
            new_values={"status": withdrawal.status.value, "tx_hash": withdrawal.tx_hash},
            description=f"Managed ledger withdrawal settled: {withdrawal.amount} {withdrawal.asset.value}",
        )

        refreshed = await WithdrawalService.get_withdrawal_by_id(session, withdrawal.withdrawal_id)
        return refreshed or withdrawal

    @staticmethod
    async def cancel_withdrawal(
        session: AsyncSession,
        withdrawal_id: str,
        user_id: UUID = None,
        admin_id: UUID = None,
        reason: str = None
    ) -> Optional[Withdrawal]:
        """Cancel a withdrawal request"""
        withdrawal = await WithdrawalService.get_withdrawal_by_id(session, withdrawal_id)
        if not withdrawal:
            return None

        # Users can only cancel their own pending withdrawals
        if user_id and withdrawal.user_id != user_id:
            raise ValueError("Users can only cancel their own withdrawals")

        if withdrawal.status not in [WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED]:
            raise ValueError(f"Cannot cancel withdrawal with status: {withdrawal.status}")

        old_status = withdrawal.status
        withdrawal.status = WithdrawalStatus.CANCELLED
        if reason:
            withdrawal.admin_notes = f"Cancelled: {reason}"
        withdrawal.updated_at = datetime.utcnow()

        user_result = await session.execute(select(User).where(User.id == withdrawal.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            ManagedAssetService.adjust_balance(user, withdrawal.asset.value, withdrawal.amount)
            session.add(user)
            await ManagedAssetService.record_ledger_entry(
                session,
                user_id=user.id,
                asset=withdrawal.asset.value,
                tx_type="adjustment",
                amount=withdrawal.amount,
                status="completed",
                description=f"Managed ledger refund after withdrawal cancellation ({withdrawal.withdrawal_id})",
                reference_id=f"{withdrawal.withdrawal_id}-CANCEL",
            )

        session.add(withdrawal)
        await session.commit()
        await session.refresh(withdrawal)

        # Log the cancellation
        await WithdrawalService._safe_audit_log(
            session=session,
            admin_id=admin_id,
            action="cancel",
            resource="withdrawal",
            resource_id=withdrawal.withdrawal_id,
            old_values={"status": old_status.value},
            new_values={"status": withdrawal.status.value},
            description=f"Managed ledger withdrawal cancelled: {withdrawal.amount} {withdrawal.asset.value}",
        )

        refreshed = await WithdrawalService.get_withdrawal_by_id(session, withdrawal.withdrawal_id)
        return refreshed or withdrawal

    @staticmethod
    async def get_withdrawal_statistics(
        session: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """Get withdrawal statistics"""
        query = select(Withdrawal)

        if start_date:
            query = query.where(Withdrawal.created_at >= start_date)
        if end_date:
            query = query.where(Withdrawal.created_at <= end_date)

        result = await session.execute(query)
        withdrawals = result.scalars().all()

        stats = {
            "total_count": len(withdrawals),
            "total_amount": sum(w.amount for w in withdrawals),
            "total_fee_collected": sum(w.fee_amount for w in withdrawals),
            "by_status": {},
            "by_asset": {},
            "by_network": {},
            "average_amount": Decimal("0"),
            "pending_count": 0,
            "auto_approved_count": sum(1 for w in withdrawals if w.auto_approved),
            "high_risk_count": sum(1 for w in withdrawals if w.risk_score >= 70),
        }

        # Calculate by status
        for status in WithdrawalStatus:
            status_withdrawals = [w for w in withdrawals if w.status == status]
            stats["by_status"][status.value] = {
                "count": len(status_withdrawals),
                "amount": sum(w.amount for w in status_withdrawals)
            }
            if status == WithdrawalStatus.PENDING:
                stats["pending_count"] = len(status_withdrawals)

        # Calculate by asset
        for asset in WithdrawalType:
            asset_withdrawals = [w for w in withdrawals if w.asset == asset]
            stats["by_asset"][asset.value] = {
                "count": len(asset_withdrawals),
                "amount": sum(w.amount for w in asset_withdrawals)
            }

        # Calculate by network
        for network in Network:
            network_withdrawals = [w for w in withdrawals if w.network == network]
            stats["by_network"][network.value] = {
                "count": len(network_withdrawals),
                "amount": sum(w.amount for w in network_withdrawals)
            }

        # Calculate average
        if withdrawals:
            stats["average_amount"] = stats["total_amount"] / len(withdrawals)

        return stats

    @staticmethod
    async def _calculate_risk_score(
        session: AsyncSession,
        user_id: UUID,
        amount: Decimal
    ) -> int:
        """Calculate risk score for withdrawal (basic implementation)"""
        risk_score = 0

        # Check recent withdrawal frequency
        recent_withdrawals = await session.execute(
            select(Withdrawal).where(
                and_(
                    Withdrawal.user_id == user_id,
                    Withdrawal.created_at >= datetime.now().replace(hour=0, minute=0, second=0)
                )
            )
        )
        recent_count = len(recent_withdrawals.scalars().all())

        # Risk factors
        if recent_count > 3:
            risk_score += 30
        elif recent_count > 1:
            risk_score += 15

        if amount > Decimal("10000"):
            risk_score += 25
        elif amount > Decimal("5000"):
            risk_score += 15
        elif amount > Decimal("1000"):
            risk_score += 5

        # Additional risk factors can be added here
        # - User verification level
        # - Account age
        # - Previous suspicious activity
        # - Unusual patterns

        return min(risk_score, 100)  # Cap at 100
