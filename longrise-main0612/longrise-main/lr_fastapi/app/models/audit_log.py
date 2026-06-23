"""
Audit Log models for Longrise AI Platform
"""
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DateTime, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class AuditAction(str, Enum):
    """Audit action enumeration"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    APPROVE = "approve"
    REJECT = "reject"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    CONFIGURE = "configure"
    PROCESS = "process"
    CANCEL = "cancel"
    SUSPEND = "suspend"
    ACTIVATE = "activate"
    DEACTIVATE = "deactivate"
    RESET = "reset"


class AuditResource(str, Enum):
    """Audit resource enumeration"""
    USER = "user"
    ADMIN = "admin"
    WITHDRAWAL = "withdrawal"
    PAYOUT = "payout"
    TRANSACTION = "transaction"
    SETTINGS = "settings"
    CMS = "cms"
    NEWS = "news"
    SUPPORT_TICKET = "support_ticket"
    P2P_TRADE = "p2p_trade"
    P2P_DISPUTE = "p2p_dispute"
    PACKAGE = "package"
    TOKEN = "token"
    SYSTEM = "system"
    REPORT = "report"
    EXPORT = "export"
    BACKUP = "backup"


class AuditStatus(str, Enum):
    """Audit status enumeration"""
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"
    PENDING = "pending"


class AuditLogBase(SQLModel):
    """Base audit log model"""
    # Admin information
    admin_id: Optional[UUID] = Field(default=None, foreign_key="admin_users.id", index=True)
    admin_name: Optional[str] = Field(default=None, max_length=100)
    admin_email: Optional[str] = Field(default=None, max_length=255)

    # Action information
    action: AuditAction
    resource: AuditResource
    resource_id: Optional[str] = Field(default=None, max_length=255, index=True)
    resource_name: Optional[str] = Field(default=None, max_length=255)

    # Status and result
    status: AuditStatus
    error_message: Optional[str] = Field(default=None, max_length=1000)

    # Request information
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=512)
    request_method: Optional[str] = Field(default=None, max_length=10)
    request_path: Optional[str] = Field(default=None, max_length=512)

    # Data changes
    old_values: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    new_values: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    changes: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Additional context
    description: Optional[str] = Field(default=None, max_length=1000)
    extra_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Session information
    session_id: Optional[str] = Field(default=None, max_length=255)
    request_id: Optional[str] = Field(default=None, max_length=255)

    # Risk and compliance
    risk_level: Optional[str] = Field(default="low", max_length=20)  # low, medium, high, critical
    compliance_flags: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    requires_review: bool = Field(default=False)

    # Performance metrics
    response_time_ms: Optional[int] = None
    affected_records: Optional[int] = None


class AuditLog(AuditLogBase, table=True):
    """Audit log table model"""
    __tablename__ = "audit_logs"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()")
        )
    )

    # Timestamp
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    )

    # Archive management
    archived: bool = Field(default=False, index=True)
    archive_date: Optional[datetime] = None


class SystemEventBase(SQLModel):
    """Base system event model for automated system events"""
    event_type: str = Field(max_length=100, index=True)
    event_source: str = Field(max_length=100)  # e.g., "payout_engine", "scheduler", "monitor"

    # Event data
    event_data: Dict[str, Any] = Field(sa_column=Column(JSON))

    # Status
    status: str = Field(default="completed", max_length=50)
    error_details: Optional[str] = Field(default=None, max_length=2000)

    # Performance
    duration_ms: Optional[int] = None
    memory_usage_mb: Optional[float] = None


class SystemEvent(SystemEventBase, table=True):
    """System event table model"""
    __tablename__ = "system_events"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            primary_key=True,
            server_default=text("uuid_generate_v4()")
        )
    )

    # Timestamp
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    )


# API Models
class AuditLogCreate(SQLModel):
    """Audit log creation model"""
    action: AuditAction
    resource: AuditResource
    resource_id: Optional[str] = None
    resource_name: Optional[str] = None
    status: AuditStatus = AuditStatus.SUCCESS
    error_message: Optional[str] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    risk_level: Optional[str] = "low"
    requires_review: bool = False


class AuditLogRead(AuditLogBase):
    """Audit log read model (for API responses)"""
    id: UUID
    timestamp: datetime
    archived: bool

    class Config:
        from_attributes = True


class AuditLogFilter(SQLModel):
    """Audit log filter model"""
    admin_id: Optional[UUID] = None
    action: Optional[AuditAction] = None
    resource: Optional[AuditResource] = None
    status: Optional[AuditStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    ip_address: Optional[str] = None
    risk_level: Optional[str] = None
    requires_review: Optional[bool] = None


class AuditLogSummary(SQLModel):
    """Audit log summary model"""
    total_logs: int
    by_action: Dict[str, int]
    by_resource: Dict[str, int]
    by_status: Dict[str, int]
    by_admin: Dict[str, int]
    recent_activity: list[Dict[str, Any]]
    high_risk_events: int
    pending_reviews: int


class SystemEventCreate(SQLModel):
    """System event creation model"""
    event_type: str
    event_source: str
    event_data: Dict[str, Any]
    status: str = "completed"
    error_details: Optional[str] = None
    duration_ms: Optional[int] = None


class SystemEventRead(SystemEventBase):
    """System event read model"""
    id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True