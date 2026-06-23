"""
System models for Longrise AI Platform
시스템 설정, FDS 알림, 승인 요청 등
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DECIMAL, DateTime, String, Text, JSON, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class SettingCategory(str, Enum):
    """System setting category enumeration"""
    GENERAL = "general"
    SECURITY = "security"
    TRADING = "trading"
    PAYOUT = "payout"
    FDS = "fds"
    NOTIFICATION = "notification"
    MAINTENANCE = "maintenance"


class SettingType(str, Enum):
    """System setting type enumeration"""
    STRING = "string"
    INTEGER = "integer"
    DECIMAL = "decimal"
    BOOLEAN = "boolean"
    JSON = "json"


class SystemSettingBase(SQLModel):
    """Base system setting model"""
    setting_key: str = Field(max_length=100, unique=True, index=True)
    setting_value: str = Field(max_length=2000)  # Store all values as string, parse as needed
    setting_type: SettingType = Field(default=SettingType.STRING)
    category: SettingCategory = Field(default=SettingCategory.GENERAL)

    # Display information
    display_name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    help_text: Optional[str] = Field(default=None, max_length=500)

    # Validation
    validation_rules: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    default_value: Optional[str] = Field(default=None, max_length=2000)

    # Access control
    is_public: bool = Field(default=False)  # Can be read by non-admin users
    is_editable: bool = Field(default=True)
    requires_restart: bool = Field(default=False)
    min_admin_role: str = Field(default="finance", max_length=20)  # minimum role required to edit

    # Status
    is_active: bool = Field(default=True)
    is_deprecated: bool = Field(default=False)

    # Metadata
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    sort_order: int = Field(default=0)

    # Change tracking
    updated_by: UUID = Field(foreign_key="admin_users.id")
    change_reason: Optional[str] = Field(default=None, max_length=500)


class SystemSetting(SystemSettingBase, table=True):
    """System setting table model"""
    __tablename__ = "system_settings"

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


class FDSRuleType(str, Enum):
    """FDS rule type enumeration"""
    AMOUNT_LIMIT = "amount_limit"
    FREQUENCY_LIMIT = "frequency_limit"
    VELOCITY_CHECK = "velocity_check"
    PATTERN_DETECTION = "pattern_detection"
    BLACKLIST_CHECK = "blacklist_check"
    BEHAVIORAL_ANALYSIS = "behavioral_analysis"


class FDSSeverity(str, Enum):
    """FDS alert severity enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FDSAlertStatus(str, Enum):
    """FDS alert status enumeration"""
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"
    ESCALATED = "escalated"


class FDSAlertBase(SQLModel):
    """Base FDS alert model"""
    alert_id: str = Field(max_length=50, unique=True, index=True)
    rule_type: FDSRuleType
    severity: FDSSeverity

    # Target information
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id", index=True)
    target_type: str = Field(max_length=50)  # user, transaction, ip, etc.
    target_id: str = Field(max_length=255, index=True)

    # Alert details
    title: str = Field(max_length=500)
    description: str = Field(max_length=2000)
    risk_score: int = Field(ge=0, le=100)

    # Detection details
    rule_name: str = Field(max_length=200)
    rule_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    triggered_values: Dict[str, Any] = Field(sa_column=Column(JSON))

    # Status and resolution
    status: FDSAlertStatus = Field(default=FDSAlertStatus.OPEN)
    assigned_to: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    resolution: Optional[str] = Field(default=None, max_length=2000)
    resolution_action: Optional[str] = Field(default=None, max_length=200)

    # Timing
    first_detected_at: datetime
    last_detected_at: datetime
    resolved_at: Optional[datetime] = None

    # Escalation
    escalated_at: Optional[datetime] = None
    escalated_to: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")

    # Auto-actions
    auto_actions_taken: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    manual_review_required: bool = Field(default=False)

    # Metadata
    extra_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    external_refs: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))


class FDSAlert(FDSAlertBase, table=True):
    """FDS alert table model"""
    __tablename__ = "fds_alerts"

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


class ApprovalType(str, Enum):
    """Approval request type enumeration"""
    WITHDRAWAL = "withdrawal"
    LARGE_INVESTMENT = "large_investment"
    ACCOUNT_UNFREEZE = "account_unfreeze"
    KYC_OVERRIDE = "kyc_override"
    SYSTEM_SETTING = "system_setting"
    USER_DELETION = "user_deletion"
    BULK_ACTION = "bulk_action"
    EMERGENCY_ACCESS = "emergency_access"
    CUSTOM = "custom"


