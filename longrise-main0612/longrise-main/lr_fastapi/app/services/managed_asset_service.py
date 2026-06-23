"""
Managed internal asset ledger service.

USDT and CNYT are temporarily treated as DB-managed internal assets rather than
externally settled on-chain balances. All operational flows should mutate these
balances through this helper and leave a ledger trail in the legacy
``transactions`` table used by the current application stack.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class ManagedAssetService:
    """Common balance and ledger helpers for managed internal assets."""

    ASSETS = {
        "USDT": {
            "balance_field": "balance_usdt",
            "kind": "managed_point",
            "display_name": "USDT Internal Ledger Credit",
        },
        "CNYT": {
            "balance_field": "balance_cnyt",
            "kind": "managed_goods",
            "display_name": "CNYT Internal Ledger Goods",
        },
    }

    @classmethod
    def get_asset_config(cls, asset: str) -> dict[str, str]:
        asset_code = asset.upper()
        if asset_code not in cls.ASSETS:
            raise ValueError("Unsupported managed asset")
        return cls.ASSETS[asset_code]

    @classmethod
    def get_balance(cls, user: User, asset: str) -> Decimal:
        config = cls.get_asset_config(asset)
        return getattr(user, config["balance_field"]) or Decimal("0")

    @classmethod
    def adjust_balance(cls, user: User, asset: str, delta: Decimal) -> tuple[Decimal, Decimal]:
        config = cls.get_asset_config(asset)
        before = getattr(user, config["balance_field"]) or Decimal("0")
        after = before + delta
        if after < 0:
            raise ValueError(f"Insufficient {asset.upper()} balance")
        setattr(user, config["balance_field"], after)
        user.updated_at = datetime.utcnow()
        return before, after

    @classmethod
    async def record_ledger_entry(
        cls,
        session: AsyncSession,
        *,
        user_id,
        asset: str,
        tx_type: str,
        amount: Decimal,
        status: str,
        description: str,
        reference_id: str,
        fee: Decimal = Decimal("0"),
    ) -> None:
        config = cls.get_asset_config(asset)
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
                "amount": amount.copy_abs(),
                "currency": asset.upper(),
                "status": status,
                "description": f"[managed-ledger:{config['kind']}] {description}",
                "hash": reference_id,
                "fee": fee,
                "created_at": now,
                "completed_at": now if status == "completed" else None,
            },
        )

