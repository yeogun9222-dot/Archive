"""
User models for Longrise AI Platform
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

from pydantic import EmailStr, computed_field
from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, Enum as SQLEnum, String, Boolean, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID

import enum


class DragonRank(str, enum.Enum):
    """Dragon rank enumeration"""
    INVESTOR = "Investor"
    WHITE_DRAGON = "White Dragon"
    BLUE_DRAGON = "Blue Dragon"
    PURPLE_DRAGON = "Purple Dragon"
    RED_DRAGON = "Red Dragon"
    BLACK_DRAGON = "Black Dragon"


class UserStatus(str, enum.Enum):
    """User status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"
    SUSPENDED = "suspended"


class KYCStatus(str, enum.Enum):
    """KYC status enumeration"""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class DistributorStatus(str, enum.Enum):
    """Distributor status enumeration"""
    NONE = "none"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class UserBase(SQLModel):
    """Base user model with common fields"""
    nickname: str = Field(max_length=50, unique=True, index=True)
    email: EmailStr = Field(unique=True, index=True)
    name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)

    # Account status
    rank: DragonRank = Field(
        default=DragonRank.INVESTOR,
        sa_column=Column(
            SQLEnum(
                DragonRank,
                name="dragon_rank",
                create_type=False,
                values_callable=lambda values: [item.value for item in values],
            )
        ),
    )
    status: UserStatus = Field(
        default=UserStatus.ACTIVE,
        sa_column=Column(
            SQLEnum(
                UserStatus,
                name="user_status",
                create_type=False,
                values_callable=lambda values: [item.value for item in values],
            )
        ),
    )

    # Asset information
    balance_usdt: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(18, 8)))
    locked_usdt: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(18, 8)))
    balance_cnyt: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(18, 8)))

    # Investment information
    package: str = Field(default="Flexible", max_length=20)
    initial_investment: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(18, 8)))
    investment_date: Optional[datetime] = None

    # Team/Organization information
    sponsor_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    team_size: int = Field(default=0)
    team_vol: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(18, 8)))
    body_value: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(18, 8)))

    # KYC information
    kyc_level: int = Field(default=0, ge=0, le=3)
    kyc_status: KYCStatus = Field(
        default=KYCStatus.PENDING,
        sa_column=Column(
            SQLEnum(
                KYCStatus,
                name="kyc_status",
                create_type=False,
                values_callable=lambda values: [item.value for item in values],
            )
        ),
    )
    kyc_updated_at: Optional[datetime] = None
    pageface: bool = Field(default=False)
    mobile_binding: bool = Field(default=False)

    # Security information
    has_set_trading_password: bool = Field(default=False)
    is_trading_password_verified: bool = Field(default=False)
    otp_enabled: bool = Field(default=False)
    otp_secret: Optional[str] = Field(default=None, sa_column=Column(String(512)))
    otp_pending_secret: Optional[str] = Field(default=None, sa_column=Column(String(512)))
    otp_pending_created_at: Optional[datetime] = None
    otp_backup_codes_hash: Optional[str] = Field(default=None, sa_column=Column(Text))
    last_login_at: Optional[datetime] = None
    anti_phishing_code: Optional[str] = Field(default=None, max_length=10)

    # Distributor information
    distributor_status: DistributorStatus = Field(
        default=DistributorStatus.NONE,
        sa_column=Column(
            SQLEnum(
                DistributorStatus,
                name="distributor_status",
                create_type=False,
                values_callable=lambda values: [item.value for item in values],
            )
        ),
    )
    distributor_code: Optional[str] = Field(default=None, max_length=10)
    distributor_approved_at: Optional[datetime] = None
    commission_rate: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(5, 2)))
    total_commission: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(18, 8)))
    referred_count: int = Field(default=0)

    # Referral code policy (V8.9): 8-char uppercase alphanumeric code.
    referral_code: Optional[str] = Field(default=None, max_length=8, unique=True, index=True)
    referred_by_code: Optional[str] = Field(default=None, max_length=8)

    # Restrictions
    is_withdrawal_blocked: bool = Field(default=False)
    is_account_locked: bool = Field(default=False)
    is_frozen: bool = Field(default=False)
    block_reason: Optional[str] = None
    block_expires_at: Optional[datetime] = None
    max_out_ratio: Decimal = Field(default=Decimal("10.0"), sa_column=Column(DECIMAL(4, 1)))


class User(UserBase, table=True):
    """User table model"""
    __tablename__ = "users"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()")
        )
    )

    # Security fields (not included in base for API responses)
    password_hash: str = Field(sa_column=Column(String(255)))
    trading_password_hash: Optional[str] = Field(default=None, sa_column=Column(String(255)))

    # Timestamps
    join_date: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_DATE"))
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )


# API Models

class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(min_length=8, max_length=128)
    trading_password: Optional[str] = Field(default=None, min_length=4, max_length=4, regex=r"^\d{4}$")


class UserRead(UserBase):
    """User read model (for API responses)"""
    id: UUID
    join_date: datetime
    created_at: datetime
    updated_at: datetime

    otp_secret: Optional[str] = Field(default=None, exclude=True)
    otp_pending_secret: Optional[str] = Field(default=None, exclude=True)
    otp_pending_created_at: Optional[datetime] = Field(default=None, exclude=True)
    otp_backup_codes_hash: Optional[str] = Field(default=None, exclude=True)

    # Computed fields
    total_assets: Decimal = Field(default=Decimal("0.00"))

    @computed_field
    @property
    def otp_configured(self) -> bool:
        return bool(self.otp_secret)

    class Config:
        from_attributes = True


class UserUpdate(SQLModel):
    """User update model"""
    nickname: Optional[str] = Field(default=None, max_length=50)
    name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    anti_phishing_code: Optional[str] = Field(default=None, max_length=10)
    mobile_binding: Optional[bool] = None


class UserLogin(SQLModel):
    """User login model"""
    email: EmailStr
    password: str


class Token(SQLModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"


class TokenData(SQLModel):
    """Token data model"""
    email: Optional[str] = None