class ApprovalStatus(str, Enum):
    """Approval status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class ApprovalRequestBase(SQLModel):
    """Base approval request model"""
    request_id: str = Field(max_length=50, unique=True, index=True)
    type: ApprovalType
    status: ApprovalStatus = Field(default=ApprovalStatus.PENDING)

    # Request details
    title: str = Field(max_length=500)
    description: str = Field(max_length=2000)
    justification: Optional[str] = Field(default=None, max_length=1000)

    # Requester information
    requested_by: UUID = Field(foreign_key="admin_users.id", index=True)
    requested_for: Optional[UUID] = Field(default=None, foreign_key="users.id")  # Target user if applicable

    # Approval workflow
    required_approvers: int = Field(default=1, ge=1, le=5)
    current_approvers: int = Field(default=0)
    approver_roles: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    # Target resource
    resource_type: Optional[str] = Field(default=None, max_length=100)
    resource_id: Optional[str] = Field(default=None, max_length=255)

    # Actions to execute
    actions: Dict[str, Any] = Field(sa_column=Column(JSON))  # What to do when approved
    rollback_actions: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Risk assessment
    risk_level: str = Field(default="medium", max_length=20)
    impact_assessment: Optional[str] = Field(default=None, max_length=1000)

    # Timing
    expires_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None

    # Resolution
    final_approver: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    rejection_reason: Optional[str] = Field(default=None, max_length=1000)
    execution_result: Optional[str] = Field(default=None, max_length=2000)

    # Metadata
    extra_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    priority: str = Field(default="normal", max_length=20)  # low, normal, high, urgent


class ApprovalRequest(ApprovalRequestBase, table=True):
    """Approval request table model"""
    __tablename__ = "approval_requests"

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


class ApprovalActionBase(SQLModel):
    """Base approval action model (for tracking individual approvals)"""
    approval_request_id: UUID = Field(foreign_key="approval_requests.id", index=True)
    approver_id: UUID = Field(foreign_key="admin_users.id")

    # Action details
    action: str = Field(max_length=50)  # approve, reject, comment
    comment: Optional[str] = Field(default=None, max_length=1000)

    # Timing
    action_taken_at: datetime = Field(default_factory=datetime.utcnow)

    # Session tracking
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=512)


class ApprovalAction(ApprovalActionBase, table=True):
    """Approval action table model"""
    __tablename__ = "approval_actions"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()")
        )
    )


# API Models
class SystemSettingCreate(SQLModel):
    """System setting creation model"""
    setting_key: str
    setting_value: str
    setting_type: SettingType = SettingType.STRING
    category: SettingCategory = SettingCategory.GENERAL
    display_name: str
    description: Optional[str] = None
    is_public: bool = False


class SystemSettingRead(SystemSettingBase):
    """System setting read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SystemSettingUpdate(SQLModel):
    """System setting update model"""
    setting_value: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    change_reason: Optional[str] = None


class FDSAlertCreate(SQLModel):
    """FDS alert creation model"""
    rule_type: FDSRuleType
    severity: FDSSeverity
    user_id: Optional[UUID] = None
    target_type: str
    target_id: str
    title: str
    description: str
    risk_score: int
    rule_name: str
    rule_config: Dict[str, Any]
    triggered_values: Dict[str, Any]


class FDSAlertRead(FDSAlertBase):
    """FDS alert read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FDSAlertUpdate(SQLModel):
    """FDS alert update model"""
    status: Optional[FDSAlertStatus] = None
    assigned_to: Optional[UUID] = None
    resolution: Optional[str] = None
    resolution_action: Optional[str] = None


class ApprovalRequestCreate(SQLModel):
    """Approval request creation model"""
    type: ApprovalType
    title: str
    description: str
    justification: Optional[str] = None
    requested_for: Optional[UUID] = None
    required_approvers: int = 1
    actions: Dict[str, Any]
    risk_level: str = "medium"
    expires_at: Optional[datetime] = None


class ApprovalRequestRead(ApprovalRequestBase):
    """Approval request read model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApprovalRequestUpdate(SQLModel):
    """Approval request update model"""
    status: Optional[ApprovalStatus] = None
    rejection_reason: Optional[str] = None
    execution_result: Optional[str] = None


class ApprovalActionCreate(SQLModel):
    """Approval action creation model"""
    action: str
    comment: Optional[str] = None