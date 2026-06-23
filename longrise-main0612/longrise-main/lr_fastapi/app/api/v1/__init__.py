"""
API v1 router
"""
from fastapi import APIRouter

from app.api.v1 import account, admin, admin_console, audit_logs, auth, content, dashboard, investments, market, support, transactions, users, wallet, withdrawals

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(account.router, prefix="/account", tags=["account"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
api_router.include_router(support.router, prefix="/support", tags=["support"])
api_router.include_router(admin_console.router, prefix="/admin-console", tags=["admin_console"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(withdrawals.router, prefix="/withdrawals", tags=["withdrawals"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit_logs"])
api_router.include_router(investments.router, prefix="/investments", tags=["investments"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
