"""
Admin-facing operational controls for core screens.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin import Admin
from app.models.user import User
from app.services.audit_service import AuditService
from app.services.managed_asset_service import ManagedAssetService


@dataclass(frozen=True)
class CoreSettingRecord:
    setting_key: str
    setting_value: str


class AdminConsoleService:
    """Core admin controls used by the live dashboard and user management."""

    DEFAULT_SETTINGS = {
        "daily_roi_percent": {
            "value": "1.5",
            "display_name": "Daily ROI Percent",
            "description": "Displayed operational ROI control value",
            "category": "payout",
            "type": "decimal",
        },
        "cnyt_reward_engine_enabled": {
            "value": "true",
            "display_name": "CNYT Reward Engine",
            "description": "Operational toggle for the CNYT onboarding reward engine",
            "category": "payout",
            "type": "boolean",
        },
        "withdrawals_enabled": {
            "value": "true",
            "display_name": "Withdrawals Enabled",
            "description": "Global withdrawal kill switch",
            "category": "security",
            "type": "boolean",
        },
        "fds_auto_freeze_enabled": {
            "value": "false",
            "display_name": "FDS Auto Freeze",
            "description": "Global auto-freeze switch for suspicious flows",
            "category": "fds",
            "type": "boolean",
        },
    }

    @staticmethod
    def _setting_payload(key: str, value: str) -> str:
        config = AdminConsoleService.DEFAULT_SETTINGS[key]
        return json.dumps(
            {
                "value": value,
                "displayName": config["display_name"],
                "category": config["category"],
                "type": config["type"],
            }
        )

    @staticmethod
    def _extract_setting_value(raw_value: object, fallback: str) -> str:
        if isinstance(raw_value, dict):
            value = raw_value.get("value", fallback)
        else:
            value = raw_value if raw_value is not None else fallback
        if isinstance(value, bool):
            return "true" if value else "false"
        return str(value)

    @staticmethod
    async def _load_setting(session: AsyncSession, key: str) -> CoreSettingRecord | None:
        result = await session.execute(
            text('SELECT "key", value FROM system_settings WHERE "key" = :key'),
            {"key": key},
        )
        row = result.mappings().first()
        if not row:
            return None
        fallback = AdminConsoleService.DEFAULT_SETTINGS.get(key, {}).get("value", "")
        return CoreSettingRecord(
            setting_key=row["key"],
            setting_value=AdminConsoleService._extract_setting_value(row["value"], fallback),
        )

    @staticmethod
    async def ensure_default_settings(session: AsyncSession, admin: Admin | None = None) -> list[CoreSettingRecord]:
        for key, config in AdminConsoleService.DEFAULT_SETTINGS.items():
            existing = await AdminConsoleService._load_setting(session, key)
            if existing:
                continue
            await session.execute(
                text(
                    """
                    INSERT INTO system_settings ("key", value, description, updated_by, updated_at)
                    VALUES (:key, CAST(:value AS jsonb), :description, :updated_by, :updated_at)
                    """
                ),
                {
                    "key": key,
                    "value": AdminConsoleService._setting_payload(key, config["value"]),
                    "description": config["description"],
                    "updated_by": admin.id if admin else uuid4(),
                    "updated_at": datetime.utcnow(),
                },
            )

        await session.commit()
        settings: list[CoreSettingRecord] = []
        for key in AdminConsoleService.DEFAULT_SETTINGS:
            setting = await AdminConsoleService._load_setting(session, key)
            if setting:
                settings.append(setting)
        return settings

    @staticmethod
    async def get_core_settings(session: AsyncSession, admin: Admin) -> dict[str, str | bool | float]:
        settings = await AdminConsoleService.ensure_default_settings(session, admin)
        mapped = {item.setting_key: item.setting_value for item in settings}
        return {
            "daily_roi_percent": float(mapped.get("daily_roi_percent", "1.5")),
            "cnyt_reward_engine_enabled": mapped.get("cnyt_reward_engine_enabled", "true").lower() == "true",
            "withdrawals_enabled": mapped.get("withdrawals_enabled", "true").lower() == "true",
            "fds_auto_freeze_enabled": mapped.get("fds_auto_freeze_enabled", "false").lower() == "true",
        }

    @staticmethod
    async def update_core_setting(
        session: AsyncSession,
        *,
        admin: Admin,
        setting_key: str,
        setting_value: str,
        change_reason: str | None = None,
    ) -> CoreSettingRecord:
        await AdminConsoleService.ensure_default_settings(session, admin)
        setting = await AdminConsoleService._load_setting(session, setting_key)
        if not setting:
            raise ValueError("Unsupported core setting")
        old_value = setting.setting_value
        await session.execute(
            text(
                """
                UPDATE system_settings
                SET value = CAST(:value AS jsonb),
                    description = :description,
                    updated_by = :updated_by,
                    updated_at = :updated_at
                WHERE "key" = :key
                """
            ),
            {
                "key": setting_key,
                "value": AdminConsoleService._setting_payload(setting_key, setting_value),
                "description": change_reason or AdminConsoleService.DEFAULT_SETTINGS[setting_key]["description"],
                "updated_by": admin.id,
                "updated_at": datetime.utcnow(),
            },
        )
        await session.commit()
        await AuditService.log_action(
            session=session,
            admin_id=admin.id,
            admin_name=admin.name,
            admin_email=admin.email,
            action="update",
            resource="system",
            resource_id=setting.setting_key,
            old_values={"setting_value": old_value},
            new_values={"setting_value": setting_value},
            description=f"Updated core setting {setting.setting_key}",
        )
        return CoreSettingRecord(setting_key=setting_key, setting_value=setting_value)

    @staticmethod
    async def adjust_user_balance(
        session: AsyncSession,
        *,
        admin: Admin,
        user: User,
        currency: str,
        amount: Decimal,
    ) -> User:
        code = currency.upper()
        ManagedAssetService.adjust_balance(user, code, amount)
        session.add(user)
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=user.id,
            asset=code,
            tx_type="adjustment",
            amount=amount,
            status="completed",
            description=f"Admin managed-ledger adjustment ({'credit' if amount >= 0 else 'debit'})",
            reference_id=f"ADM-BAL-{uuid4().hex[:10].upper()}",
        )
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def set_user_restriction(
        session: AsyncSession,
        *,
        user: User,
        restriction_type: str,
        enabled: bool,
    ) -> User:
        if restriction_type == "withdrawal":
            user.is_withdrawal_blocked = enabled
        elif restriction_type == "account":
            user.is_account_locked = enabled
        elif restriction_type == "freeze":
            user.is_frozen = enabled
        else:
            raise ValueError("Unsupported restriction type")

        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def ban_user(session: AsyncSession, *, user: User, reason: str | None = None) -> User:
        user.status = "banned"
        user.is_account_locked = True
        user.block_reason = reason or "Administrative ban"
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
