"""
Reconciliation models for Longrise AI Platform
회계 대사 및 재무 조정 관리
"""
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, String, Text, JSON, Boolean, Date
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class ReconciliationType(str, Enum):
    """Reconciliation type enumeration"""
    DAILY_BALANCE = "daily_balance"
    PAYOUT_BATCH = "payout_batch"
    WITHDRAWAL_BATCH = "withdrawal_batch"
    INVESTMENT_BATCH = "investment_batch"
    P2P_SETTLEMENT = "p2p_settlement"
    EXTERNAL_EXCHANGE = "external_exchange"
    MANUAL_ADJUSTMENT = "manual_adjustment"


class ReconciliationStatus(str, Enum):
    """Reconciliation status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    MATCHED = "matched"
    DISCREPANCY = "discrepancy"
    RESOLVED = "resolved"
    FAILED = "failed"


class DiscrepancySeverity(str, Enum):
    """Discrepancy severity enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ReconciliationRecordBase(SQLModel):
    """Base reconciliation record model"""
    record_id: str = Field(max_length=50, unique=True, index=True)
    type: ReconciliationType
    status: ReconciliationStatus = Field(default=ReconciliationStatus.PENDING)

    # Period information
    reconciliation_date: date
    period_start: datetime
    period_end: datetime

    # Internal system data
    internal_record_count: int = Field(default=0)
    internal_total_amount: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    internal_currency: str = Field(max_length=10)
    internal_checksum: Optional[str] = Field(default=None, max_length=64)

    # External/reference data
    external_record_count: int = Field(default=0)
    external_total_amount: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    external_currency: str = Field(max_length=10)
    external_source: Optional[str] = Field(default=None, max_length=100)
    external_reference: Optional[str] = Field(default=None, max_length=255)

    # Discrepancy analysis
    count_discrepancy: int = Field(default=0)
    amount_discrepancy: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    percentage_discrepancy: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(8, 4)))

    # Severity and priority
    severity: DiscrepancySeverity = Field(default=DiscrepancySeverity.LOW)
    requires_investigation: bool = Field(default=False)
    auto_resolvable: bool = Field(default=False)

    # Resolution tracking
    investigation_notes: Optional[str] = Field(default=None, max_length=2000)
    resolution_actions: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    resolved_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    resolved_at: Optional[datetime] = None

    # Process tracking
    started_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    processing_duration_seconds: Optional[int] = None

    # Data sources
    internal_data_source: Optional[str] = Field(default=None, max_length=200)
    external_data_source: Optional[str] = Field(default=None, max_length=200)

    # Additional metadata
    extra_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    # Audit trail
    change_log: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))


class ReconciliationRecord(ReconciliationRecordBase, table=True):
    """Reconciliation record table model"""
    __tablename__ = "reconciliation_records"

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


class ReconciliationItemType(str, Enum):
    """Reconciliation item type enumeration"""
    MISSING_INTERNAL = "missing_internal"
    MISSING_EXTERNAL = "missing_external"
    AMOUNT_MISMATCH = "amount_mismatch"
    STATUS_MISMATCH = "status_mismatch"
    DUPLICATE_RECORD = "duplicate_record"
    ORPHANED_RECORD = "orphaned_record"
    TIMING_ISSUE = "timing_issue"


class ReconciliationItemBase(SQLModel):
    """Base reconciliation item model (individual discrepancies)"""
    reconciliation_id: UUID = Field(foreign_key="reconciliation_records.id", index=True)
    item_type: ReconciliationItemType

    # Item identification
    internal_id: Optional[str] = Field(default=None, max_length=255)
    external_id: Optional[str] = Field(default=None, max_length=255)
    reference_id: str = Field(max_length=255, index=True)

    # Discrepancy details
    discrepancy_description: str = Field(max_length=1000)
    internal_value: Optional[str] = Field(default=None, max_length=500)
    external_value: Optional[str] = Field(default=None, max_length=500)
    expected_value: Optional[str] = Field(default=None, max_length=500)

    # Financial impact
    financial_impact: Decimal = Field(default=Decimal("0.0"), sa_column=Column(DECIMAL(18, 8)))
    currency: str = Field(max_length=10)

    # Resolution
    is_resolved: bool = Field(default=False)
    resolution_method: Optional[str] = Field(default=None, max_length=200)
    resolution_notes: Optional[str] = Field(default=None, max_length=1000)
    resolved_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    resolved_at: Optional[datetime] = None

    # Priority and impact
    priority: str = Field(default="medium", max_length=20)  # low, medium, high, critical
    business_impact: Optional[str] = Field(default=None, max_length=500)

    # Additional context
    additional_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))


