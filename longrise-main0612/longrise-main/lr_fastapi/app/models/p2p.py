"""
P2P Trade models for Longrise AI Platform
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class P2PTradeStatus(str, Enum):
    """P2P trade status enumeration"""
    PENDING = "pending"
    ACTIVE = "active"
    MATCHED = "matched"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"
    RESOLVED = "resolved"
    EXPIRED = "expired"


class P2PTradeType(str, Enum):
    """P2P trade type enumeration"""
    BUY = "buy"
    SELL = "sell"


class P2PDisputeStatus(str, Enum):
    """P2P dispute status enumeration"""
    PENDING = "pending"
    INVESTIGATING = "investigating"
    AWAITING_RESPONSE = "awaiting_response"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class P2PDisputeType(str, Enum):
    """P2P dispute type enumeration"""
    PAYMENT_NOT_RECEIVED = "payment_not_received"
    PAYMENT_NOT_SENT = "payment_not_sent"
    WRONG_PAYMENT_METHOD = "wrong_payment_method"
    FRAUD_ALLEGATION = "fraud_allegation"
    TECHNICAL_ISSUE = "technical_issue"
    OTHER = "other"


class P2PTradeBase(SQLModel):
    """Base P2P trade model"""
    trade_id: str = Field(max_length=50, unique=True, index=True)

    # Trade participants
    creator_id: UUID = Field(foreign_key="users.id", index=True)
    counterpart_id: Optional[UUID] = Field(default=None, foreign_key="users.id")

    # Trade details
    trade_type: P2PTradeType
    asset: str = Field(max_length=20)  # USDT, CNYT, etc.
    amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    price_per_unit: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    total_value: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    currency: str = Field(max_length=10)  # USD, KRW, etc.

    # Status and timing
    status: P2PTradeStatus = Field(default=P2PTradeStatus.PENDING)
    expires_at: Optional[datetime] = None
    matched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Payment information
    payment_method: Optional[str] = Field(default=None, max_length=100)
    payment_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Terms and conditions
    min_trade_amount: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))
    max_trade_amount: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))
    trading_terms: Optional[str] = Field(default=None, max_length=2000)
    auto_reply_message: Optional[str] = Field(default=None, max_length=500)

    # Security and verification
    requires_kyc: bool = Field(default=True)
    requires_phone_verification: bool = Field(default=True)
    trading_password_verified: bool = Field(default=False)

    # Fees
    platform_fee_rate: Decimal = Field(default=Decimal("0.005"), sa_column=Column(DECIMAL(5, 4)))
    platform_fee_amount: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))

    # Risk assessment
    risk_score: int = Field(default=0, ge=0, le=100)
    risk_flags: Optional[str] = Field(default=None, max_length=1000)

    # Transaction tracking
    escrow_tx_hash: Optional[str] = Field(default=None, max_length=255)
    release_tx_hash: Optional[str] = Field(default=None, max_length=255)

    # Dispute information
    dispute_count: int = Field(default=0)
    has_active_dispute: bool = Field(default=False)

    # Admin information
    admin_notes: Optional[str] = Field(default=None, max_length=2000)
    flagged_by_admin: bool = Field(default=False)
    flagged_reason: Optional[str] = Field(default=None, max_length=500)


class P2PTrade(P2PTradeBase, table=True):
    """P2P trade table model"""
    __tablename__ = "p2p_trades"

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
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )


class P2PDisputeBase(SQLModel):
    """Base P2P dispute model"""
    dispute_id: str = Field(max_length=50, unique=True, index=True)
    trade_id: UUID = Field(foreign_key="p2p_trades.id", index=True)

    # Dispute information
    dispute_type: P2PDisputeType
    status: P2PDisputeStatus = Field(default=P2PDisputeStatus.PENDING)

    # Participants
    complainant_id: UUID = Field(foreign_key="users.id")
    respondent_id: UUID = Field(foreign_key="users.id")

    # Dispute details
    title: str = Field(max_length=200)
    description: str = Field(max_length=3000)
    evidence_files: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))

    # Resolution information
    assigned_admin_id: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    resolution: Optional[str] = Field(default=None, max_length=3000)
    resolution_amount: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))
    resolution_notes: Optional[str] = Field(default=None, max_length=2000)

    # Timing
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    # Priority and escalation
    priority: str = Field(default="medium", max_length=20)  # low, medium, high, urgent
    escalated: bool = Field(default=False)
    escalated_at: Optional[datetime] = None

    # Communication
    last_response_by: Optional[UUID] = Field(default=None)
    last_response_at: Optional[datetime] = None


class P2PDispute(P2PDisputeBase, table=True):
    """P2P dispute table model"""
    __tablename__ = "p2p_disputes"

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
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )


class P2PMessageBase(SQLModel):
    """Base P2P message model for trade communications"""
    trade_id: Optional[UUID] = Field(default=None, foreign_key="p2p_trades.id")
    dispute_id: Optional[UUID] = Field(default=None, foreign_key="p2p_disputes.id")

    # Message information
    sender_id: UUID = Field(foreign_key="users.id")
    sender_type: str = Field(max_length=20)  # user, admin, system
    message: str = Field(max_length=2000)

    # Message metadata
    message_type: str = Field(default="text", max_length=20)  # text, image, file, system
    attachments: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))

    # Status
    is_read: bool = Field(default=False)
    read_at: Optional[datetime] = None
    is_automated: bool = Field(default=False)


class P2PMessage(P2PMessageBase, table=True):
    """P2P message table model"""
    __tablename__ = "p2p_messages"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()")
        )
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    )


# API Models
class P2PTradeCreate(SQLModel):
    """P2P trade creation model"""
    trade_type: P2PTradeType
    asset: str
    amount: Decimal = Field(gt=0)
    price_per_unit: Decimal = Field(gt=0)
    currency: str
    payment_method: Optional[str] = None
    payment_details: Optional[Dict[str, Any]] = None
    trading_terms: Optional[str] = None
    auto_reply_message: Optional[str] = None
    requires_kyc: bool = True
    requires_phone_verification: bool = True


class P2PTradeRead(P2PTradeBase):
    """P2P trade read model (for API responses)"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class P2PTradeUpdate(SQLModel):
    """P2P trade update model"""
    status: Optional[P2PTradeStatus] = None
    counterpart_id: Optional[UUID] = None
    payment_details: Optional[Dict[str, Any]] = None
    trading_terms: Optional[str] = None
    admin_notes: Optional[str] = None
    flagged_by_admin: Optional[bool] = None
    flagged_reason: Optional[str] = None


