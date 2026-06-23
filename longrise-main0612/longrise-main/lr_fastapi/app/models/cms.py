"""
CMS (Content Management System) models for Longrise AI Platform
"""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Column, Field, SQLModel, text
from sqlalchemy import DateTime, String, Text, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID


class ContentType(str, Enum):
    """Content type enumeration"""
    HERO_SECTION = "hero_section"
    FEATURES = "features"
    WHY_US = "why_us"
    CRYPTO_AI = "crypto_ai"
    FAQ = "faq"
    FOOTER = "footer"
    WALL_OF_FAME = "wall_of_fame"
    TEAM_REWARDS = "team_rewards"
    TREE_MANAGEMENT = "tree_management"
    RANKS = "ranks"
    NEWS = "news"
    SUPPORT = "support"
    AUTH_POLICY = "auth_policy"
    SECURITY = "security"
    LANDING = "landing"
    CUSTOM = "custom"


class ContentStatus(str, Enum):
    """Content status enumeration"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    SCHEDULED = "scheduled"


class NewsCategory(str, Enum):
    """News category enumeration"""
    GENERAL = "general"
    UPDATES = "updates"
    ANNOUNCEMENTS = "announcements"
    MAINTENANCE = "maintenance"
    PROMOTIONS = "promotions"
    TECHNICAL = "technical"
    REGULATORY = "regulatory"


class NewsPriority(str, Enum):
    """News priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class CMSContentBase(SQLModel):
    """Base CMS content model"""
    content_key: str = Field(max_length=100, unique=True, index=True)
    content_type: ContentType

    # Content information
    title: str = Field(max_length=500)
    subtitle: Optional[str] = Field(default=None, max_length=1000)
    content: Dict[str, Any] = Field(sa_column=Column(JSON))  # Flexible JSON content

    # Status and visibility
    status: ContentStatus = Field(default=ContentStatus.DRAFT)
    is_visible: bool = Field(default=True)

    # SEO and metadata
    meta_title: Optional[str] = Field(default=None, max_length=200)
    meta_description: Optional[str] = Field(default=None, max_length=500)
    meta_keywords: Optional[str] = Field(default=None, max_length=500)

    # Scheduling
    published_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    # Organization
    sort_order: int = Field(default=0)
    parent_id: Optional[UUID] = Field(default=None, foreign_key="cms_contents.id")

    # Localization
    language: str = Field(default="ko", max_length=10)

    # Version control
    version: int = Field(default=1)
    is_current_version: bool = Field(default=True)

    # Content settings
    allow_comments: bool = Field(default=False)
    featured: bool = Field(default=False)

    # Admin information
    created_by: UUID = Field(foreign_key="admin_users.id")
    updated_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")

    # Cache settings
    cache_duration_minutes: int = Field(default=60)
    last_cached_at: Optional[datetime] = None


class CMSContent(CMSContentBase, table=True):
    """CMS content table model"""
    __tablename__ = "cms_contents"

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


class NewsArticleBase(SQLModel):
    """Base news article model"""
    article_id: str = Field(max_length=50, unique=True, index=True)

    # Content
    title: str = Field(max_length=500)
    summary: Optional[str] = Field(default=None, max_length=1000)
    content: str = Field(sa_column=Column(Text))
    featured_image: Optional[str] = Field(default=None, max_length=500)

    # Classification
    category: NewsCategory = Field(default=NewsCategory.GENERAL)
    priority: NewsPriority = Field(default=NewsPriority.MEDIUM)
    tags: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))

    # Status
    status: ContentStatus = Field(default=ContentStatus.DRAFT)
    is_featured: bool = Field(default=False)
    is_pinned: bool = Field(default=False)

    # Publishing
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    # Engagement
    view_count: int = Field(default=0)
    like_count: int = Field(default=0)
    comment_count: int = Field(default=0)

    # Targeting
    target_audience: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    show_to_ranks: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))

    # Admin information
    author_id: UUID = Field(foreign_key="admin_users.id")
    updated_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")

    # SEO
    slug: Optional[str] = Field(default=None, max_length=200, unique=True, index=True)
    meta_title: Optional[str] = Field(default=None, max_length=200)
    meta_description: Optional[str] = Field(default=None, max_length=500)


class NewsArticle(NewsArticleBase, table=True):
    """News article table model"""
    __tablename__ = "news_articles"

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