class ReconciliationItem(ReconciliationItemBase, table=True):
    """Reconciliation item table model"""
    __tablename__ = "reconciliation_items"

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


class ReconciliationRuleBase(SQLModel):
    """Base reconciliation rule model"""
    rule_name: str = Field(max_length=200, unique=True, index=True)
    rule_type: ReconciliationType

    # Rule configuration
    description: str = Field(max_length=1000)
    is_active: bool = Field(default=True)
    auto_execute: bool = Field(default=False)

    # Schedule configuration
    schedule_expression: Optional[str] = Field(default=None, max_length=100)  # cron expression
    timezone: str = Field(default="UTC", max_length=50)

    # Thresholds
    amount_threshold: Decimal = Field(default=Decimal("0.01"), sa_column=Column(DECIMAL(18, 8)))
    percentage_threshold: Decimal = Field(default=Decimal("0.01"), sa_column=Column(DECIMAL(8, 4)))
    max_discrepancy_count: int = Field(default=10)

    # Data source configuration
    internal_query: str = Field(max_length=5000)  # SQL query for internal data
    external_data_config: Dict[str, Any] = Field(sa_column=Column(JSON))  # Config for external data source

    # Notification settings
    notify_on_discrepancy: bool = Field(default=True)
    notification_recipients: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    escalation_threshold: Decimal = Field(default=Decimal("1000.0"), sa_column=Column(DECIMAL(18, 8)))

    # Automation settings
    auto_resolve_rules: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    max_auto_resolve_amount: Decimal = Field(default=Decimal("10.0"), sa_column=Column(DECIMAL(18, 8)))

    # Admin settings
    created_by: UUID = Field(foreign_key="admin_users.id")
    updated_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")


class ReconciliationRule(ReconciliationRuleBase, table=True):
    """Reconciliation rule table model"""
    __tablename__ = "reconciliation_rules"

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
class ReconciliationRecordCreate(SQLModel):
    """Reconciliation record creation model"""
    type: ReconciliationType
    reconciliation_date: date
    period_start: datetime
    period_end: datetime
    internal_currency: str
    external_currency: str
    external_source: Optional[str] = None


class ReconciliationRecordRead(ReconciliationRecordBase):
    """Reconciliation record read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReconciliationRecordUpdate(SQLModel):
    """Reconciliation record update model"""
    status: Optional[ReconciliationStatus] = None
    investigation_notes: Optional[str] = None
    resolution_actions: Optional[List[str]] = None


class ReconciliationItemCreate(SQLModel):
    """Reconciliation item creation model"""
    item_type: ReconciliationItemType
    reference_id: str
    discrepancy_description: str
    financial_impact: Decimal = Decimal("0.0")
    currency: str
    internal_id: Optional[str] = None
    external_id: Optional[str] = None


class ReconciliationItemRead(ReconciliationItemBase):
    """Reconciliation item read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReconciliationItemUpdate(SQLModel):
    """Reconciliation item update model"""
    is_resolved: Optional[bool] = None
    resolution_method: Optional[str] = None
    resolution_notes: Optional[str] = None


class ReconciliationRuleCreate(SQLModel):
    """Reconciliation rule creation model"""
    rule_name: str
    rule_type: ReconciliationType
    description: str
    auto_execute: bool = False
    schedule_expression: Optional[str] = None
    internal_query: str
    external_data_config: Dict[str, Any]


class ReconciliationRuleRead(ReconciliationRuleBase):
    """Reconciliation rule read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReconciliationRuleUpdate(SQLModel):
    """Reconciliation rule update model"""
    description: Optional[str] = None
    is_active: Optional[bool] = None
    auto_execute: Optional[bool] = None
    schedule_expression: Optional[str] = None


class ReconciliationSummary(SQLModel):
    """Reconciliation summary model"""
    total_reconciliations: int
    pending_reconciliations: int
    discrepancy_count: int
    total_discrepancy_amount: Decimal
    recent_reconciliations: List[Dict[str, Any]]
    by_type: Dict[str, Dict]
    by_status: Dict[str, Dict]


class DailyReconciliationReport(SQLModel):
    """Daily reconciliation report model"""
    report_date: date
    total_processed: int
    matched_count: int
    discrepancy_count: int
    total_discrepancy_amount: Decimal
    critical_issues: int
    resolution_rate: Decimal
    avg_processing_time: Optional[float]