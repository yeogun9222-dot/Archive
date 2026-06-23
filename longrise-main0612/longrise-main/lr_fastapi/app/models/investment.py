"""
Investment and Package models for Longrise AI Platform
"""
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, String, Text, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class PackageType(str, Enum):
    """Investment package type enumeration"""
    FLEXIBLE = "Flexible"
    BASIC = "Basic"
    STANDARD = "Standard"
    PREMIUM = "Premium"
    VIP = "VIP"


class PackageStatus(str, Enum):
    """Package status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"


class InvestmentStatus(str, Enum):
    """Investment status enumeration"""
    ACTIVE = "active"
    COMPLETED = "completed"
    EARLY_TERMINATED = "early_terminated"
    SUSPENDED = "suspended"


class InvestmentPackageBase(SQLModel):
    """Base investment package model"""
    package_id: str = Field(max_length=50, unique=True, index=True)
    name: str = Field(max_length=100)
    type: PackageType

    # Investment terms
    min_amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    max_amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    duration_months: int = Field(ge=1, le=60)

    # ROI configuration
    daily_roi_rate: Decimal = Field(sa_column=Column(DECIMAL(5, 4)))  # e.g., 0.015 for 1.5%
    total_roi_cap: Decimal = Field(sa_column=Column(DECIMAL(5, 2)))   # e.g., 3.0 for 300%

    # Bonus configuration
    direct_bonus_rate: Decimal = Field(default=Decimal("0.10"), sa_column=Column(DECIMAL(5, 2)))
    rollup_bonus_rate: Decimal = Field(default=Decimal("0.05"), sa_column=Column(DECIMAL(5, 2)))

    # Early termination
    early_termination_allowed: bool = Field(default=True)
    early_termination_penalty: Decimal = Field(default=Decimal("0.15"), sa_column=Column(DECIMAL(5, 2)))
    min_hold_days: int = Field(default=30)

    # Status and visibility
    status: PackageStatus = Field(default=PackageStatus.ACTIVE)
    is_featured: bool = Field(default=False)
    is_new: bool = Field(default=False)

    # Display information
    description: Optional[str] = Field(default=None, max_length=1000)
    features: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    terms_conditions: Optional[str] = Field(default=None, max_length=5000)

    # Risk and compliance
    risk_level: str = Field(default="medium", max_length=20)  # low, medium, high
    kyc_required: bool = Field(default=True)
    min_user_level: int = Field(default=1, ge=1, le=5)

    # Limits and quotas
    total_supply_limit: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))
    current_supply: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    max_per_user: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(18, 8)))

    # Metadata
    created_by: UUID = Field(foreign_key="admin_users.id")
    updated_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")


class InvestmentPackage(InvestmentPackageBase, table=True):
    """Investment package table model"""
    __tablename__ = "investment_packages"

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


class UserInvestmentBase(SQLModel):
    """Base user investment model"""
    investment_id: str = Field(max_length=50, unique=True, index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    package_id: UUID = Field(foreign_key="investment_packages.id")

    # Investment details
    principal_amount: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))
    currency: str = Field(default="USDT", max_length=10)

    # Dates
    invested_at: datetime
    maturity_date: datetime
    early_terminated_at: Optional[datetime] = None

    # ROI tracking
    daily_roi_rate: Decimal = Field(sa_column=Column(DECIMAL(5, 4)))  # Locked rate at investment time
    total_roi_earned: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    last_roi_date: Optional[date] = None

    # Current status
    status: InvestmentStatus = Field(default=InvestmentStatus.ACTIVE)
    current_value: Decimal = Field(sa_column=Column(DECIMAL(18, 8)))  # principal + earned

    # Early termination
    termination_reason: Optional[str] = Field(default=None, max_length=500)
    termination_penalty: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    final_payout: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))

    # Admin tracking
    approved_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    approved_at: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=1000)


class UserInvestment(UserInvestmentBase, table=True):
    """User investment table model"""
    __tablename__ = "user_investments"

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
class InvestmentPackageCreate(SQLModel):
    """Investment package creation model"""
    package_id: str
    name: str
    type: PackageType
    min_amount: Decimal
    max_amount: Decimal
    duration_months: int
    daily_roi_rate: Decimal
    total_roi_cap: Decimal
    description: Optional[str] = None
    features: Optional[list[str]] = None
    risk_level: str = "medium"


class InvestmentPackageRead(InvestmentPackageBase):
    """Investment package read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvestmentPackageUpdate(SQLModel):
    """Investment package update model"""
    name: Optional[str] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    daily_roi_rate: Optional[Decimal] = None
    status: Optional[PackageStatus] = None
    description: Optional[str] = None
    features: Optional[list[str]] = None


class UserInvestmentCreate(SQLModel):
    """User investment creation model"""
    package_id: UUID
    principal_amount: Decimal
    currency: str = "USDT"


class UserInvestmentRead(UserInvestmentBase):
    """User investment read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserInvestmentUpdate(SQLModel):
    """User investment update model"""
    status: Optional[InvestmentStatus] = None
    termination_reason: Optional[str] = None
    notes: Optional[str] = None


class InvestmentSummary(SQLModel):
    """Investment summary model"""
    total_packages: int
    total_investments: int
    total_invested_amount: Decimal
    total_active_investments: int
    total_roi_paid: Decimal
    by_package_type: Dict[str, Dict]
    by_status: Dict[str, Dict]