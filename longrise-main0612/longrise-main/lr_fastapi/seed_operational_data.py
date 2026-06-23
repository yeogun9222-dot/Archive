"""
V8.9 Rev.2 operational verification seed data.

The seed is intentionally idempotent: reruns update users/packages and replace
only generated V8.9 verification rows whose identifiers use the ``V89-`` prefix.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_maker, create_db_and_tables
from app.core.security import get_password_hash
from app.models.admin import Admin, AdminRole
from app.models.cms import CMSContent, ContentStatus, ContentType, NewsArticle, NewsCategory
from app.models.investment import (
    InvestmentPackage,
    InvestmentStatus,
    PackageStatus,
    PackageType,
    UserInvestment,
)
from app.models.p2p import P2PTrade, P2PTradeStatus, P2PTradeType
from app.models.transaction import TokenPrice
from app.models.user import DragonRank, KYCStatus, User, UserStatus
from app.models.withdrawal import Network, Withdrawal, WithdrawalStatus, WithdrawalType
from app.services.admin_console_service import AdminConsoleService


END_DATE = date(2026, 6, 5)
LOGIN_PASSWORD = "Longrise!2026"
OPERATIONS_TRADING_PASSWORD = "0000"
SMOKE_TRADING_PASSWORD = "0000"
CNYT_PRICE = Decimal("0.02")

PACKAGE_POLICY = {
    "Flexible": {"amount": Decimal("100"), "months": 1, "monthly": Decimal("4"), "cnyt_rate": Decimal("0")},
    "Basic": {"amount": Decimal("200"), "months": 12, "monthly": Decimal("14"), "cnyt_rate": Decimal("0.02")},
    "Standard": {"amount": Decimal("500"), "months": 12, "monthly": Decimal("45"), "cnyt_rate": Decimal("0.04")},
    "Premium": {"amount": Decimal("1000"), "months": 12, "monthly": Decimal("110"), "cnyt_rate": Decimal("0.06")},
    "VIP": {"amount": Decimal("5000"), "months": 12, "monthly": Decimal("900"), "cnyt_rate": Decimal("0.10")},
}


@dataclass(frozen=True)
class SeedUser:
    nickname: str
    email: str
    join_date: date
    package: str
    rank: DragonRank
    balance_usdt: Decimal
    locked_usdt: Decimal
    balance_cnyt: Decimal
    team_size: int
    team_vol: Decimal
    referral_code: str
    referred_by_code: str | None = None
    sponsor_nickname: str | None = None
    initial_investment: Decimal = Decimal("1000")


PRIMARY_USERS = [
    SeedUser("Kim_Dragon88", "kim88@gmail.com", date(2025, 3, 23), "Premium", DragonRank.BLUE_DRAGON, Decimal("3139"), Decimal("1000"), Decimal("104927"), 45, Decimal("28500"), "DRAGON88"),
    SeedUser("Lee_Profit99", "lee99@gmail.com", date(2025, 3, 25), "Premium", DragonRank.BLUE_DRAGON, Decimal("2680"), Decimal("1000"), Decimal("104732"), 3, Decimal("1500"), "PROFIT99", "DRAGON88", "Kim_Dragon88"),
    SeedUser("Park_Alpha77", "park77@gmail.com", date(2025, 3, 26), "Premium", DragonRank.BLUE_DRAGON, Decimal("2540"), Decimal("1000"), Decimal("104653"), 3, Decimal("1500"), "ALPHA770", "DRAGON88", "Kim_Dragon88"),
    SeedUser("Choi_Rise12", "choi12@gmail.com", date(2025, 2, 18), "Premium", DragonRank.WHITE_DRAGON, Decimal("1564"), Decimal("1000"), Decimal("129431"), 17, Decimal("4200"), "RISE1200"),
    SeedUser("Han_Node34", "han34@gmail.com", date(2025, 2, 22), "Premium", DragonRank.WHITE_DRAGON, Decimal("1549"), Decimal("1000"), Decimal("129167"), 12, Decimal("3000"), "NODE3400"),
    SeedUser("Jung_Bull56", "jung56@gmail.com", date(2025, 2, 26), "Premium", DragonRank.WHITE_DRAGON, Decimal("1481"), Decimal("1000"), Decimal("129068"), 8, Decimal("2000"), "BULL5600"),
    SeedUser("Yoon_Gold78", "yoon78@gmail.com", date(2025, 3, 2), "Premium", DragonRank.WHITE_DRAGON, Decimal("1462"), Decimal("1000"), Decimal("129299"), 6, Decimal("1500"), "GOLD7800"),
    SeedUser("Song_Wave90", "song90@gmail.com", date(2025, 3, 7), "Premium", DragonRank.WHITE_DRAGON, Decimal("1445"), Decimal("1000"), Decimal("129233"), 5, Decimal("1250"), "WAVE9000"),
    SeedUser("Lim_Eagle23", "lim23@gmail.com", date(2025, 3, 12), "Premium", DragonRank.WHITE_DRAGON, Decimal("1426"), Decimal("1000"), Decimal("128969"), 4, Decimal("900"), "EAGLE230"),
    SeedUser("Ko_Titan45", "ko45@gmail.com", date(2025, 3, 17), "Premium", DragonRank.WHITE_DRAGON, Decimal("1407"), Decimal("1000"), Decimal("128847"), 3, Decimal("600"), "TITAN450"),
]


KIM_TREE_BASE = [
    ("Kim_Dragon88", None, 0, 0, "Blue Dragon", "Premium", Decimal("1000"), Decimal("28500"), date(2025, 3, 23)),
    ("CN_Wei_Dragon", "Kim_Dragon88", 1, 1, "Purple Dragon", "VIP", Decimal("5000"), Decimal("28000"), date(2025, 3, 23)),
    ("KR_Choi_Star", "Kim_Dragon88", 1, 2, "White Dragon", "Premium", Decimal("3000"), Decimal("3000"), date(2025, 3, 23)),
    ("VN_Nguyen_Pro", "Kim_Dragon88", 1, 3, "White Dragon", "Basic", Decimal("200"), Decimal("600"), date(2025, 3, 23)),
    ("CN_Liu_Rise", "Kim_Dragon88", 1, 4, "White Dragon", "Basic", Decimal("200"), Decimal("400"), date(2025, 3, 23)),
    ("Lee_Profit99", "Kim_Dragon88", 1, 5, "Blue Dragon", "Premium", Decimal("1000"), Decimal("1500"), date(2025, 3, 25)),
    ("Park_Alpha77", "Kim_Dragon88", 1, 6, "Blue Dragon", "Premium", Decimal("1000"), Decimal("1500"), date(2025, 3, 26)),
    ("CN_Wang_Golden", "CN_Wei_Dragon", 2, 11, "Blue Dragon", "VIP", Decimal("5000"), Decimal("18000"), date(2025, 7, 10)),
    ("CN_Li_Bull", "CN_Wei_Dragon", 2, 12, "Blue Dragon", "VIP", Decimal("5000"), Decimal("15000"), date(2025, 8, 7)),
    ("CN_Zhao_Star", "CN_Wei_Dragon", 2, 13, "Blue Dragon", "Premium", Decimal("2000"), Decimal("12000"), date(2025, 9, 3)),
    ("CN_Feng_Rise", "CN_Wei_Dragon", 2, 14, "White Dragon", "Premium", Decimal("1000"), Decimal("1500"), date(2026, 1, 15)),
    ("CN_Tang_Gold", "CN_Wei_Dragon", 2, 15, "White Dragon", "Premium", Decimal("1000"), Decimal("1000"), date(2026, 2, 11)),
]


def _rank(value: str) -> DragonRank:
    return DragonRank(value) if value in DragonRank._value2member_map_ else DragonRank.INVESTOR


def _email_for(nickname: str) -> str:
    return f"{nickname.lower().replace('_', '.')}@ops.longrise.ai"


def _code_for(nickname: str, suffix: int = 0) -> str:
    raw = "".join(ch for ch in nickname.upper() if ch.isalnum())
    if suffix:
        return f"{(raw or 'LRREF')[:5]}{suffix % 1000:03d}"
    code = (raw + f"{suffix:08d}")[:8]
    return code.ljust(8, "0")


def build_tree_nodes() -> list[tuple[str, str | None, int, int, str, str, Decimal, Decimal, date]]:
    nodes = list(KIM_TREE_BASE)
    line = 20
    blue_parents = [
        ("CN_Wang_Golden", 8),
        ("CN_Li_Bull", 7),
        ("CN_Zhao_Star", 5),
        ("CN_Feng_Rise", 2),
        ("CN_Tang_Gold", 1),
    ]
    for parent, count in blue_parents:
        for i in range(1, count + 1):
            nodes.append((f"{parent}_L3_{i:02d}", parent, 3, line, "White Dragon", "Standard", Decimal("500"), Decimal("500"), date(2025, 9, 1) + timedelta(days=line)))
            line += 1
    secondary = [
        ("KR_Choi_Star", 2),
        ("VN_Nguyen_Pro", 2),
        ("CN_Liu_Rise", 1),
        ("Lee_Profit99", 3),
        ("Park_Alpha77", 3),
    ]
    for parent, count in secondary:
        for i in range(1, count + 1):
            nodes.append((f"{parent}_L2_{i:02d}", parent, 2, line, "White Dragon", "Standard", Decimal("500"), Decimal("500"), date(2025, 4, 10) + timedelta(days=line)))
            line += 1
    while len(nodes) < 46:
        parent = "CN_Wei_Dragon" if len(nodes) % 2 else "CN_Wang_Golden"
        nodes.append((f"Kim_Auto_L3_{len(nodes):02d}", parent, 3, line, "Investor", "Flexible", Decimal("100"), Decimal("100"), date(2026, 1, 1) + timedelta(days=len(nodes))))
        line += 1
    return nodes


def build_independent_nodes() -> list[SeedUser]:
    nodes: list[SeedUser] = []
    sponsors = [user.nickname for user in PRIMARY_USERS[3:]]
    for idx in range(1, 56):
        sponsor = sponsors[(idx - 1) % len(sponsors)]
        rank = DragonRank.WHITE_DRAGON if idx % 8 == 0 else DragonRank.INVESTOR
        package = "Standard" if idx % 3 else "Basic"
        amount = PACKAGE_POLICY[package]["amount"]
        nodes.append(
            SeedUser(
                nickname=f"Ops_Node_{idx:03d}",
                email=f"ops.node.{idx:03d}@longrise.ai",
                join_date=date(2025, 4, 1) + timedelta(days=idx),
                package=package,
                rank=rank,
                balance_usdt=Decimal("80") + Decimal(idx),
                locked_usdt=amount if package != "Flexible" else Decimal("0"),
                balance_cnyt=(amount / CNYT_PRICE).quantize(Decimal("1")),
                team_size=0,
                team_vol=amount,
                referral_code=_code_for(f"NODE{idx:03d}"),
                sponsor_nickname=sponsor,
            )
        )
    return nodes


async def ensure_operational_schema(session: AsyncSession) -> None:
    await session.execute(
        text(
            """
            ALTER TABLE users
                ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8),
                ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(8)
            """
        )
    )
    await session.execute(
        text(
            """
            WITH normalized_users AS (
                SELECT
                    id,
                    UPPER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 8)) AS generated_code
                FROM users
                WHERE referral_code IS NULL
                   OR referral_code !~ '^[A-Z0-9]{8}$'
            )
            UPDATE users
            SET referral_code = normalized_users.generated_code
            FROM normalized_users
            WHERE users.id = normalized_users.id
            """
        )
    )
    await session.execute(
        text(
            """
            UPDATE users AS child
            SET referred_by_code = sponsor.referral_code
            FROM users AS sponsor
            WHERE child.sponsor_id = sponsor.id
              AND (
                  child.referred_by_code IS NULL
                  OR child.referred_by_code !~ '^[A-Z0-9]{8}$'
              )
            """
        )
    )
    await session.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code_unique ON users(referral_code) WHERE referral_code IS NOT NULL"))
    await session.execute(text("ALTER TABLE users ALTER COLUMN referral_code SET NOT NULL"))
    await session.execute(text("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_referral_code_format_check"))
    await session.execute(text("ALTER TABLE users ADD CONSTRAINT users_referral_code_format_check CHECK (referral_code ~ '^[A-Z0-9]{8}$')"))
    await session.execute(text("CREATE INDEX IF NOT EXISTS idx_users_referred_by_code ON users(referred_by_code)"))
    await session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS daily_returns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                return_date DATE NOT NULL,
                package_type VARCHAR(20) NOT NULL,
                pool_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
                betting_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
                futures_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
                displayed_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
                usdt_earned DECIMAL(18, 8) NOT NULL DEFAULT 0,
                cnyt_earned DECIMAL(18, 8) NOT NULL DEFAULT 0,
                day_type VARCHAR(20) NOT NULL,
                proof_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, return_date, package_type)
            )
            """
        )
    )
    await session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS referral_tree (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                root_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                sponsor_id UUID REFERENCES users(id),
                level_from_root INTEGER NOT NULL DEFAULT 0,
                line_number INTEGER NOT NULL DEFAULT 0,
                rank VARCHAR(30) NOT NULL DEFAULT 'Investor',
                package_type VARCHAR(20) NOT NULL DEFAULT 'Flexible',
                investment_amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
                team_sales DECIMAL(18, 8) NOT NULL DEFAULT 0,
                join_date DATE NOT NULL,
                proof_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (root_user_id, user_id)
            )
            """
        )
    )
    await session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS usdt_transfers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                direction VARCHAR(20) NOT NULL,
                counterpart_nickname VARCHAR(80) NOT NULL,
                counterpart_country VARCHAR(40) NOT NULL,
                amount DECIMAL(18, 8) NOT NULL,
                transfer_date DATE NOT NULL,
                proof_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )
    await session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS locked_wallet (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                locked_principal DECIMAL(18, 8) NOT NULL DEFAULT 0,
                locked_bonus DECIMAL(18, 8) NOT NULL DEFAULT 0,
                package_ref VARCHAR(80) NOT NULL,
                lock_start DATE NOT NULL,
                lock_until DATE NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
                proof_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, package_ref)
            )
            """
        )
    )
    await session.commit()


