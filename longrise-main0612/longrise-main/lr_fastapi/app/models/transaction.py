"""
Transaction models for Longrise AI Platform
통합 거래 이력 관리 (입출금, 투자, 수당, P2P 등 모든 거래)
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, String, Text, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class TransactionType(str, Enum):
    """Transaction type enumeration"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    INVESTMENT = "investment"
    ROI_PAYOUT = "roi_payout"
    DIRECT_BONUS = "direct_bonus"
    ROLLUP_BONUS = "rollup_bonus"
    RANK_BONUS = "rank_bonus"
    GLOBAL_POOL = "global_pool"
    P2P_SEND = "p2p_send"
    P2P_RECEIVE = "p2p_receive"
    EARLY_TERMINATION = "early_termination"
    COMMISSION = "commission"
    FEE = "fee"
    PENALTY = "penalty"
    ADJUSTMENT = "adjustment"
    AIRDROP = "airdrop"


class TransactionStatus(str, Enum):
    """Transaction status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REVERSED = "reversed"


class TransactionDirection(str, Enum):
    """Transaction direction enumeration"""
    CREDIT = "credit"  # 입금, 수익
    DEBIT = "debit"    # 출금, 지출


class TransactionBase(SQLModel):
    """Base transaction model"""
    transaction_id: str = Field(max_length=50, unique=True, index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)

    # Transaction details
    type: TransactionType
    direction: TransactionDirection
    status: TransactionStatus = Field(default=TransactionStatus.PENDING)

    # Amount and currency
    amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    currency: str = Field(max_length=10)  # USDT, CNYT, etc.
    fee_amount: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    net_amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))  # amount ± fee

    # Balance tracking
    balance_before: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    balance_after: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))

    # Reference information
    reference_type: Optional[str] = Field(default=None, max_length=50)  # withdrawal, investment, payout, etc.
    reference_id: Optional[str] = Field(default=None, max_length=255)  # ID of related record
    parent_transaction_id: Optional[UUID] = Field(default=None, foreign_key="transactions.id")

    # External identifiers
    external_tx_id: Optional[str] = Field(default=None, max_length=255)  # blockchain tx hash, bank ref, etc.
    external_address: Optional[str] = Field(default=None, max_length=255)  # wallet address, account number
    network: Optional[str] = Field(default=None, max_length=50)  # TRC-20, ERC-20, etc.

    # Processing information
    processed_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    processed_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    confirmations: int = Field(default=0)

    # Risk and compliance
    risk_score: int = Field(default=0, ge=0, le=100)
    is_flagged: bool = Field(default=False)
    flag_reason: Optional[str] = Field(default=None, max_length=500)

    # Description and notes
    description: str = Field(max_length=500)
    admin_notes: Optional[str] = Field(default=None, max_length=1000)
    user_notes: Optional[str] = Field(default=None, max_length=500)

    # Metadata for complex transactions
    extra_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # IP and session tracking
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=512)
    session_id: Optional[str] = Field(default=None, max_length=255)


class Transaction(TransactionBase, table=True):
    """Transaction table model"""
    __tablename__ = "transactions"

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


class TokenPriceBase(SQLModel):
    """Base token price model"""
    token_symbol: str = Field(max_length=20, index=True)
    price_usd: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))

    # Price source
    source: str = Field(default="internal", max_length=50)  # internal, binance, coingecko, etc.
    last_updated: datetime

    # Price history
    price_24h_ago: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))
    change_24h_percent: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(8, 4)))

    # Volume and market data
    volume_24h: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))
    market_cap: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))

    # Trading pairs
    base_currency: str = Field(default="USD", max_length=10)

    # Status
    is_active: bool = Field(default=True)
    is_manual: bool = Field(default=False)  # Manually set price vs auto-fetched

    # Admin control
    updated_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")


class TokenPrice(TokenPriceBase, table=True):
    """Token price table model"""
    __tablename__ = "token_prices"

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


# API Models
class TransactionCreate(SQLModel):
    """Transaction creation model"""
    type: TransactionType
    direction: TransactionDirection
    amount: Decimal
    currency: str
    fee_amount: Decimal = Decimal("0.0")
    description: str
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None


class TransactionRead(TransactionBase):
    """Transaction read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionUpdate(SQLModel):
    """Transaction update model"""
    status: Optional[TransactionStatus] = None
    external_tx_id: Optional[str] = None
    confirmations: Optional[int] = None
    admin_notes: Optional[str] = None
    is_flagged: Optional[bool] = None
    flag_reason: Optional[str] = None


class TokenPriceCreate(SQLModel):
    """Token price creation model"""
    token_symbol: str
    price_usd: Decimal
    source: str = "internal"
    is_manual: bool = False


class TokenPriceRead(TokenPriceBase):
    """Token price read model"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TokenPriceUpdate(SQLModel):
    """Token price update model"""
    price_usd: Optional[Decimal] = None
    is_active: Optional[bool] = None
    is_manual: Optional[bool] = None


class TransactionSummary(SQLModel):
    """Transaction summary model"""
    total_transactions: int
    total_volume: Decimal
    by_type: Dict[str, Dict]
    by_status: Dict[str, Dict]
    by_currency: Dict[str, Dict]
    recent_transactions: list[Dict]


class DailyTransactionStats(SQLModel):
    """Daily transaction statistics"""
    date: str
    total_count: int
    total_volume: Decimal
    deposits: int
    withdrawals: int
    investments: int
    payouts: int
    p2p_trades: int