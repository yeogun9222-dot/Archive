"""
Withdrawal models for Longrise AI Platform
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, String, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class WithdrawalStatus(str, Enum):
    """Withdrawal status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class WithdrawalType(str, Enum):
    """Withdrawal type enumeration"""
    USDT = "USDT"
    CNYT = "CNYT"
    PROFIT = "PROFIT"


class Network(str, Enum):
    """Settlement channel enumeration for managed internal assets"""
    TRC20 = "TRC-20"
    ERC20 = "ERC-20"
    BSC = "BSC"
    POLYGON = "POLYGON"
    INTERNAL = "INTERNAL"


class WithdrawalBase(SQLModel):
    """Base withdrawal model with common fields"""
    user_id: UUID = Field(foreign_key="users.id")
    withdrawal_id: str = Field(max_length=50, unique=True, index=True)

    # Withdrawal details
    amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    asset: WithdrawalType = Field(default=WithdrawalType.USDT)
    network: Network = Field(default=Network.TRC20)
    wallet_address: str = Field(max_length=255)  # settlement destination / memo / account

    # Status and processing
    status: WithdrawalStatus = Field(default=WithdrawalStatus.PENDING)
    auto_approved: bool = Field(default=False)

    # Fee information
    fee_amount: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    final_amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))  # amount - fee

    # Request information
    request_time: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=512)

    # Processing information
    processed_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    processed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = Field(default=None, max_length=512)

    # Transaction information
    tx_hash: Optional[str] = Field(default=None, max_length=255)  # manual settlement reference
    block_number: Optional[int] = None
    confirmations: int = Field(default=0)

    # Risk assessment
    risk_score: int = Field(default=0, ge=0, le=100)
    risk_flags: Optional[str] = Field(default=None, max_length=1000)  # JSON string

    # Notes
    admin_notes: Optional[str] = Field(default=None, max_length=1000)


class Withdrawal(WithdrawalBase, table=True):
    """Withdrawal table model"""
    __tablename__ = "withdrawals"

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


# API Models
class WithdrawalCreate(SQLModel):
    """Withdrawal creation model"""
    amount: Decimal = Field(gt=0)
    asset: WithdrawalType = Field(default=WithdrawalType.USDT)
    network: Network = Field(default=Network.INTERNAL)
    wallet_address: str = Field(min_length=3, max_length=255)
    trading_password: str = Field(min_length=4, max_length=4, regex=r"^\d{4}$")
    otp_code: Optional[str] = Field(default=None, min_length=6, max_length=6)


class WithdrawalRead(WithdrawalBase):
    """Withdrawal read model (for API responses)"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WithdrawalUpdate(SQLModel):
    """Withdrawal update model"""
    status: Optional[WithdrawalStatus] = None
    rejection_reason: Optional[str] = None
    admin_notes: Optional[str] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    confirmations: Optional[int] = None


class WithdrawalApproval(SQLModel):
    """Withdrawal approval model"""
    withdrawal_id: str
    admin_notes: Optional[str] = None


class WithdrawalRejection(SQLModel):
    """Withdrawal rejection model"""
    withdrawal_id: str
    rejection_reason: str
    admin_notes: Optional[str] = None