async def get_or_create_admin(session: AsyncSession) -> Admin:
    result = await session.execute(select(Admin).where(Admin.username == "super_ops"))
    admin = result.scalar_one_or_none()
    if not admin:
        admin = Admin(
            username="super_ops",
            email="super.ops@longrise.ai",
            name="Super Operations",
            role=AdminRole.SUPER,
            permissions=["*"],
            password_hash=get_password_hash("LongriseAdmin!2026"),
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
    return admin


async def ensure_packages(session: AsyncSession, admin_id: UUID) -> dict[str, InvestmentPackage]:
    packages: dict[str, InvestmentPackage] = {}
    for package_id, policy in PACKAGE_POLICY.items():
        result = await session.execute(select(InvestmentPackage).where(InvestmentPackage.package_id == package_id.lower()))
        package = result.scalar_one_or_none()
        amount = policy["amount"]
        if not package:
            package = InvestmentPackage(
                package_id=package_id.lower(),
                name=f"{package_id} Package",
                type=PackageType(package_id),
                min_amount=amount,
                max_amount=amount if package_id != "Flexible" else Decimal("499"),
                duration_months=policy["months"],
                daily_roi_rate=(policy["monthly"] / policy["amount"] / Decimal("30")).quantize(Decimal("0.0001")),
                total_roi_cap=(policy["monthly"] * Decimal("12") / policy["amount"]).quantize(Decimal("0.01")),
                direct_bonus_rate=Decimal("0.10"),
                rollup_bonus_rate=Decimal("0.10"),
                early_termination_allowed=package_id != "Flexible",
                early_termination_penalty=Decimal("0.15"),
                min_hold_days=0 if package_id == "Flexible" else 30,
                status=PackageStatus.ACTIVE,
                is_featured=package_id in {"Premium", "VIP"},
                is_new=False,
                description=f"V8.9 {package_id} policy: monthly USDT {policy['monthly']}, CNYT ratio {policy['cnyt_rate']}.",
                features=["V8.9 operational policy", "Managed internal ledger", "CNYT verification data"],
                risk_level="medium",
                created_by=admin_id,
            )
        else:
            package.name = package_id
            package.type = PackageType(package_id)
            package.min_amount = amount
            package.max_amount = amount if package_id != "Flexible" else Decimal("499")
            package.duration_months = policy["months"]
            package.daily_roi_rate = (policy["monthly"] / policy["amount"] / Decimal("30")).quantize(Decimal("0.0001"))
            package.total_roi_cap = (policy["monthly"] * Decimal("12") / policy["amount"]).quantize(Decimal("0.01"))
            package.direct_bonus_rate = Decimal("0.10")
            package.rollup_bonus_rate = Decimal("0.10")
            package.early_termination_allowed = package_id != "Flexible"
            package.early_termination_penalty = Decimal("0.15")
            package.min_hold_days = 0 if package_id == "Flexible" else 30
            package.status = PackageStatus.ACTIVE
            package.is_featured = package_id in {"Premium", "VIP"}
            package.is_new = False
            package.description = f"V8.9 {package_id} policy: monthly USDT {policy['monthly']}, CNYT ratio {policy['cnyt_rate']}."
            package.features = ["V8.9 operational policy", "Managed internal ledger", "CNYT verification data"]
            package.risk_level = "medium"
            package.updated_by = admin_id
        session.add(package)
        await session.commit()
        await session.refresh(package)
        packages[package_id] = package
    return packages


async def upsert_user(session: AsyncSession, seed: SeedUser, sponsor_id: UUID | None = None) -> User:
    result = await session.execute(select(User).where(User.email == seed.email))
    user = result.scalar_one_or_none()
    payload = {
        "nickname": seed.nickname,
        "name": seed.nickname.replace("_", " "),
        "rank": seed.rank,
        "status": UserStatus.ACTIVE,
        "balance_usdt": seed.balance_usdt,
        "locked_usdt": seed.locked_usdt,
        "balance_cnyt": seed.balance_cnyt,
        "package": seed.package,
        "initial_investment": seed.initial_investment,
        "investment_date": datetime.combine(seed.join_date, datetime.min.time()),
        "sponsor_id": sponsor_id,
        "team_size": seed.team_size,
        "team_vol": seed.team_vol,
        "body_value": seed.team_vol,
        "kyc_level": 2,
        "kyc_status": KYCStatus.VERIFIED,
        "kyc_updated_at": datetime.combine(seed.join_date, datetime.min.time()),
        "mobile_binding": True,
        "has_set_trading_password": True,
        "is_trading_password_verified": True,
        "distributor_status": "approved",
        "distributor_code": seed.referral_code,
        "commission_rate": Decimal("0.10"),
        "total_commission": Decimal("0"),
        "referred_count": seed.team_size,
        "referral_code": seed.referral_code,
        "referred_by_code": seed.referred_by_code,
        "join_date": datetime.combine(seed.join_date, datetime.min.time()),
        "created_at": datetime.combine(seed.join_date, datetime.min.time()),
        "updated_at": datetime.utcnow(),
    }
    if not user:
        user = User(
            email=seed.email,
            password_hash=get_password_hash(LOGIN_PASSWORD),
            trading_password_hash=get_password_hash(OPERATIONS_TRADING_PASSWORD),
            **payload,
        )
    else:
        for key, value in payload.items():
            setattr(user, key, value)
        if not user.password_hash:
            user.password_hash = get_password_hash(LOGIN_PASSWORD)
        user.trading_password_hash = get_password_hash(OPERATIONS_TRADING_PASSWORD)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def ensure_users(session: AsyncSession) -> dict[str, User]:
    users: dict[str, User] = {}
    for seed in PRIMARY_USERS:
        sponsor_id = users[seed.sponsor_nickname].id if seed.sponsor_nickname and seed.sponsor_nickname in users else None
        users[seed.nickname] = await upsert_user(session, seed, sponsor_id)

    tree_nodes = build_tree_nodes()
    for idx, (nickname, sponsor, _level, _line, rank, package, amount, team_sales, joined) in enumerate(tree_nodes):
        if nickname in users:
            continue
        sponsor_user = users.get(sponsor or "")
        seed = SeedUser(
            nickname=nickname,
            email=_email_for(nickname),
            join_date=joined,
            package=package,
            rank=_rank(rank),
            balance_usdt=Decimal("120"),
            locked_usdt=amount if package != "Flexible" else Decimal("0"),
            balance_cnyt=(amount / CNYT_PRICE).quantize(Decimal("1")),
            team_size=0,
            team_vol=team_sales,
            referral_code=_code_for(nickname, idx),
            referred_by_code=sponsor_user.referral_code if sponsor_user else None,
            initial_investment=amount,
        )
        users[nickname] = await upsert_user(session, seed, sponsor_user.id if sponsor_user else None)

    for seed in build_independent_nodes():
        sponsor = users.get(seed.sponsor_nickname or "")
        users[seed.nickname] = await upsert_user(session, seed, sponsor.id if sponsor else None)

    smoke_user = SeedUser(
        "ops_smoke",
        "ops.smoke@longrise.ai",
        date(2026, 1, 1),
        "Flexible",
        DragonRank.INVESTOR,
        Decimal("500"),
        Decimal("0"),
        Decimal("500"),
        0,
        Decimal("0"),
        "OPSMOKE0",
    )
    ops = await upsert_user(session, smoke_user)
    ops.trading_password_hash = get_password_hash(SMOKE_TRADING_PASSWORD)
    session.add(ops)
    users[ops.nickname] = ops

    leader = SeedUser(
        "ops_leader",
        "ops.leader@longrise.ai",
        date(2026, 1, 1),
        "Premium",
        DragonRank.BLUE_DRAGON,
        Decimal("500"),
        Decimal("1000"),
        Decimal("1000"),
        0,
        Decimal("0"),
        "OPSLEADR",
    )
    users[leader.nickname] = await upsert_user(session, leader)
    await session.commit()
    return users


async def clear_generated_rows(session: AsyncSession) -> None:
    await session.execute(text("DELETE FROM transactions WHERE hash LIKE 'V89-%'"))
    await session.execute(text("DELETE FROM withdrawals WHERE withdrawal_id LIKE 'V89%'"))
    await session.execute(text("DELETE FROM p2p_trades WHERE trade_id LIKE 'V89-%'"))
    await session.execute(text("DELETE FROM user_investments WHERE investment_id LIKE 'V89-%'"))
    await session.execute(text("DELETE FROM usdt_transfers WHERE proof_note LIKE 'V8.9%'"))
    await session.execute(text("DELETE FROM locked_wallet WHERE proof_note LIKE 'V8.9%'"))
    await session.execute(text("DELETE FROM referral_tree WHERE proof_note LIKE 'V8.9%'"))
    await session.commit()


async def insert_transaction(
    session: AsyncSession,
    *,
    user_id: UUID,
    tx_type: str,
    amount: Decimal,
    currency: str,
    description: str,
    created_at: datetime,
    reference: str,
    status: str = "completed",
    fee: Decimal = Decimal("0"),
) -> None:
    await session.execute(
        text(
            """
            INSERT INTO transactions (
                id, user_id, type, amount, currency, status, description, hash, fee, created_at, completed_at
            ) VALUES (
                :id, :user_id, CAST(:type AS transaction_type), :amount,
                CAST(:currency AS currency_type), CAST(:status AS transaction_status),
                :description, :hash, :fee, :created_at, :completed_at
            )
            """
        ),
        {
            "id": uuid4(),
            "user_id": user_id,
            "type": tx_type,
            "amount": amount.copy_abs(),
            "currency": currency,
            "status": status,
            "description": f"[V8.9 operational] {description}",
            "hash": reference,
            "fee": fee,
            "created_at": created_at,
            "completed_at": created_at if status == "completed" else None,
        },
    )


async def seed_investments(session: AsyncSession, users: dict[str, User], packages: dict[str, InvestmentPackage]) -> None:
    repurchases = {
        "Kim_Dragon88": date(2026, 3, 9),
        "Lee_Profit99": date(2026, 3, 15),
        "Park_Alpha77": date(2026, 4, 2),
        "Choi_Rise12": date(2026, 2, 8),
        "Han_Node34": date(2026, 3, 3),
        "Jung_Bull56": date(2026, 3, 12),
        "Yoon_Gold78": date(2026, 2, 20),
        "Song_Wave90": date(2026, 2, 26),
        "Lim_Eagle23": date(2026, 3, 20),
        "Ko_Titan45": date(2026, 4, 1),
    }
    for seed in PRIMARY_USERS:
        user = users[seed.nickname]
        first_type = "Premium" if seed.nickname in {"Kim_Dragon88", "Lee_Profit99", "Park_Alpha77"} else "Standard"
        first_amount = PACKAGE_POLICY[first_type]["amount"]
        rows = [
            (f"V89-{seed.nickname}-FIRST", first_type, first_amount, seed.join_date, seed.join_date + timedelta(days=365), InvestmentStatus.COMPLETED),
            (f"V89-{seed.nickname}-SECOND", "Premium", Decimal("1000"), repurchases[seed.nickname], repurchases[seed.nickname] + timedelta(days=365), InvestmentStatus.ACTIVE),
        ]
        for investment_id, package_type, principal, invested, maturity, status in rows:
            package = packages[package_type]
            investment = UserInvestment(
                investment_id=investment_id,
                user_id=user.id,
                package_id=package.id,
                principal_amount=principal,
                currency="USDT",
                invested_at=datetime.combine(invested, datetime.min.time()),
                maturity_date=datetime.combine(maturity, datetime.min.time()),
                daily_roi_rate=package.daily_roi_rate,
                total_roi_earned=Decimal("0") if status == InvestmentStatus.ACTIVE else PACKAGE_POLICY[package_type]["monthly"] * Decimal("12"),
                last_roi_date=END_DATE,
                status=status,
                current_value=principal,
                final_payout=principal if status == InvestmentStatus.COMPLETED else Decimal("0"),
                notes="V8.9 Rev.2 operational verification package history",
            )
            session.add(investment)
            await session.execute(
                text(
                    """
                    INSERT INTO member_packages (
                        user_id, package_type, principal, join_date, maturity_date,
                        current_balance, current_roi, expected_roi, status, expected_refund
                    )
                    SELECT :user_id, CAST(:package_type AS package_type), :principal, :join_date, :maturity_date,
                           :current_balance, :current_roi, :expected_roi, CAST(:status AS package_status), :expected_refund
                    WHERE NOT EXISTS (
                        SELECT 1 FROM member_packages
                        WHERE user_id = :user_id AND package_type = CAST(:package_type AS package_type)
                          AND join_date = :join_date AND principal = :principal
                    )
                    """
                ),
                {
                    "user_id": user.id,
                    "package_type": package_type,
                    "principal": principal,
                    "join_date": invested,
                    "maturity_date": maturity,
                    "current_balance": principal,
                    "current_roi": Decimal("0"),
                    "expected_roi": PACKAGE_POLICY[package_type]["monthly"] * Decimal("12") / principal * Decimal("100"),
                    "status": "matured" if status == InvestmentStatus.COMPLETED else "active",
                    "expected_refund": principal,
                },
            )
    await session.commit()


def daily_amount(package: str, d: date) -> tuple[str, Decimal, Decimal]:
    policy = PACKAGE_POLICY[package]
    base = (policy["monthly"] / Decimal("30") / Decimal("0.85")).quantize(Decimal("0.01"))
    marker = (d.toordinal() * 17) % 100
    if marker < 15:
        return "defense", Decimal("0"), Decimal("0")
    if marker < 20:
        usdt = (base * Decimal("1.4")).quantize(Decimal("0.01"))
        return "jackpot", usdt, Decimal("2.73")
    usdt = base
    displayed = (Decimal("0.40") + Decimal(marker % 111) / Decimal("100")).quantize(Decimal("0.01"))
    return "profit", usdt, displayed


async def seed_daily_returns_and_transactions(session: AsyncSession, users: dict[str, User]) -> None:
    for seed in PRIMARY_USERS:
        user = users[seed.nickname]
        await insert_transaction(
            session,
            user_id=user.id,
            tx_type="deposit",
            amount=seed.initial_investment,
            currency="USDT",
            description=f"{seed.package} package deposit",
            created_at=datetime.combine(seed.join_date, datetime.min.time()),
            reference=f"V89-DEPOSIT-{seed.nickname}",
        )
        initial_cnyt = (seed.initial_investment / CNYT_PRICE).quantize(Decimal("1"))
        await insert_transaction(
            session,
            user_id=user.id,
            tx_type="cnyt_airdrop",
            amount=initial_cnyt,
            currency="CNYT",
            description="Initial CNYT bonus: purchase amount divided by $0.02",
            created_at=datetime.combine(seed.join_date, datetime.min.time()),
            reference=f"V89-CNYT-INIT-{seed.nickname}",
        )
        d = seed.join_date + timedelta(days=1)
        while d <= END_DATE:
            day_type, usdt, displayed = daily_amount(seed.package, d)
            cnyt = (usdt * PACKAGE_POLICY[seed.package]["cnyt_rate"] / CNYT_PRICE).quantize(Decimal("0.01")) if usdt else Decimal("0")
            await session.execute(
                text(
                    """
                    INSERT INTO daily_returns (
                        user_id, return_date, package_type, pool_rate, betting_rate, futures_rate,
                        displayed_rate, usdt_earned, cnyt_earned, day_type, proof_note
                    ) VALUES (
                        :user_id, :return_date, :package_type, :pool_rate, :betting_rate, :futures_rate,
                        :displayed_rate, :usdt_earned, :cnyt_earned, :day_type, :proof_note
                    )
                    ON CONFLICT (user_id, return_date, package_type) DO UPDATE SET
                        displayed_rate = EXCLUDED.displayed_rate,
                        usdt_earned = EXCLUDED.usdt_earned,
                        cnyt_earned = EXCLUDED.cnyt_earned,
                        day_type = EXCLUDED.day_type,
                        proof_note = EXCLUDED.proof_note
                    """
                ),
                {
                    "user_id": user.id,
                    "return_date": d,
                    "package_type": seed.package,
                    "pool_rate": Decimal("0"),
                    "betting_rate": displayed,
                    "futures_rate": Decimal("0"),
                    "displayed_rate": displayed,
                    "usdt_earned": usdt,
                    "cnyt_earned": cnyt,
                    "day_type": day_type,
                    "proof_note": "V8.9 daily ROI policy: 80% profit, 15% defense, 5% jackpot.",
                },
            )
            if usdt > 0:
                created = datetime.combine(d, datetime.min.time())
                await insert_transaction(
                    session,
                    user_id=user.id,
                    tx_type="daily_roi",
                    amount=usdt,
                    currency="USDT",
                    description=f"{day_type} daily AI betting return",
                    created_at=created,
                    reference=f"V89-ROI-{seed.nickname}-{d.isoformat()}",
                )
                if cnyt > 0:
                    await insert_transaction(
                        session,
                        user_id=user.id,
                        tx_type="cnyt_airdrop",
                        amount=cnyt,
                        currency="CNYT",
                        description="Daily CNYT betting reward; P2P window 7 days",
                        created_at=created,
                        reference=f"V89-CNYT-DAILY-{seed.nickname}-{d.isoformat()}",
                    )
            d += timedelta(days=1)
    await session.commit()


async def seed_kim_story_transactions(session: AsyncSession, users: dict[str, User]) -> None:
    kim = users["Kim_Dragon88"]
    await session.execute(text("DELETE FROM withdrawals WHERE withdrawal_id IN ('V89WD20251008', 'V89WD20260312')"))
    await session.commit()
    events = [
        (date(2025, 3, 23), "direct_bonus", Decimal("640"), "Wei/Choi/Nguyen/Liu same-day direct bonus"),
        (date(2025, 3, 25), "direct_bonus", Decimal("100"), "Lee_Profit99 direct bonus"),
        (date(2025, 3, 26), "direct_bonus", Decimal("100"), "Park_Alpha77 direct bonus"),
        (date(2025, 6, 23), "direct_bonus", Decimal("100"), "KR_Choi_Star second Premium purchase direct bonus"),
        (date(2025, 9, 23), "direct_bonus", Decimal("100"), "KR_Choi_Star third Premium purchase direct bonus"),
    ]
    for event_date, tx_type, amount, description in events:
        await insert_transaction(
            session,
            user_id=kim.id,
            tx_type=tx_type,
            amount=amount,
            currency="USDT",
            description=description,
            created_at=datetime.combine(event_date, datetime.min.time()),
            reference=f"V89-KIM-{tx_type}-{event_date.isoformat()}",
        )
    for month in range(1, 17):
        event_date = date(2025, 3, 31) + timedelta(days=30 * month)
        if event_date > END_DATE:
            break
        await insert_transaction(
            session,
            user_id=kim.id,
            tx_type="rollup_bonus",
            amount=Decimal("143.29") if event_date >= date(2026, 3, 23) else Decimal("153.00"),
            currency="USDT",
            description="Kim Blue Dragon rollup bonus across eligible lower levels",
            created_at=datetime.combine(event_date, datetime.min.time()),
            reference=f"V89-KIM-ROLLUP-{event_date.isoformat()}",
        )
    for event_date, amount, note in [
        (date(2025, 10, 8), Decimal("1150"), "Kim first withdrawal after discovering accumulated balance"),
        (date(2026, 3, 12), Decimal("380"), "Kim second withdrawal before first package maturity"),
    ]:
        await insert_transaction(
            session,
            user_id=kim.id,
            tx_type="withdrawal",
            amount=amount,
            currency="USDT",
            description=note,
            created_at=datetime.combine(event_date, datetime.min.time()),
            reference=f"V89-KIM-WD-{event_date.isoformat()}",
        )
        session.add(
            Withdrawal(
                user_id=kim.id,
                withdrawal_id=f"V89WD{event_date.strftime('%Y%m%d')}",
                amount=amount,
                asset=WithdrawalType.USDT,
                network=Network.TRC20,
                wallet_address="V8.9 operational settlement wallet",
                status=WithdrawalStatus.COMPLETED,
                auto_approved=False,
                fee_amount=Decimal("0"),
                final_amount=amount,
                request_time=datetime.combine(event_date, datetime.min.time()),
                processed_at=datetime.combine(event_date, datetime.min.time()),
                tx_hash=f"V89-KIM-WD-{event_date.isoformat()}",
                confirmations=20,
                admin_notes=note,
                created_at=datetime.combine(event_date, datetime.min.time()),
            )
        )
    await insert_transaction(
        session,
        user_id=kim.id,
        tx_type="adjustment",
        amount=Decimal("1000"),
        currency="USDT",
        description="Premium first package maturity principal returned at 100%, zero fee",
        created_at=datetime(2026, 3, 23),
        reference="V89-KIM-MATURITY-2026-03-23",
    )
    await session.commit()


async def seed_referral_tree(session: AsyncSession, users: dict[str, User]) -> None:
    root = users["Kim_Dragon88"]
    for nickname, sponsor, level, line, rank, package, amount, team_sales, joined in build_tree_nodes():
        user = users[nickname]
        sponsor_id = users[sponsor].id if sponsor else None
        await session.execute(
            text(
                """
                INSERT INTO referral_tree (
                    root_user_id, user_id, sponsor_id, level_from_root, line_number,
                    rank, package_type, investment_amount, team_sales, join_date, proof_note
                ) VALUES (
                    :root_user_id, :user_id, :sponsor_id, :level_from_root, :line_number,
                    :rank, :package_type, :investment_amount, :team_sales, :join_date, :proof_note
                )
                ON CONFLICT (root_user_id, user_id) DO UPDATE SET
                    sponsor_id = EXCLUDED.sponsor_id,
                    level_from_root = EXCLUDED.level_from_root,
                    line_number = EXCLUDED.line_number,
                    rank = EXCLUDED.rank,
                    package_type = EXCLUDED.package_type,
                    investment_amount = EXCLUDED.investment_amount,
                    team_sales = EXCLUDED.team_sales,
                    join_date = EXCLUDED.join_date,
                    proof_note = EXCLUDED.proof_note
                """
            ),
            {
                "root_user_id": root.id,
                "user_id": user.id,
                "sponsor_id": sponsor_id,
                "level_from_root": level,
                "line_number": line,
                "rank": rank,
                "package_type": package,
                "investment_amount": amount,
                "team_sales": team_sales,
                "join_date": joined,
                "proof_note": "V8.9 Kim tree: Wei is Purple, Lee/Park are exact Blue count, Choi is one Blue short.",
            },
        )
    await session.commit()


async def seed_wallet_proof_tables(session: AsyncSession, users: dict[str, User]) -> None:
    counterpart_pool = [
        ("Kim_Dragon88", "KR"),
        ("CN_Wei_Dragon", "CN"),
        ("KR_Choi_Star", "KR"),
    ]
    for seed in PRIMARY_USERS:
        user = users[seed.nickname]
        for index, direction in enumerate(["RECEIVE", "SELL", "RECEIVE"], start=1):
            counterpart_nickname, counterpart_country = counterpart_pool[index - 1]
            await session.execute(
                text(
                    """
                    INSERT INTO usdt_transfers (
                        user_id, direction, counterpart_nickname, counterpart_country, amount,
                        transfer_date, proof_note
                    ) VALUES (
                        :user_id, :direction, :counterpart_nickname, :counterpart_country, :amount,
                        :transfer_date, :proof_note
                    )
                    """
                ),
                {
                    "user_id": user.id,
                    "direction": direction,
                    "counterpart_nickname": counterpart_nickname,
                    "counterpart_country": counterpart_country,
                    "amount": Decimal("100") * index,
                    "transfer_date": seed.join_date + timedelta(days=30 * index),
                    "proof_note": "V8.9 transfer verification: three USDT transfer rows per primary operational account.",
                },
            )
        await session.execute(
            text(
                """
                INSERT INTO locked_wallet (
                    user_id, locked_principal, locked_bonus, package_ref, lock_start,
                    lock_until, status, proof_note
                ) VALUES (
                    :user_id, :locked_principal, :locked_bonus, :package_ref, :lock_start,
                    :lock_until, :status, :proof_note
                )
                ON CONFLICT (user_id, package_ref) DO UPDATE SET
                    locked_principal = EXCLUDED.locked_principal,
                    locked_bonus = EXCLUDED.locked_bonus,
                    lock_start = EXCLUDED.lock_start,
                    lock_until = EXCLUDED.lock_until,
                    status = EXCLUDED.status,
                    proof_note = EXCLUDED.proof_note
                """
            ),
            {
                "user_id": user.id,
                "locked_principal": seed.locked_usdt,
                "locked_bonus": Decimal("0"),
                "package_ref": f"V89-{seed.nickname}-SECOND",
                "lock_start": date(2026, 3, 9),
                "lock_until": date(2027, 3, 9),
                "status": "LOCKED" if seed.locked_usdt > 0 else "RELEASED",
                "proof_note": "V8.9 locked wallet: separates available USDT from locked principal.",
            },
        )
    await session.commit()


async def seed_market_and_content(session: AsyncSession, admin: Admin, users: dict[str, User]) -> None:
    for symbol, price in [("CNYT", Decimal("0.02")), ("USDT", Decimal("1.00"))]:
        result = await session.execute(select(TokenPrice).where(TokenPrice.token_symbol == symbol))
        token = result.scalar_one_or_none()
        if not token:
            token = TokenPrice(
                token_symbol=symbol,
                price_usd=price,
                source="V8.9 seed",
                last_updated=datetime.utcnow(),
                price_24h_ago=price,
                change_24h_percent=Decimal("0"),
                volume_24h=Decimal("25000"),
                market_cap=Decimal("20000000") if symbol == "CNYT" else None,
                base_currency="USD",
                is_active=True,
                is_manual=True,
                updated_by=admin.id,
            )
        else:
            token.price_usd = price
            token.source = "V8.9 operational policy"
            token.last_updated = datetime.utcnow()
            token.price_24h_ago = price
            token.change_24h_percent = Decimal("0")
            token.volume_24h = token.volume_24h or Decimal("25000")
            token.market_cap = Decimal("20000000") if symbol == "CNYT" else token.market_cap
            token.base_currency = "USD"
            token.is_active = True
            token.is_manual = True
            token.updated_by = admin.id
        session.add(token)
    for idx, (creator, asset, amount, price) in enumerate(
        [
            ("Kim_Dragon88", "CNYT", Decimal("2500"), Decimal("0.0194")),
            ("Choi_Rise12", "CNYT", Decimal("1500"), Decimal("0.0194")),
            ("ops_leader", "USDT", Decimal("100"), Decimal("1.0000")),
        ],
        start=1,
    ):
        trade_id = f"V89-P2P-{idx:03d}"
        result = await session.execute(select(P2PTrade).where(P2PTrade.trade_id == trade_id))
        trade = result.scalar_one_or_none()
        if not trade:
            trade = P2PTrade(trade_id=trade_id)
        trade.creator_id = users[creator].id
        trade.trade_type = P2PTradeType.SELL
        trade.asset = asset
        trade.amount = amount
        trade.price_per_unit = price
        trade.total_value = amount * price
        trade.currency = "USDT"
        trade.status = P2PTradeStatus.ACTIVE
        trade.expires_at = datetime.utcnow() + timedelta(days=7)
        trade.payment_method = "BANK_TRANSFER"
        trade.requires_kyc = True
        trade.requires_phone_verification = True
        trade.trading_password_verified = True
        trade.auto_reply_message = "V8.9 seeded P2P liquidity."
        session.add(trade)
    faq_result = await session.execute(select(CMSContent).where(CMSContent.content_key == "v89-operational-verification-faq"))
    if not faq_result.scalar_one_or_none():
        session.add(
            CMSContent(
                content_key="v89-operational-verification-faq",
                content_type=ContentType.SUPPORT,
                title="V8.9 Operational Verification",
                subtitle="operations",
                content={"answer": "Kim_Dragon88 is populated with V8.9 Rev.2 wallet, tree, package, and CNYT verification data."},
                status=ContentStatus.PUBLISHED,
                is_visible=True,
                published_at=datetime.utcnow(),
                sort_order=1,
                created_by=admin.id,
            )
        )
    news_result = await session.execute(select(NewsArticle).where(NewsArticle.article_id == "V89-OPERATIONAL-DATA-READY"))
    if not news_result.scalar_one_or_none():
        session.add(
            NewsArticle(
                article_id="V89-OPERATIONAL-DATA-READY",
                title="LONGRISE AI V8.9 operational verification data ready",
                summary="Operational scenario data is available for Kim_Dragon88 and the 10 leader accounts.",
                content="Seeded data follows the V8.9 Rev.2 master plan for wallet, package, referral, and CNYT proof checks.",
                category=NewsCategory.ANNOUNCEMENTS,
                status=ContentStatus.PUBLISHED,
                is_featured=True,
                is_pinned=True,
                published_at=datetime.utcnow(),
                author_id=admin.id,
            )
        )
    await session.commit()


async def verify_seed(session: AsyncSession) -> dict[str, int | str]:
    checks = {
        "users": "SELECT COUNT(*) FROM users WHERE email LIKE '%@longrise.ai' OR email LIKE '%@gmail.com' OR email LIKE '%@ops.longrise.ai'",
        "primary_users": "SELECT COUNT(*) FROM users WHERE email IN ('kim88@gmail.com','lee99@gmail.com','park77@gmail.com','choi12@gmail.com','han34@gmail.com','jung56@gmail.com','yoon78@gmail.com','song90@gmail.com','lim23@gmail.com','ko45@gmail.com')",
        "kim_tree_rows": "SELECT COUNT(*) FROM referral_tree WHERE proof_note LIKE 'V8.9%'",
        "daily_returns": "SELECT COUNT(*) FROM daily_returns WHERE proof_note LIKE 'V8.9%'",
        "v89_transactions": "SELECT COUNT(*) FROM transactions WHERE hash LIKE 'V89-%'",
        "locked_wallet": "SELECT COUNT(*) FROM locked_wallet WHERE proof_note LIKE 'V8.9%'",
        "usdt_transfers": "SELECT COUNT(*) FROM usdt_transfers WHERE proof_note LIKE 'V8.9%'",
    }
    results: dict[str, int | str] = {}
    for key, sql in checks.items():
        results[key] = int(await session.scalar(text(sql)) or 0)
    kim = await session.scalar(text("SELECT balance_usdt || '/' || locked_usdt || '/' || balance_cnyt FROM users WHERE nickname = 'Kim_Dragon88'"))
    results["kim_usdt_locked_cnyt"] = str(kim)
    return results


async def main() -> None:
    await create_db_and_tables()
    async with async_session_maker() as session:
        await ensure_operational_schema(session)
        admin = await get_or_create_admin(session)
        await AdminConsoleService.ensure_default_settings(session, admin)
        packages = await ensure_packages(session, admin.id)
        users = await ensure_users(session)
        await clear_generated_rows(session)
        await seed_investments(session, users, packages)
        await seed_daily_returns_and_transactions(session, users)
        await seed_kim_story_transactions(session, users)
        await seed_referral_tree(session, users)
        await seed_wallet_proof_tables(session, users)
        await seed_market_and_content(session, admin, users)
        results = await verify_seed(session)

    print("V8.9 operational data insertion completed.")
    for key, value in results.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    asyncio.run(main())