class SupportTicketBase(SQLModel):
    """Base support ticket model"""
    ticket_id: str = Field(max_length=50, unique=True, index=True)

    # User information
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id", index=True)
    user_email: Optional[str] = Field(default=None, max_length=255)
    user_name: Optional[str] = Field(default=None, max_length=100)

    # Ticket information
    title: str = Field(max_length=500)
    description: str = Field(sa_column=Column(Text))
    category: str = Field(max_length=100)  # FINANCE, TECHNICAL, GENERAL, etc.
    priority: str = Field(default="medium", max_length=20)

    # Status and assignment
    status: str = Field(default="PENDING", max_length=50)
    assigned_to: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")
    assigned_at: Optional[datetime] = None

    # Resolution
    resolution: Optional[str] = Field(default=None, sa_column=Column(Text))
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")

    # Timing and SLA
    first_response_at: Optional[datetime] = None
    last_response_at: Optional[datetime] = None
    response_time_minutes: Optional[int] = None
    resolution_time_minutes: Optional[int] = None

    # Feedback
    satisfaction_rating: Optional[int] = Field(default=None, ge=1, le=5)
    feedback: Optional[str] = Field(default=None, max_length=1000)

    # Escalation
    escalated: bool = Field(default=False)
    escalated_at: Optional[datetime] = None
    escalated_to: Optional[UUID] = Field(default=None, foreign_key="admin_users.id")

    # Metadata
    source: str = Field(default="web", max_length=50)  # web, email, phone, chat
    tags: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    attachments: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))

    # Communication
    total_responses: int = Field(default=0)
    last_response_by: Optional[str] = Field(default=None, max_length=20)  # user, admin, system


class SupportTicket(SupportTicketBase, table=True):
    """Support ticket table model"""
    __tablename__ = "support_tickets"

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


class TicketResponseBase(SQLModel):
    """Base ticket response model"""
    ticket_id: UUID = Field(foreign_key="support_tickets.id", index=True)

    # Response information
    responder_id: Optional[UUID] = Field(default=None)  # user_id or admin_id
    responder_type: str = Field(max_length=20)  # user, admin, system
    message: str = Field(sa_column=Column(Text))

    # Message metadata
    is_internal: bool = Field(default=False)  # Internal admin note
    is_automated: bool = Field(default=False)

    # Attachments
    attachments: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))

    # Status changes
    status_change: Optional[str] = Field(default=None, max_length=100)  # e.g., "PENDING -> IN_PROGRESS"

    # Timing
    response_time_minutes: Optional[int] = None


class TicketResponse(TicketResponseBase, table=True):
    """Ticket response table model"""
    __tablename__ = "ticket_responses"

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
class CMSContentCreate(SQLModel):
    """CMS content creation model"""
    content_key: str
    content_type: ContentType
    title: str
    subtitle: Optional[str] = None
    content: Dict[str, Any]
    status: ContentStatus = ContentStatus.DRAFT
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    sort_order: int = 0
    language: str = "ko"


class CMSContentRead(CMSContentBase):
    """CMS content read model (for API responses)"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CMSContentUpdate(SQLModel):
    """CMS content update model"""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    status: Optional[ContentStatus] = None
    is_visible: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    sort_order: Optional[int] = None


class NewsArticleCreate(SQLModel):
    """News article creation model"""
    title: str
    summary: Optional[str] = None
    content: str
    category: NewsCategory = NewsCategory.GENERAL
    priority: NewsPriority = NewsPriority.MEDIUM
    tags: Optional[list[str]] = None
    status: ContentStatus = ContentStatus.DRAFT
    is_featured: bool = False
    published_at: Optional[datetime] = None


class NewsArticleRead(NewsArticleBase):
    """News article read model (for API responses)"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NewsArticleUpdate(SQLModel):
    """News article update model"""
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[NewsCategory] = None
    priority: Optional[NewsPriority] = None
    tags: Optional[list[str]] = None
    status: Optional[ContentStatus] = None
    is_featured: Optional[bool] = None


class SupportTicketCreate(SQLModel):
    """Support ticket creation model"""
    title: str
    description: str
    category: str
    priority: str = "medium"
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    source: str = "web"
    tags: Optional[list[str]] = None


class SupportTicketRead(SupportTicketBase):
    """Support ticket read model (for API responses)"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SupportTicketUpdate(SQLModel):
    """Support ticket update model"""
    status: Optional[str] = None
    assigned_to: Optional[UUID] = None
    priority: Optional[str] = None
    resolution: Optional[str] = None
    tags: Optional[list[str]] = None


class TicketResponseCreate(SQLModel):
    """Ticket response creation model"""
    message: str
    is_internal: bool = False
    attachments: Optional[list[str]] = None
    status_change: Optional[str] = None


class TicketResponseRead(TicketResponseBase):
    """Ticket response read model (for API responses)"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True