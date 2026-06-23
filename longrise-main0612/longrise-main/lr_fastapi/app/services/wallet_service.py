"""
Wallet, transfer, and ticket-backed onboarding/reporting services.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.models.user import User
from app.services.managed_asset_service import ManagedAssetService


@dataclass(frozen=True)
class OperationalTicket:
    ticket_id: str
    user_id: object
    title: str
    category: str
    status: str
    priority: str
    created_at: datetime | None


class WalletService:
    """Operational wallet flows."""

    @staticmethod
    async def _insert_legacy_transaction(
        session: AsyncSession,
        *,
        user_id,
        tx_type: str,
        amount: Decimal,
        currency: str,
        status: str,
        description: str,
        tx_hash: str,
        fee: Decimal = Decimal("0"),
    ) -> None:
        now = datetime.utcnow()
        await session.execute(
            text(
                """
                INSERT INTO transactions (
                    id, user_id, type, amount, currency, status, description, hash, fee, created_at, completed_at
                ) VALUES (
                    :id, :user_id, CAST(:type AS transaction_type), :amount,
                    CAST(:currency AS currency_type), CAST(:status AS transaction_status),
                    :description, :hash, :fee, :created_at, :completed_at
                )
                """
            ),
            {
                "id": uuid4(),
                "user_id": user_id,
                "type": tx_type,
                "amount": amount,
                "currency": currency.upper(),
                "status": status,
                "description": description,
                "hash": tx_hash,
                "fee": fee,
                "created_at": now,
                "completed_at": now if status == "completed" else None,
            },
        )

    @staticmethod
    async def create_internal_transfer(
        session: AsyncSession,
        *,
        sender: User,
        recipient_identifier: str,
        amount: Decimal,
        asset: str,
        trading_password: str,
    ) -> dict[str, str | float]:
        if not sender.trading_password_hash or not verify_password(trading_password, sender.trading_password_hash):
            raise ValueError("Trading password verification failed")

        recipient_result = await session.execute(
            select(User).where(
                or_(
                    User.email == recipient_identifier,
                    User.nickname == recipient_identifier,
                )
            )
        )
        recipient = recipient_result.scalar_one_or_none()
        if not recipient:
            raise ValueError("Recipient not found")
        if recipient.id == sender.id:
            raise ValueError("You cannot transfer to your own account")

        asset_code = asset.upper()
        ManagedAssetService.adjust_balance(sender, asset_code, -amount)
        ManagedAssetService.adjust_balance(recipient, asset_code, amount)

        transfer_id = f"TRF-{uuid4().hex[:12].upper()}"
        session.add(sender)
        session.add(recipient)

        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=sender.id,
            asset=asset_code,
            tx_type="swap",
            amount=amount,
            status="completed",
            description=f"Internal ledger transfer to {recipient.nickname}",
            reference_id=f"{transfer_id}-OUT",
        )
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=recipient.id,
            asset=asset_code,
            tx_type="swap",
            amount=amount,
            status="completed",
            description=f"Internal ledger transfer from {sender.nickname}",
            reference_id=f"{transfer_id}-IN",
        )
        await session.commit()
        return {
            "transferId": transfer_id,
            "asset": asset_code,
            "amount": float(amount),
            "recipient": recipient.nickname,
        }

    @staticmethod
    async def convert_usdt_to_cnyt(
        session: AsyncSession,
        *,
        user: User,
        amount: Decimal,
    ) -> dict[str, float | str]:
        if amount <= 0:
            raise ValueError("Conversion amount must be greater than zero")
        ManagedAssetService.adjust_balance(user, "USDT", -amount)
        ManagedAssetService.adjust_balance(user, "CNYT", amount)
        session.add(user)

        conversion_id = f"CNV-{uuid4().hex[:12].upper()}"
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=user.id,
            asset="USDT",
            tx_type="adjustment",
            amount=amount,
            status="completed",
            description="USDT debited for internal CNYT conversion",
            reference_id=f"{conversion_id}-USDT",
        )
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=user.id,
            asset="CNYT",
            tx_type="adjustment",
            amount=amount,
            status="completed",
            description="CNYT credited from internal USDT conversion",
            reference_id=f"{conversion_id}-CNYT",
        )
        await session.commit()
        return {
            "conversionId": conversion_id,
            "amount": float(amount),
            "rate": "1:1",
        }

    @staticmethod
    async def _create_ticket_raw(
        session: AsyncSession,
        *,
        user: User | None,
        external_id: str,
        title: str,
        content: str,
        category: str,
        priority: str,
        metadata: dict,
    ) -> OperationalTicket:
        if not user:
            raise ValueError("Authenticated user is required")

        now = datetime.utcnow()
        category_code = category.upper()
        if category_code not in {"FINANCE", "TECHNICAL", "GENERAL"}:
            category_code = "GENERAL"
        priority_code = priority.lower()
        if priority_code not in {"low", "medium", "high"}:
            priority_code = "medium"

        responses = {
            "externalId": external_id,
            "metadata": metadata,
            "events": [{"by": "user", "at": now.isoformat(), "content": content}],
        }
        await session.execute(
            text(
                """
                INSERT INTO support_tickets (
                    id, category, title, author_id, author_name, status, priority,
                    content, responses, created_at, updated_at
                ) VALUES (
                    :id, CAST(:category AS ticket_category), :title, :author_id, :author_name,
                    CAST(:status AS ticket_status), CAST(:priority AS ticket_priority),
                    :content, CAST(:responses AS jsonb), :created_at, :updated_at
                )
                """
            ),
            {
                "id": uuid4(),
                "category": category_code,
                "title": title,
                "author_id": user.id,
                "author_name": user.nickname or user.email,
                "status": "PENDING",
                "priority": priority_code,
                "content": content,
                "responses": json.dumps(responses),
                "created_at": now,
                "updated_at": now,
            },
        )
        return OperationalTicket(
            ticket_id=external_id,
            user_id=user.id,
            title=title,
            category=category_code,
            status="PENDING",
            priority=priority_code,
            created_at=now,
        )

    @staticmethod
    async def create_deposit_request(
        session: AsyncSession,
        *,
        user: User,
        leader_id: str,
        leader_name: str,
        bank_account: str | None,
        deposit_amount: Decimal | None,
        notes: str | None,
    ) -> dict[str, str | float | None]:
        external_id = f"DEP-{uuid4().hex[:10].upper()}"
        ticket = await WalletService._create_ticket_raw(
            session,
            user=user,
            external_id=external_id,
            title=f"USDT Onboarding Deposit Request - {leader_name}",
            content=notes or "User completed fiat deposit onboarding flow.",
            category="FINANCE",
            priority="high",
            metadata={
                "flowType": "USDT_ONBOARDING",
                "leaderId": leader_id,
                "leaderName": leader_name,
                "bankAccount": bank_account,
                "depositAmount": float(deposit_amount or 0),
            },
        )

        if deposit_amount and deposit_amount > 0:
            await WalletService._insert_legacy_transaction(
                session,
                user_id=user.id,
                tx_type="deposit",
                amount=deposit_amount,
                currency="USDT",
                status="pending",
                description=f"USDT onboarding deposit request via {leader_name}",
                tx_hash=ticket.ticket_id,
            )

        await session.commit()
        return {
            "ticketId": ticket.ticket_id,
            "status": ticket.status,
            "leaderName": leader_name,
            "depositAmount": float(deposit_amount or 0),
        }

    @staticmethod
    async def list_deposit_requests(session: AsyncSession, *, user_id) -> list[OperationalTicket]:
        result = await session.execute(
            text(
                """
                SELECT id, title, category, status, priority, responses, created_at
                FROM support_tickets
                WHERE author_id = :user_id
                  AND category = CAST('FINANCE' AS ticket_category)
                  AND responses -> 'metadata' ->> 'flowType' = 'USDT_ONBOARDING'
                ORDER BY created_at DESC
                """
            ),
            {"user_id": user_id},
        )
        tickets: list[OperationalTicket] = []
        for row in result.mappings().all():
            responses = row["responses"] or {}
            tickets.append(
                OperationalTicket(
                    ticket_id=responses.get("externalId") or str(row["id"]),
                    user_id=user_id,
                    title=row["title"],
                    category=row["category"],
                    status=row["status"],
                    priority=row["priority"],
                    created_at=row["created_at"],
                )
            )
        return tickets

    @staticmethod
    async def create_support_ticket(
        session: AsyncSession,
        *,
        user: User | None,
        title: str,
        description: str,
        category: str,
        priority: str = "medium",
        tags: list[str] | None = None,
        attachments: list[str] | None = None,
    ) -> OperationalTicket:
        external_id = f"TKT-{uuid4().hex[:10].upper()}"
        flow_type = "FRAUD_REPORT" if category.upper() == "FRAUD_REPORT" else "SUPPORT"
        ticket = await WalletService._create_ticket_raw(
            session,
            user=user,
            external_id=external_id,
            title=title,
            category=category,
            priority=priority,
            content=description,
            metadata={
                "flowType": flow_type,
                "requestedCategory": category,
                "tags": tags or [],
                "attachments": attachments or [],
            },
        )
        await session.commit()
        return ticket

    @staticmethod
    async def list_my_tickets(
        session: AsyncSession,
        *,
        user_id,
        categories: list[str] | None = None,
    ) -> list[OperationalTicket]:
        category_filter = [item.upper() for item in categories or [] if item.upper() in {"FINANCE", "TECHNICAL", "GENERAL"}]
        sql = """
            SELECT id, title, category, status, priority, responses, created_at
            FROM support_tickets
            WHERE author_id = :user_id
        """
        params: dict[str, object] = {"user_id": user_id}
        if category_filter:
            sql += " AND category = ANY(:categories)"
            params["categories"] = category_filter
        sql += " ORDER BY created_at DESC LIMIT 50"

        result = await session.execute(text(sql), params)
        tickets: list[OperationalTicket] = []
        for row in result.mappings().all():
            responses = row["responses"] or {}
            tickets.append(
                OperationalTicket(
                    ticket_id=responses.get("externalId") or str(row["id"]),
                    user_id=user_id,
                    title=row["title"],
                    category=row["category"],
                    status=row["status"],
                    priority=row["priority"],
                    created_at=row["created_at"],
                )
            )
        return tickets
