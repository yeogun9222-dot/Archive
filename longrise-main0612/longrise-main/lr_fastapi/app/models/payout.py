"""
Payout models for Longrise AI Platform
"""
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, String, Date
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class PayoutType(str, Enum):
    """Payout type enumeration"""
    DAILY_ROI = "Daily ROI"
    DIRECT_BONUS = "Direct Bonus"
    ROLLUP_BONUS = "Rollup Bonus"
    RANK_SHARE = "Rank Share"
    CNYT_AIRDROP = "CNYT Airdrop"
    PROMOTION = "Promotion"
    GLOBAL_POOL = "Global Pool"
    LEADERSHIP_BONUS = "Leadership Bonus"
    MATCHING_BONUS = "Matching Bonus"


class PayoutStatus(str, Enum):
    """Payout status enumeration"""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    RECOVERED = "RECOVERED"
    CANCELLED = "CANCELLED"


class PayoutBase(SQLModel):
    """Base payout model with common fields"""
    user_id: UUID = Field(foreign_key="users.id", index=True)
    payout_id: str = Field(max_length=50, unique=True, index=True)

    # Payout details
    type: PayoutType
    amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    currency: str = Field(default="USDT", max_length=10)

    # Status and processing
    status: PayoutStatus = Field(default=PayoutStatus.PENDING)

    # Calculation details
    base_amount: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))
    rate_percentage: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(5, 2)))
    calculation_date: date

    # Reference information
    reference_id: Optional[str] = Field(default=None, max_length=255)  # Reference to investment, user, etc.
    parent_payout_id: Optional[UUID] = Field(default=None, foreign_key="payouts.id")

    # Processing information
    processed_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    processed_at: Optional[datetime] = None
    failure_reason: Optional[str] = Field(default=None, max_length=512)

    # Transaction information
    tx_hash: Optional[str] = Field(default=None, max_length=255)
    block_confirmed: bool = Field(default=False)

    # Audit information
    description: Optional[str] = Field(default=None, max_length=1000)
    extra_data: Optional[str] = Field(default=None, max_length=2000)  # JSON string

    # Recovery information (for failed payouts)
    recovery_attempts: int = Field(default=0)
    last_recovery_attempt: Optional[datetime] = None


class Payout(PayoutBase, table=True):
    """Payout table model"""
    __tablename__ = "payouts"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()")
        )
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )


class PayoutSettingsBase(SQLModel):
    """Base payout settings model"""
    setting_key: str = Field(max_length=100, unique=True, index=True)
    setting_value: Decimal = Field(sa_column=Column(DECIMAL(10, 4)))
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)

    # Validation rules
    min_value: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(10, 4)))
    max_value: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(10, 4)))


class PayoutSettings(PayoutSettingsBase, table=True):
    """Payout settings table model"""
    __tablename__ = "payout_settings"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()")
        )
    )

    # Audit information
    updated_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )


# API Models
class PayoutCreate(SQLModel):
    """Payout creation model"""
    user_id: UUID
    type: PayoutType
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="USDT")
    calculation_date: date
    base_amount: Optional[Decimal] = None
    rate_percentage: Optional[Decimal] = None
    reference_id: Optional[str] = None
    description: Optional[str] = None


class PayoutRead(PayoutBase):
    """Payout read model (for API responses)"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PayoutUpdate(SQLModel):
    """Payout update model"""
    status: Optional[PayoutStatus] = None
    failure_reason: Optional[str] = None
    tx_hash: Optional[str] = None
    block_confirmed: Optional[bool] = None
    description: Optional[str] = None


class PayoutSettingsCreate(SQLModel):
    """Payout settings creation model"""
    setting_key: str
    setting_value: Decimal
    description: Optional[str] = None
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None


class PayoutSettingsRead(PayoutSettingsBase):
    """Payout settings read model"""
    id: UUID
    updated_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PayoutSettingsUpdate(SQLModel):
    """Payout settings update model"""
    setting_value: Optional[Decimal] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None


class PayoutBatch(SQLModel):
    """Batch payout model"""
    calculation_date: date
    payout_types: list[PayoutType]
    user_filters: Optional[dict] = None  # For filtering specific users
    dry_run: bool = Field(default=True)  # Preview mode


class PayoutSummary(SQLModel):
    """Payout summary model"""
    total_payouts: int
    total_amount: Decimal
    by_type: dict[str, dict]  # type -> {count, amount}
    by_status: dict[str, dict]  # status -> {count, amount}
    by_currency: dict[str, dict]  # currency -> {count, amount}