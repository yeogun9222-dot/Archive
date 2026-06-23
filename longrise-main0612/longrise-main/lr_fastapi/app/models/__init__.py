"""
SQLModel models for Longrise AI Platform
"""

# Core models
from .user import User, UserCreate, UserRead, UserUpdate, DragonRank, UserStatus
from .email_verification import EmailVerification
from .admin import Admin, AdminCreate, AdminRead, AdminUpdate, AdminLogin, AdminRole, Token

# Financial models
from .withdrawal import (
    Withdrawal, WithdrawalCreate, WithdrawalRead, WithdrawalUpdate,
    WithdrawalApproval, WithdrawalRejection, WithdrawalStatus, WithdrawalType, Network
)
from .payout import (
    Payout, PayoutCreate, PayoutRead, PayoutUpdate,
    PayoutSettings, PayoutSettingsCreate, PayoutSettingsRead, PayoutSettingsUpdate,
    PayoutType, PayoutStatus
)
from .investment import (
    InvestmentPackage, InvestmentPackageCreate, InvestmentPackageRead, InvestmentPackageUpdate,
    UserInvestment, UserInvestmentCreate, UserInvestmentRead, UserInvestmentUpdate,
    PackageType, PackageStatus, InvestmentStatus
)
from .transaction import (
    Transaction, TransactionCreate, TransactionRead, TransactionUpdate,
    TokenPrice, TokenPriceCreate, TokenPriceRead, TokenPriceUpdate,
    TransactionType, TransactionStatus, TransactionDirection
)

# System and security models
from .audit_log import (
    AuditLog, AuditLogCreate, AuditLogRead,
    SystemEvent, SystemEventCreate, SystemEventRead,
    AuditAction, AuditResource, AuditStatus
)
from .system import (
    SystemSetting, SystemSettingCreate, SystemSettingRead, SystemSettingUpdate,
    FDSAlert, FDSAlertCreate, FDSAlertRead, FDSAlertUpdate,
    ApprovalRequest, ApprovalRequestCreate, ApprovalRequestRead, ApprovalRequestUpdate,
    ApprovalAction, ApprovalActionCreate,
    SettingCategory, SettingType, FDSRuleType, FDSSeverity, FDSAlertStatus,
    ApprovalType, ApprovalStatus
)

# Trading and P2P models
from .p2p import (
    P2PTrade, P2PTradeCreate, P2PTradeRead, P2PTradeUpdate,
    P2PDispute, P2PDisputeCreate, P2PDisputeRead, P2PDisputeUpdate,
    P2PMessage, P2PMessageCreate, P2PMessageRead,
    P2PTradeStatus, P2PTradeType, P2PDisputeStatus, P2PDisputeType
)

# Content management models
from .cms import (
    CMSContent, CMSContentCreate, CMSContentRead, CMSContentUpdate,
    NewsArticle, NewsArticleCreate, NewsArticleRead, NewsArticleUpdate,
    SupportTicket, SupportTicketCreate, SupportTicketRead, SupportTicketUpdate,
    TicketResponse, TicketResponseCreate, TicketResponseRead,
    ContentType, ContentStatus, NewsCategory, NewsPriority
)

# Reconciliation models
from .reconciliation import (
    ReconciliationRecord, ReconciliationRecordCreate, ReconciliationRecordRead, ReconciliationRecordUpdate,
    ReconciliationItem, ReconciliationItemCreate, ReconciliationItemRead, ReconciliationItemUpdate,
    ReconciliationRule, ReconciliationRuleCreate, ReconciliationRuleRead, ReconciliationRuleUpdate,
    ReconciliationType, ReconciliationStatus, ReconciliationItemType, DiscrepancySeverity
)

__all__ = [
    # Core models
    "User", "UserCreate", "UserRead", "UserUpdate", "DragonRank", "UserStatus",
    "EmailVerification",
    "Admin", "AdminCreate", "AdminRead", "AdminUpdate", "AdminLogin", "AdminRole", "Token",

    # Financial models
    "Withdrawal", "WithdrawalCreate", "WithdrawalRead", "WithdrawalUpdate",
    "WithdrawalApproval", "WithdrawalRejection", "WithdrawalStatus", "WithdrawalType", "Network",

    "Payout", "PayoutCreate", "PayoutRead", "PayoutUpdate",
    "PayoutSettings", "PayoutSettingsCreate", "PayoutSettingsRead", "PayoutSettingsUpdate",
    "PayoutType", "PayoutStatus",

    "InvestmentPackage", "InvestmentPackageCreate", "InvestmentPackageRead", "InvestmentPackageUpdate",
    "UserInvestment", "UserInvestmentCreate", "UserInvestmentRead", "UserInvestmentUpdate",
    "PackageType", "PackageStatus", "InvestmentStatus",

    "Transaction", "TransactionCreate", "TransactionRead", "TransactionUpdate",
    "TokenPrice", "TokenPriceCreate", "TokenPriceRead", "TokenPriceUpdate",
    "TransactionType", "TransactionStatus", "TransactionDirection",

    # System and security models
    "AuditLog", "AuditLogCreate", "AuditLogRead",
    "SystemEvent", "SystemEventCreate", "SystemEventRead",
    "AuditAction", "AuditResource", "AuditStatus",

    "SystemSetting", "SystemSettingCreate", "SystemSettingRead", "SystemSettingUpdate",
    "FDSAlert", "FDSAlertCreate", "FDSAlertRead", "FDSAlertUpdate",
    "ApprovalRequest", "ApprovalRequestCreate", "ApprovalRequestRead", "ApprovalRequestUpdate",
    "ApprovalAction", "ApprovalActionCreate",
    "SettingCategory", "SettingType", "FDSRuleType", "FDSSeverity", "FDSAlertStatus",
    "ApprovalType", "ApprovalStatus",

    # Trading and P2P models
    "P2PTrade", "P2PTradeCreate", "P2PTradeRead", "P2PTradeUpdate",
    "P2PDispute", "P2PDisputeCreate", "P2PDisputeRead", "P2PDisputeUpdate",
    "P2PMessage", "P2PMessageCreate", "P2PMessageRead",
    "P2PTradeStatus", "P2PTradeType", "P2PDisputeStatus", "P2PDisputeType",

    # Content management models
    "CMSContent", "CMSContentCreate", "CMSContentRead", "CMSContentUpdate",
    "NewsArticle", "NewsArticleCreate", "NewsArticleRead", "NewsArticleUpdate",
    "SupportTicket", "SupportTicketCreate", "SupportTicketRead", "SupportTicketUpdate",
    "TicketResponse", "TicketResponseCreate", "TicketResponseRead",
    "ContentType", "ContentStatus", "NewsCategory", "NewsPriority",

    # Reconciliation models
    "ReconciliationRecord", "ReconciliationRecordCreate", "ReconciliationRecordRead", "ReconciliationRecordUpdate",
    "ReconciliationItem", "ReconciliationItemCreate", "ReconciliationItemRead", "ReconciliationItemUpdate",
    "ReconciliationRule", "ReconciliationRuleCreate", "ReconciliationRuleRead", "ReconciliationRuleUpdate",
    "ReconciliationType", "ReconciliationStatus", "ReconciliationItemType", "DiscrepancySeverity",
]