class P2PDisputeCreate(SQLModel):
    """P2P dispute creation model"""
    trade_id: UUID
    dispute_type: P2PDisputeType
    title: str
    description: str
    evidence_files: Optional[list[str]] = None


class P2PDisputeRead(P2PDisputeBase):
    """P2P dispute read model (for API responses)"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class P2PDisputeUpdate(SQLModel):
    """P2P dispute update model"""
    status: Optional[P2PDisputeStatus] = None
    assigned_admin_id: Optional[UUID] = None
    resolution: Optional[str] = None
    resolution_amount: Optional[Decimal] = None
    resolution_notes: Optional[str] = None
    priority: Optional[str] = None


class P2PMessageCreate(SQLModel):
    """P2P message creation model"""
    trade_id: Optional[UUID] = None
    dispute_id: Optional[UUID] = None
    message: str
    message_type: str = "text"
    attachments: Optional[list[str]] = None


class P2PMessageRead(P2PMessageBase):
    """P2P message read model (for API responses)"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class P2PTradeSummary(SQLModel):
    """P2P trade summary model"""
    total_trades: int
    active_trades: int
    completed_trades: int
    disputed_trades: int
    total_volume: Decimal
    by_status: Dict[str, Dict]
    by_asset: Dict[str, Dict]


class P2PDisputeSummary(SQLModel):
    """P2P dispute summary model"""
    total_disputes: int
    open_disputes: int
    resolved_disputes: int
    by_status: Dict[str, int]
    by_type: Dict[str, int]
    average_resolution_time_hours: Optional[float]