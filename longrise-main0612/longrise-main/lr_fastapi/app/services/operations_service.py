"""
Operational data service for frontend screens and smoke tests.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import uuid4

from sqlalchemy import func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin import Admin
from app.models.cms import CMSContent, ContentStatus, ContentType, NewsArticle
from app.models.investment import (
    InvestmentPackage,
    InvestmentStatus,
    PackageStatus,
    UserInvestment,
)
from app.models.p2p import P2PTrade, P2PTradeStatus, P2PTradeType
from app.models.system import FDSAlert, FDSAlertStatus
from app.models.transaction import TokenPrice
from app.models.user import User
from app.models.withdrawal import Withdrawal, WithdrawalStatus
from app.services.managed_asset_service import ManagedAssetService


def _decimal(value: Decimal | None) -> float:
    return float(value or Decimal("0"))


def _dt(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _transaction_direction(tx_type: str) -> str:
    if tx_type in {"deposit", "reward", "commission", "daily_roi", "direct_bonus", "rollup_bonus", "rank_share", "cnyt_airdrop", "promotion"}:
        return "credit"
    return "debit"


def _transaction_item(tx: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(tx["id"]),
        "label": tx["description"],
        "date": _dt(tx["created_at"]),
        "value": float(tx["amount"] or 0) - float(tx["fee"] or 0),
        "amount": float(tx["amount"] or 0),
        "currency": tx["currency"],
        "type": tx["type"],
        "direction": _transaction_direction(tx["type"]),
        "status": tx["status"],
    }


def _investment_item(investment: UserInvestment, package: InvestmentPackage | None) -> dict[str, Any]:
    package_name = package.name if package else "Unknown Package"
    return {
        "id": str(investment.id),
        "name": package_name,
        "packageId": package.package_id if package else None,
        "date": _dt(investment.invested_at),
        "amount": _decimal(investment.principal_amount),
        "status": investment.status.value,
        "returns": _decimal(investment.total_roi_earned),
        "maturityDate": _dt(investment.maturity_date),
        "currentValue": _decimal(investment.current_value),
    }


class OperationsService:
    """Service layer for user/admin operational views."""

    @staticmethod
    async def get_public_packages(session: AsyncSession) -> list[dict[str, Any]]:
        result = await session.execute(
            select(InvestmentPackage)
            .where(InvestmentPackage.status == PackageStatus.ACTIVE)
            .order_by(InvestmentPackage.min_amount.asc())
        )
        packages = result.scalars().all()
        return [
            {
                "id": package.package_id,
                "name": package.name,
                "price": _decimal(package.min_amount),
                "roi": _decimal(package.total_roi_cap) * 100,
                "period": "No Lock-in" if package.type.value == "Flexible" else f"{package.duration_months} Months",
                "dailyRoiRate": _decimal(package.daily_roi_rate) * 100,
                "bonusRate": _decimal(package.rollup_bonus_rate) * 100,
                "featured": package.is_featured,
                "isNew": package.is_new,
                "description": package.description,
                "features": package.features or [],
                "riskLevel": package.risk_level,
            }
            for package in packages
        ]

    @staticmethod
    async def build_user_screen_data(session: AsyncSession, user: User) -> dict[str, Any]:
        package_stmt = (
            select(UserInvestment, InvestmentPackage)
            .join(InvestmentPackage, UserInvestment.package_id == InvestmentPackage.id)
            .where(UserInvestment.user_id == user.id)
            .order_by(UserInvestment.invested_at.desc())
        )
        investments_result = await session.execute(package_stmt)
        investments = investments_result.all()

        tx_result = await session.execute(
            text(
                """
                SELECT id, user_id, type, amount, currency, status, description, hash, fee, created_at, completed_at
                FROM transactions
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT 12
                """
            ),
            {"user_id": user.id},
        )
        transactions = [dict(row._mapping) for row in tx_result.fetchall()]

        withdrawals_result = await session.execute(
            select(Withdrawal)
            .where(Withdrawal.user_id == user.id)
            .order_by(Withdrawal.created_at.desc())
            .limit(6)
        )
        withdrawals = withdrawals_result.scalars().all()

        team_result = await session.execute(
            select(User)
            .where(User.sponsor_id == user.id)
            .order_by(User.created_at.desc())
            .limit(12)
        )
        team_members = team_result.scalars().all()

        order_book_result = await session.execute(
            select(P2PTrade)
            .where(
                P2PTrade.status.in_(
                    [
                        P2PTradeStatus.PENDING,
                        P2PTradeStatus.ACTIVE,
                        P2PTradeStatus.MATCHED,
                    ]
                ),
                P2PTrade.creator_id != user.id,
            )
            .order_by(P2PTrade.created_at.desc())
            .limit(12)
        )
        order_book = order_book_result.scalars().all()

        my_orders_result = await session.execute(
            select(P2PTrade)
            .where(P2PTrade.creator_id == user.id)
            .order_by(P2PTrade.created_at.desc())
            .limit(8)
        )
        my_orders = my_orders_result.scalars().all()

        news_result = await session.execute(
            select(NewsArticle)
            .where(NewsArticle.status == ContentStatus.PUBLISHED)
            .order_by(NewsArticle.published_at.desc(), NewsArticle.created_at.desc())
            .limit(8)
        )
        news_items = news_result.scalars().all()

        faq_result = await session.execute(
            select(CMSContent)
            .where(
                CMSContent.content_type == ContentType.SUPPORT,
                CMSContent.status == ContentStatus.PUBLISHED,
                CMSContent.is_visible.is_(True),
            )
            .order_by(CMSContent.sort_order.asc(), CMSContent.created_at.desc())
            .limit(20)
        )
        faq_items = faq_result.scalars().all()

        token_result = await session.execute(
            select(TokenPrice)
            .where(TokenPrice.is_active.is_(True))
            .order_by(TokenPrice.token_symbol.asc())
        )
        token_prices = token_result.scalars().all()

        active_investments = [item for item in investments if item[0].status == InvestmentStatus.ACTIVE]
        recent_credits = [
            tx
            for tx in transactions
            if _transaction_direction(tx["type"]) == "credit"
            and tx["status"] == "completed"
            and tx["currency"] == "USDT"
        ]
        total_assets = _decimal(user.balance_usdt) + _decimal(user.locked_usdt) + _decimal(user.balance_cnyt)
        total_roi = sum(_decimal(investment.total_roi_earned) for investment, _ in investments)
        pending_withdrawals = [item for item in withdrawals if item.status == WithdrawalStatus.PENDING]

        security_events: list[dict[str, Any]] = []
        if user.last_login_at:
            security_events.append(
                {
                    "event": "Login Session Started",
                    "time": _dt(user.last_login_at),
                    "status": "success",
                    "location": "Known Environment",
                }
            )
        for withdrawal in withdrawals[:3]:
            security_events.append(
                {
                    "event": f"Withdrawal {withdrawal.status.value.title()}",
                    "time": _dt(withdrawal.created_at),
                    "status": withdrawal.status.value,
                    "location": withdrawal.network.value,
                }
            )
        for tx in transactions[:3]:
            security_events.append(
                {
                    "event": tx["description"],
                    "time": _dt(tx["created_at"]),
                    "status": tx["status"],
                    "location": tx["currency"],
                }
            )

        total_team_size = user.team_size or len(team_members)
        referral_code = user.referral_code or user.distributor_code or f"LR-{user.nickname.upper()}"

        return {
            "generatedAt": datetime.utcnow().isoformat(),
            "overview": {
                "totalAssets": total_assets,
                "totalRoi": total_roi,
                "activeInvestments": len(active_investments),
                "pendingWithdrawals": len(pending_withdrawals),
                "teamSize": total_team_size,
                "referralCode": referral_code,
            },
            "wallet": {
                "totalAssets": total_assets,
                "assets": [
                    {"label": "AVAILABLE USDT", "value": _decimal(user.balance_usdt), "unit": "USDT", "tag": "LIQUID"},
                    {"label": "LOCKED USDT", "value": _decimal(user.locked_usdt), "unit": "USDT", "tag": "STAKED"},
                    {"label": "CNYT TOKENS", "value": _decimal(user.balance_cnyt), "unit": "CNYT", "tag": "REWARDS"},
                    {
                        "label": "PACKAGE VALUE",
                        "value": sum(_decimal(investment.principal_amount) for investment, _ in active_investments),
                        "unit": "USDT",
                        "tag": "GROWTH",
                    },
                ],
                "packageHistory": [_investment_item(investment, package) for investment, package in investments[:6]],
                "activities": [_transaction_item(tx) for tx in transactions[:6]],
                "transferHistory": [
                    {
                        "id": str(tx["id"]),
                        "counterparty": tx["hash"] or "Platform",
                        "amount": float(tx["amount"] or 0),
                        "date": _dt(tx["created_at"]),
                        "status": tx["status"],
                        "type": tx["type"],
                    }
                    for tx in transactions
                    if tx["type"] in ["swap", "adjustment"]
                ],
                "withdrawals": [
                    {
                        "id": withdrawal.withdrawal_id,
                        "amount": _decimal(withdrawal.amount),
                        "asset": withdrawal.asset.value,
                        "status": withdrawal.status.value,
                        "network": withdrawal.network.value,
                        "createdAt": _dt(withdrawal.created_at),
                    }
                    for withdrawal in withdrawals
                ],
            },
            "cryptoAI": {
                "metrics": {
                    "daily": float(recent_credits[0]["amount"] or 0) if recent_credits else 0,
                    "cnyt": _decimal(user.balance_cnyt),
                    "roi": round((total_roi / max(_decimal(user.initial_investment), 1)) * 100, 2) if user.initial_investment else 0,
                    "winRate": 92 if investments else 0,
                },
                "logs": [
                    f"{tx['type'].upper()} {tx['currency']} {float(tx['amount'] or 0):.2f} processed"
                    for tx in transactions[:5]
                ],
                "purchasedPackages": [
                    {
                        "type": package.type.value,
                        "investment": _decimal(investment.principal_amount),
                        "purchaseDate": _dt(investment.invested_at),
                        "maturityDate": _dt(investment.maturity_date),
                    }
                    for investment, package in active_investments[:5]
                ],
            },
            "market": {
                "tokens": [
                    {
                        "symbol": token.token_symbol,
                        "priceUsd": _decimal(token.price_usd),
                        "change24hPercent": _decimal(token.change_24h_percent),
                        "volume24h": _decimal(token.volume_24h),
                    }
                    for token in token_prices
                ],
                "cnyt": {
                    "stats": {
                        "indexPrice": next((item["priceUsd"] for item in [
                            {
                                "symbol": token.token_symbol,
                                "priceUsd": _decimal(token.price_usd),
                            }
                            for token in token_prices
                        ] if item["symbol"] == "CNYT"), 0),
                        "activeListings": len(order_book),
                        "myOrders": len(my_orders),
                    },
                    "orderBook": [
                        {
                            "id": trade.trade_id,
                            "type": trade.trade_type.value.upper(),
                            "user": trade.trade_id.split("-")[-1],
                            "amount": _decimal(trade.amount),
                            "price": _decimal(trade.price_per_unit),
                            "total": _decimal(trade.total_value),
                            "status": trade.status.value.upper(),
                            "createdAt": _dt(trade.created_at),
                        }
                        for trade in order_book
                    ],
                    "myOrders": [
                        {
                            "id": trade.trade_id,
                            "type": trade.trade_type.value.upper(),
                            "amount": _decimal(trade.amount),
                            "price": _decimal(trade.price_per_unit),
                            "total": _decimal(trade.total_value),
                            "status": trade.status.value.upper(),
                            "createdAt": _dt(trade.created_at),
                        }
                        for trade in my_orders
                    ],
                },
            },
            "rewards": {
                "summary": {
                    "teamSize": total_team_size,
                    "teamVolume": _decimal(user.team_vol),
                    "bodyValue": _decimal(user.body_value),
                    "totalCommission": _decimal(user.total_commission),
                    "rank": user.rank,
                },
                "teamMembers": [
                    {
                        "nickname": member.nickname,
                        "rank": member.rank,
                        "package": member.package,
                        "joinedAt": _dt(member.created_at),
                        "balanceUSDT": _decimal(member.balance_usdt),
                    }
                    for member in team_members
                ],
            },
            "security": {
                "protectionLayers": [
                    {"id": "otp", "title": "Google OTP (2FA)", "isSecure": bool(user.otp_enabled), "isConfigured": bool(user.otp_secret), "status": "ACTIVE" if user.otp_enabled else "ACTIVATE"},
                    {"id": "email", "title": "Email Verifier", "isSecure": True, "status": "SECURE"},
                    {"id": "trading", "title": "Trading Password", "isSecure": bool(user.has_set_trading_password), "status": "MANAGE"},
                ],
                "events": security_events[:8],
            },
            "support": {
                "faq": [
                    {
                        "id": item.content_key,
                        "q": item.title,
                        "cat": item.subtitle or "support",
                        "a": item.content.get("answer", ""),
                    }
                    for item in faq_items
                ],
            },
            "news": [
                {
                    "id": article.article_id,
                    "category": article.category.value.upper(),
                    "date": _dt(article.published_at or article.created_at),
                    "title": article.title,
                    "desc": article.summary or article.content[:180],
                    "isNew": bool(article.is_pinned or article.is_featured),
                    "priority": article.priority.value,
                }
                for article in news_items
            ],
        }

    @staticmethod
    async def create_investment(
        session: AsyncSession,
        user: User,
        package_code: str,
        amount: Decimal | None = None,
    ) -> dict[str, Any]:
        package_result = await session.execute(
            select(InvestmentPackage).where(
                or_(
                    InvestmentPackage.package_id == package_code.lower(),
                    func.lower(InvestmentPackage.name) == package_code.lower(),
                )
            )
        )
        package = package_result.scalar_one_or_none()
        if not package:
            raise ValueError("Package not found")

        principal = amount or package.min_amount
        if principal < package.min_amount or principal > package.max_amount:
            raise ValueError("Investment amount is outside package limits")
        if ManagedAssetService.get_balance(user, "USDT") < principal:
            raise ValueError("Insufficient USDT balance")

        invested_at = datetime.utcnow()
        maturity_date = invested_at + timedelta(days=package.duration_months * 30)
        investment = UserInvestment(
            investment_id=f"INV-{package.package_id.upper()}-{uuid4().hex[:10].upper()}",
            user_id=user.id,
            package_id=package.id,
            principal_amount=principal,
            currency="USDT",
            invested_at=invested_at,
            maturity_date=maturity_date,
            daily_roi_rate=package.daily_roi_rate,
            current_value=principal,
            status=InvestmentStatus.ACTIVE,
            notes=f"Operational purchase for {package.name}",
        )

        ManagedAssetService.adjust_balance(user, "USDT", -principal)
        user.locked_usdt = user.locked_usdt + principal
        user.package = package.type.value
        user.initial_investment = (user.initial_investment or Decimal("0")) + principal
        user.investment_date = invested_at.date()

        session.add(investment)
        session.add(user)
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=user.id,
            asset="USDT",
            tx_type="adjustment",
            amount=principal,
            status="completed",
            description=f"Managed ledger debit for {package.name} package purchase",
            reference_id=investment.investment_id,
        )
        await session.commit()
        await session.refresh(investment)
        await session.refresh(user)

        return {
            "investmentId": investment.investment_id,
            "package": package.name,
            "amount": _decimal(principal),
            "balanceAfter": _decimal(user.balance_usdt),
            "maturityDate": _dt(investment.maturity_date),
        }

    @staticmethod
    async def create_p2p_order(
        session: AsyncSession,
        user: User,
        *,
        asset: str,
        trade_type: str,
        amount: Decimal,
        price_per_unit: Decimal,
        currency: str,
        payment_method: str | None = None,
    ) -> dict[str, Any]:
        asset_code = asset.upper()
        if trade_type.lower() == "sell" and ManagedAssetService.get_balance(user, asset_code) < amount:
            raise ValueError(f"Insufficient {asset_code} balance")

        trade = P2PTrade(
            trade_id=f"P2P-{uuid4().hex[:12].upper()}",
            creator_id=user.id,
            trade_type=P2PTradeType(trade_type.lower()),
            asset=asset_code,
            amount=amount,
            price_per_unit=price_per_unit,
            total_value=amount * price_per_unit,
            currency=currency.upper(),
            status=P2PTradeStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=3),
            payment_method=payment_method or "BANK_TRANSFER",
            requires_kyc=True,
            requires_phone_verification=True,
            trading_password_verified=user.has_set_trading_password,
            auto_reply_message="Order posted from operational flow",
        )
        session.add(trade)
        await session.commit()
        await session.refresh(trade)
        return {
            "tradeId": trade.trade_id,
            "asset": trade.asset,
            "amount": _decimal(trade.amount),
            "price": _decimal(trade.price_per_unit),
            "status": trade.status.value,
        }

    @staticmethod
    async def cancel_p2p_order(session: AsyncSession, user: User, trade_id: str) -> dict[str, Any]:
        result = await session.execute(
            select(P2PTrade).where(P2PTrade.trade_id == trade_id, P2PTrade.creator_id == user.id)
        )
        trade = result.scalar_one_or_none()
        if not trade:
            raise ValueError("Order not found")
        if trade.status not in [P2PTradeStatus.PENDING, P2PTradeStatus.ACTIVE, P2PTradeStatus.MATCHED]:
            raise ValueError("Order cannot be cancelled in its current state")
        trade.status = P2PTradeStatus.CANCELLED
        session.add(trade)
        await session.commit()
        await session.refresh(trade)
        return {
            "tradeId": trade.trade_id,
            "status": trade.status.value,
        }

    @staticmethod
    async def complete_p2p_order(session: AsyncSession, user: User, trade_id: str) -> dict[str, Any]:
        result = await session.execute(
            select(P2PTrade).where(P2PTrade.trade_id == trade_id, P2PTrade.creator_id == user.id)
        )
        trade = result.scalar_one_or_none()
        if not trade:
            raise ValueError("Order not found")
        if trade.status not in [P2PTradeStatus.ACTIVE, P2PTradeStatus.MATCHED, P2PTradeStatus.IN_PROGRESS]:
            raise ValueError("Order cannot be completed in its current state")
        trade.status = P2PTradeStatus.COMPLETED
        trade.completed_at = datetime.utcnow()
        session.add(trade)
        await session.commit()
        await session.refresh(trade)
        return {
            "tradeId": trade.trade_id,
            "status": trade.status.value,
        }

    @staticmethod
    async def fill_p2p_order(
        session: AsyncSession,
        user: User,
        *,
        trade_id: str,
        amount: Decimal,
    ) -> dict[str, Any]:
        result = await session.execute(select(P2PTrade).where(P2PTrade.trade_id == trade_id))
        trade = result.scalar_one_or_none()
        if not trade:
            raise ValueError("Order not found")
        if trade.creator_id == user.id:
            raise ValueError("You cannot fill your own order")
        if trade.status not in [P2PTradeStatus.PENDING, P2PTradeStatus.ACTIVE, P2PTradeStatus.MATCHED]:
            raise ValueError("Order is not available")
        if amount <= 0 or amount > trade.amount:
            raise ValueError("Requested amount exceeds the order amount")

        seller_result = await session.execute(select(User).where(User.id == trade.creator_id))
        seller = seller_result.scalar_one_or_none()
        if not seller:
            raise ValueError("Seller not found")

        if trade.asset.upper() == "USDT":
            if ManagedAssetService.get_balance(seller, "USDT") < amount:
                raise ValueError("Seller has insufficient balance")
            ManagedAssetService.adjust_balance(seller, "USDT", -amount)
            ManagedAssetService.adjust_balance(user, "USDT", amount)
        elif trade.asset.upper() == "CNYT":
            if ManagedAssetService.get_balance(seller, "CNYT") < amount:
                raise ValueError("Seller has insufficient balance")
            ManagedAssetService.adjust_balance(seller, "CNYT", -amount)
            ManagedAssetService.adjust_balance(user, "CNYT", amount)
        else:
            raise ValueError("Unsupported asset")

        trade.amount -= amount
        trade.total_value = trade.amount * trade.price_per_unit
        trade.counterpart_id = user.id
        trade.status = P2PTradeStatus.COMPLETED if trade.amount == 0 else P2PTradeStatus.MATCHED
        trade.completed_at = datetime.utcnow() if trade.status == P2PTradeStatus.COMPLETED else None
        session.add(seller)
        session.add(user)
        session.add(trade)
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=seller.id,
            asset=trade.asset.upper(),
            tx_type="swap",
            amount=amount,
            status="completed",
            description=f"Managed ledger P2P sale filled by {user.nickname}",
            reference_id=f"{trade.trade_id}-SELLER",
        )
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=user.id,
            asset=trade.asset.upper(),
            tx_type="swap",
            amount=amount,
            status="completed",
            description=f"Managed ledger P2P purchase from order {trade.trade_id}",
            reference_id=f"{trade.trade_id}-BUYER",
        )
        await session.commit()
        await session.refresh(trade)

        return {
            "tradeId": trade.trade_id,
            "filledAmount": _decimal(amount),
            "remainingAmount": _decimal(trade.amount),
            "status": trade.status.value,
        }

    @staticmethod
    async def get_user_investments(session: AsyncSession, user_id) -> list[dict[str, Any]]:
        result = await session.execute(
            select(UserInvestment, InvestmentPackage)
            .join(InvestmentPackage, UserInvestment.package_id == InvestmentPackage.id)
            .where(UserInvestment.user_id == user_id)
            .order_by(UserInvestment.invested_at.desc())
        )
        return [_investment_item(investment, package) for investment, package in result.all()]

    @staticmethod
    async def get_user_transactions(session: AsyncSession, user_id, limit: int = 20) -> list[dict[str, Any]]:
        result = await session.execute(
            text(
                """
                SELECT id, user_id, type, amount, currency, status, description, hash, fee, created_at, completed_at
                FROM transactions
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT :limit
                """
            ),
            {"user_id": user_id, "limit": limit},
        )
        return [_transaction_item(dict(row._mapping)) for row in result.fetchall()]

    @staticmethod
    async def get_news(session: AsyncSession, limit: int = 10) -> list[dict[str, Any]]:
        result = await session.execute(
            select(NewsArticle)
            .where(NewsArticle.status == ContentStatus.PUBLISHED)
            .order_by(NewsArticle.published_at.desc(), NewsArticle.created_at.desc())
            .limit(limit)
        )
        articles = result.scalars().all()
        return [
            {
                "id": article.article_id,
                "category": article.category.value.upper(),
                "date": _dt(article.published_at or article.created_at),
                "title": article.title,
                "desc": article.summary or article.content[:180],
                "isNew": bool(article.is_pinned or article.is_featured),
                "priority": article.priority.value,
            }
            for article in articles
        ]

    @staticmethod
    async def get_support_faq(session: AsyncSession, limit: int = 20) -> list[dict[str, Any]]:
        result = await session.execute(
            select(CMSContent)
            .where(
                CMSContent.content_type == ContentType.SUPPORT,
                CMSContent.status == ContentStatus.PUBLISHED,
                CMSContent.is_visible.is_(True),
            )
            .order_by(CMSContent.sort_order.asc(), CMSContent.created_at.desc())
            .limit(limit)
        )
        items = result.scalars().all()
        return [
            {
                "id": item.content_key,
                "q": item.title,
                "cat": item.subtitle or "support",
                "a": item.content.get("answer", ""),
            }
            for item in items
        ]

    @staticmethod
    async def get_market_snapshot(session: AsyncSession, *, asset: str, user_id=None) -> dict[str, Any]:
        order_book_result = await session.execute(
            select(P2PTrade)
            .where(
                P2PTrade.asset == asset.upper(),
                P2PTrade.status.in_([P2PTradeStatus.PENDING, P2PTradeStatus.ACTIVE, P2PTradeStatus.MATCHED]),
            )
            .order_by(P2PTrade.created_at.desc())
            .limit(20)
        )
        orders = order_book_result.scalars().all()

        my_orders: list[P2PTrade] = []
        if user_id:
            my_orders_result = await session.execute(
                select(P2PTrade)
                .where(P2PTrade.creator_id == user_id, P2PTrade.asset == asset.upper())
                .order_by(P2PTrade.created_at.desc())
                .limit(10)
            )
            my_orders = my_orders_result.scalars().all()

        token_result = await session.execute(
            select(TokenPrice).where(TokenPrice.token_symbol == asset.upper(), TokenPrice.is_active.is_(True))
        )
        token = token_result.scalar_one_or_none()

        def serialize_trade(trade: P2PTrade) -> dict[str, Any]:
            return {
                "id": trade.trade_id,
                "type": trade.trade_type.value.upper(),
                "user": trade.trade_id.split("-")[-1],
                "amount": _decimal(trade.amount),
                "price": _decimal(trade.price_per_unit),
                "total": _decimal(trade.total_value),
                "status": trade.status.value.upper(),
                "createdAt": _dt(trade.created_at),
            }

        return {
            "asset": asset.upper(),
            "stats": {
                "indexPrice": _decimal(token.price_usd) if token else 0,
                "activeListings": len(orders),
                "myOrders": len(my_orders),
            },
            "orderBook": [serialize_trade(trade) for trade in orders],
            "myOrders": [serialize_trade(trade) for trade in my_orders],
        }

    @staticmethod
    async def get_user_dashboard(session: AsyncSession, user: User) -> dict[str, Any]:
        investments = await OperationsService.get_user_investments(session, user.id)
        transactions = await OperationsService.get_user_transactions(session, user.id, limit=12)
        faq = await OperationsService.get_support_faq(session, limit=20)
        news = await OperationsService.get_news(session, limit=8)
        market = await OperationsService.get_market_snapshot(session, asset="CNYT", user_id=user.id)

        withdrawals_result = await session.execute(
            select(Withdrawal)
            .where(Withdrawal.user_id == user.id)
            .order_by(Withdrawal.created_at.desc())
            .limit(6)
        )
        withdrawals = withdrawals_result.scalars().all()

        team_result = await session.execute(
            select(User)
            .where(User.sponsor_id == user.id)
            .order_by(User.created_at.desc())
            .limit(12)
        )
        team_members = team_result.scalars().all()

        total_assets = _decimal(user.balance_usdt) + _decimal(user.locked_usdt) + _decimal(user.balance_cnyt)
        total_roi = sum(item["returns"] for item in investments)
        active_investments = [item for item in investments if item["status"] == "active"]
        recent_credits = [
            tx
            for tx in transactions
            if tx["direction"] == "credit"
            and tx["status"] == "completed"
            and tx["currency"] == "USDT"
        ]

        total_team_size = user.team_size or len(team_members)
        referral_code = user.referral_code or user.distributor_code or f"LR-{user.nickname.upper()}"

        return {
            "overview": {
                "totalAssets": total_assets,
                "totalRoi": total_roi,
                "activeInvestments": len(active_investments),
                "pendingWithdrawals": len([item for item in withdrawals if item.status == WithdrawalStatus.PENDING]),
                "teamSize": total_team_size,
                "referralCode": referral_code,
            },
            "wallet": {
                "totalAssets": total_assets,
                "assets": [
                    {"label": "AVAILABLE USDT", "value": _decimal(user.balance_usdt), "unit": "USDT", "tag": "LIQUID"},
                    {"label": "LOCKED USDT", "value": _decimal(user.locked_usdt), "unit": "USDT", "tag": "STAKED"},
                    {"label": "CNYT TOKENS", "value": _decimal(user.balance_cnyt), "unit": "CNYT", "tag": "REWARDS"},
                    {
                        "label": "PACKAGE VALUE",
                        "value": sum(item["amount"] for item in active_investments),
                        "unit": "USDT",
                        "tag": "GROWTH",
                    },
                ],
                "packageHistory": investments[:6],
                "activities": transactions[:6],
                "transferHistory": [
                    {
                        "id": tx["id"],
                        "counterparty": "Platform",
                        "amount": tx["amount"],
                        "date": tx["date"],
                        "status": tx["status"],
                        "type": tx["type"],
                    }
                    for tx in transactions
                    if tx["type"] in ["swap", "adjustment"]
                ],
                "withdrawals": [
                    {
                        "id": withdrawal.withdrawal_id,
                        "amount": _decimal(withdrawal.amount),
                        "asset": withdrawal.asset.value,
                        "status": withdrawal.status.value,
                        "network": withdrawal.network.value,
                        "createdAt": _dt(withdrawal.created_at),
                    }
                    for withdrawal in withdrawals
                ],
            },
            "cryptoAI": {
                "metrics": {
                    "daily": recent_credits[0]["amount"] if recent_credits else 0,
                    "cnyt": _decimal(user.balance_cnyt),
                    "roi": round((total_roi / max(_decimal(user.initial_investment), 1)) * 100, 2) if user.initial_investment else 0,
                    "winRate": 92 if investments else 0,
                },
                "logs": [
                    f"{tx['type'].upper()} {tx['currency']} {float(tx['amount']):.2f} processed"
                    for tx in transactions[:5]
                ],
                "purchasedPackages": [
                    {
                        "type": item["name"],
                        "investment": item["amount"],
                        "purchaseDate": item["date"],
                        "maturityDate": item["maturityDate"],
                    }
                    for item in active_investments[:5]
                ],
            },
            "rewards": {
                "summary": {
                    "teamSize": total_team_size,
                    "teamVolume": _decimal(user.team_vol),
                    "bodyValue": _decimal(user.body_value),
                    "totalCommission": _decimal(user.total_commission),
                    "rank": user.rank,
                },
                "teamMembers": [
                    {
                        "nickname": member.nickname,
                        "rank": member.rank,
                        "package": member.package,
                        "joinedAt": _dt(member.created_at),
                        "balanceUSDT": _decimal(member.balance_usdt),
                    }
                    for member in team_members
                ],
            },
            "security": {
                "protectionLayers": [
                    {"id": "otp", "title": "Google OTP (2FA)", "isSecure": bool(user.otp_enabled), "isConfigured": bool(user.otp_secret), "status": "ACTIVE" if user.otp_enabled else "ACTIVATE"},
                    {"id": "email", "title": "Email Verifier", "isSecure": True, "status": "SECURE"},
                    {"id": "trading", "title": "Trading Password", "isSecure": bool(user.has_set_trading_password), "status": "MANAGE"},
                ],
                "events": [
                    {
                        "event": "Login Session Started",
                        "time": _dt(user.last_login_at),
                        "status": "success",
                        "location": "Known Environment",
                    }
                ] if user.last_login_at else [],
            },
            "support": {"faq": faq},
            "news": news,
            "market": {"cnyt": market},
        }

    @staticmethod
    async def terminate_investment(session: AsyncSession, user: User, investment_id: str) -> dict[str, Any]:
        result = await session.execute(
            select(UserInvestment, InvestmentPackage)
            .join(InvestmentPackage, UserInvestment.package_id == InvestmentPackage.id)
            .where(UserInvestment.investment_id == investment_id, UserInvestment.user_id == user.id)
        )
        row = result.first()
        if not row:
            raise ValueError("Investment not found")

        investment, package = row
        if investment.status != InvestmentStatus.ACTIVE:
            raise ValueError("Only active investments can be terminated")

        penalty_rate = package.early_termination_penalty or Decimal("0")
        penalty_amount = investment.principal_amount * penalty_rate
        payout = investment.current_value - penalty_amount
        if payout < 0:
            payout = Decimal("0")

        user.locked_usdt = max((user.locked_usdt or Decimal("0")) - investment.principal_amount, Decimal("0"))
        ManagedAssetService.adjust_balance(user, "USDT", payout)
        investment.status = InvestmentStatus.EARLY_TERMINATED
        investment.early_terminated_at = datetime.utcnow()
        investment.termination_reason = "User requested early termination"
        investment.termination_penalty = penalty_amount
        investment.final_payout = payout
        investment.current_value = payout
        session.add(user)
        session.add(investment)
        await ManagedAssetService.record_ledger_entry(
            session,
            user_id=user.id,
            asset="USDT",
            tx_type="adjustment",
            amount=payout,
            status="completed",
            description=f"Managed ledger early termination payout for {package.name}",
            reference_id=investment.investment_id,
            fee=penalty_amount,
        )
        await session.commit()
        return {
            "investmentId": investment.investment_id,
            "status": investment.status.value,
            "penalty": _decimal(penalty_amount),
            "payout": _decimal(payout),
        }

    @staticmethod
    async def get_admin_dashboard(session: AsyncSession) -> dict[str, Any]:
        total_users = await session.scalar(select(func.count(User.id))) or 0
        total_balance = await session.scalar(select(func.coalesce(func.sum(User.balance_usdt), 0))) or Decimal("0")
        total_withdrawals = await session.scalar(select(func.coalesce(func.sum(Withdrawal.amount), 0))) or Decimal("0")
        pending_withdrawals = await session.scalar(
            select(func.count(Withdrawal.id)).where(Withdrawal.status == WithdrawalStatus.PENDING)
        ) or 0
        pending_alerts = await session.scalar(
            select(func.count(FDSAlert.id)).where(FDSAlert.status.in_([FDSAlertStatus.OPEN, FDSAlertStatus.INVESTIGATING]))
        ) or 0

        package_rows = await session.execute(
            select(User.package, func.count(User.id)).group_by(User.package)
        )
        package_distribution = {package: count for package, count in package_rows.all() if package}

        pending_queue_rows = await session.execute(
            select(Withdrawal).where(Withdrawal.status == WithdrawalStatus.PENDING).order_by(Withdrawal.created_at.asc()).limit(10)
        )
        pending_queue = pending_queue_rows.scalars().all()

        recent_investments_rows = await session.execute(
            select(UserInvestment, User, InvestmentPackage)
            .join(User, UserInvestment.user_id == User.id)
            .join(InvestmentPackage, UserInvestment.package_id == InvestmentPackage.id)
            .order_by(UserInvestment.created_at.desc())
            .limit(6)
        )
        recent_investments = recent_investments_rows.all()

        return {
            "revenueData": {
                "totalBalance": _decimal(total_balance),
                "totalWithdrawals": _decimal(total_withdrawals),
            },
            "membersStats": {
                "totalMembers": total_users,
                "byPackage": {
                    "Flexible": package_distribution.get("Flexible", 0),
                    "Basic": package_distribution.get("Basic", 0),
                    "Standard": package_distribution.get("Standard", 0),
                    "Premium": package_distribution.get("Premium", 0),
                    "VIP": package_distribution.get("VIP", 0),
                },
            },
            "pendingCounts": {
                "withdrawals": pending_withdrawals,
                "fds": pending_alerts,
            },
            "pendingTasks": [
                {
                    "id": item.withdrawal_id,
                    "name": item.withdrawal_id,
                    "info": item.asset.value,
                    "msg": f"{_decimal(item.amount)} requested",
                    "time": _dt(item.created_at),
                }
                for item in pending_queue[:5]
            ],
            "actionQueue": [
                {
                    "id": item.withdrawal_id,
                    "type": "출금",
                    "user": item.wallet_address[:10],
                    "amount": f"{_decimal(item.amount):,.2f} {item.asset.value}",
                    "time": _dt(item.created_at),
                }
                for item in pending_queue
            ],
            "recentInvestments": [
                {
                    "user": user.nickname,
                    "package": package.name,
                    "amount": _decimal(investment.principal_amount),
                    "time": _dt(investment.created_at),
                    "status": investment.status.value,
                }
                for investment, user, package in recent_investments
            ],
        }
