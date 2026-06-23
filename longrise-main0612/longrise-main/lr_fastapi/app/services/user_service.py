"""
User service for business logic
"""
import random
import re
import string
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserCreate, UserUpdate


REFERRAL_CODE_PATTERN = re.compile(r"^[A-Z0-9]{8}$")


class UserService:
    """User service class"""

    @staticmethod
    def normalize_referral_code(code: str | None) -> str | None:
        if not code:
            return None
        normalized = "".join(char for char in code.strip().upper() if char.isalnum())
        return normalized or None

    @staticmethod
    async def generate_referral_code(session: AsyncSession) -> str:
        """Generate a unique 8-character uppercase alphanumeric referral code."""
        rng = random.SystemRandom()
        alphabet = string.ascii_uppercase + string.digits
        for _ in range(100):
            candidate = "".join(rng.choice(alphabet) for _ in range(8))
            if not await UserService.get_user_by_referral_code(session, candidate):
                return candidate
        raise RuntimeError("Unable to generate a unique referral code.")

    @staticmethod
    async def get_user_by_referral_code(session: AsyncSession, code: str | None) -> Optional[User]:
        """Get user by referral code."""
        normalized = UserService.normalize_referral_code(code)
        if not normalized:
            return None
        statement = select(User).where(User.referral_code == normalized)
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def ensure_referral_code(session: AsyncSession, user: User) -> User:
        """Ensure an existing account has an immutable referral code."""
        if user.referral_code and REFERRAL_CODE_PATTERN.match(user.referral_code):
            return user
        db_user = await UserService.get_user_by_id(session, user.id)
        if not db_user:
            return user
        if not db_user.referral_code or not REFERRAL_CODE_PATTERN.match(db_user.referral_code):
            if db_user.nickname == "Kim_Dragon88" and not await UserService.get_user_by_referral_code(session, "DRAGON88"):
                db_user.referral_code = "DRAGON88"
            else:
                db_user.referral_code = await UserService.generate_referral_code(session)
            session.add(db_user)
            await session.commit()
            await session.refresh(db_user)
        return db_user

    @staticmethod
    async def ensure_all_referral_codes(session: AsyncSession) -> int:
        """Backfill referral codes for existing accounts."""
        statement = select(User)
        result = await session.execute(statement)
        users = [
            user
            for user in result.scalars().all()
            if not user.referral_code or not REFERRAL_CODE_PATTERN.match(user.referral_code)
        ]
        for user in users:
            if user.nickname == "Kim_Dragon88" and not await UserService.get_user_by_referral_code(session, "DRAGON88"):
                user.referral_code = "DRAGON88"
            else:
                user.referral_code = await UserService.generate_referral_code(session)
            session.add(user)
        if users:
            await session.commit()
        return len(users)

    @staticmethod
    async def apply_referrer(
        session: AsyncSession,
        user: User,
        referral_code: str | None,
    ) -> User:
        """Attach a sponsor once; later changes are not allowed."""
        normalized = UserService.normalize_referral_code(referral_code)
        if not normalized:
            raise ValueError("Referral code is required.")
        if len(normalized) != 8:
            raise ValueError("Referral code must be 8 uppercase letters or numbers.")
        if user.referred_by_code or user.sponsor_id:
            raise ValueError("Referral code is already set and cannot be changed.")

        sponsor = await UserService.get_user_by_referral_code(session, normalized)
        if not sponsor:
            raise ValueError("Referral code not found.")
        if sponsor.id == user.id:
            raise ValueError("You cannot use your own referral code.")

        user.referred_by_code = sponsor.referral_code
        user.sponsor_id = sponsor.id
        sponsor.team_size = (sponsor.team_size or 0) + 1
        sponsor.referred_count = (sponsor.referred_count or 0) + 1
        session.add(user)
        session.add(sponsor)
        await session.commit()
        await session.refresh(user)
        return user

    @staticmethod
    async def create_user(session: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user"""
        # Hash passwords
        hashed_password = get_password_hash(user_data.password)
        trading_password_hash = None
        if user_data.trading_password:
            trading_password_hash = get_password_hash(user_data.trading_password)

        # Create user instance
        user_dict = user_data.model_dump(exclude={"password", "trading_password"})
        if not user_dict.get("referral_code"):
            user_dict["referral_code"] = await UserService.generate_referral_code(session)
        user_dict.update({
            "password_hash": hashed_password,
            "trading_password_hash": trading_password_hash,
        })

        # has_set_trading_password는 이미 UserBase에 있으므로 중복 설정 안 함
        if "has_set_trading_password" not in user_dict:
            user_dict["has_set_trading_password"] = bool(user_data.trading_password)

        db_user = User(**user_dict)

        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return db_user

    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        statement = select(User).where(User.id == user_id)
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        statement = select(User).where(User.email == email)
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_nickname(session: AsyncSession, nickname: str) -> Optional[User]:
        """Get user by nickname"""
        statement = select(User).where(User.nickname == nickname)
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_users(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
    ) -> List[User]:
        """Get multiple users with pagination"""
        statement = select(User)

        if status:
            statement = statement.where(User.status == status)

        statement = statement.offset(skip).limit(limit)
        result = await session.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def get_users_count(session: AsyncSession, status: Optional[str] = None) -> int:
        """Get total users count"""
        statement = select(func.count(User.id))

        if status:
            statement = statement.where(User.status == status)

        result = await session.execute(statement)
        return result.scalar_one() or 0

    @staticmethod
    async def update_user(
        session: AsyncSession, user_id: UUID, user_data: UserUpdate
    ) -> Optional[User]:
        """Update user"""
        db_user = await UserService.get_user_by_id(session, user_id)
        if not db_user:
            return None

        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return db_user

    @staticmethod
    async def delete_user(session: AsyncSession, user_id: UUID) -> bool:
        """Delete user (soft delete by setting status to inactive)"""
        db_user = await UserService.get_user_by_id(session, user_id)
        if not db_user:
            return False

        db_user.status = "inactive"
        session.add(db_user)
        await session.commit()
        return True

    @staticmethod
    async def authenticate_user(
        session: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        """Authenticate user by email and password"""
        user = await UserService.get_user_by_email(session, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    async def verify_trading_password(
        session: AsyncSession, user_id: UUID, trading_password: str
    ) -> bool:
        """Verify trading password"""
        user = await UserService.get_user_by_id(session, user_id)
        if not user or not user.trading_password_hash:
            return False
        return verify_password(trading_password, user.trading_password_hash)

    @staticmethod
    async def update_last_login(session: AsyncSession, user_id: UUID) -> None:
        """Update user last login timestamp"""
        from datetime import datetime

        db_user = await UserService.get_user_by_id(session, user_id)
        if db_user:
            db_user.last_login_at = datetime.utcnow()
            session.add(db_user)
            await session.commit()
