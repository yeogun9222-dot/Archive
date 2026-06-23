"""
Admin service for business logic operations
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.models.admin import Admin, AdminCreate


class AdminService:
    """Service class for admin operations"""

    @staticmethod
    async def authenticate_admin(
        session: AsyncSession, username: str, password: str
    ) -> Optional[Admin]:
        """
        Authenticate admin with username and password
        """
        admin = await AdminService.get_admin_by_username(session, username)
        if not admin:
            return None
        if not admin.is_active:
            return None
        if not verify_password(password, admin.password_hash):
            return None
        return admin

    @staticmethod
    async def get_admin_by_username(
        session: AsyncSession, username: str
    ) -> Optional[Admin]:
        """Get admin by username"""
        statement = select(Admin).where(Admin.username == username)
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_admin_by_email(
        session: AsyncSession, email: str
    ) -> Optional[Admin]:
        """Get admin by email"""
        statement = select(Admin).where(Admin.email == email)
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_admin_by_id(
        session: AsyncSession, admin_id: UUID
    ) -> Optional[Admin]:
        """Get admin by ID"""
        statement = select(Admin).where(Admin.id == admin_id)
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_admin(
        session: AsyncSession, admin_create: AdminCreate
    ) -> Admin:
        """Create new admin"""
        password_hash = get_password_hash(admin_create.password)

        admin_data = admin_create.model_dump(exclude={"password"})
        admin = Admin(
            **admin_data,
            password_hash=password_hash,
        )

        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        return admin

    @staticmethod
    async def update_last_login(
        session: AsyncSession, admin_id: UUID
    ) -> None:
        """Update admin last login timestamp"""
        admin = await AdminService.get_admin_by_id(session, admin_id)
        if admin:
            admin.last_login = datetime.utcnow()
            admin.updated_at = datetime.utcnow()
            session.add(admin)
            await session.commit()

    @staticmethod
    async def update_admin(
        session: AsyncSession, admin_id: UUID, admin_update: dict
    ) -> Optional[Admin]:
        """Update admin information"""
        admin = await AdminService.get_admin_by_id(session, admin_id)
        if not admin:
            return None

        for key, value in admin_update.items():
            if hasattr(admin, key) and value is not None:
                setattr(admin, key, value)

        admin.updated_at = datetime.utcnow()
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        return admin

    @staticmethod
    async def list_admins(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False
    ) -> list[Admin]:
        """List all admins"""
        statement = select(Admin)
        if not include_inactive:
            statement = statement.where(Admin.is_active == True)

        statement = statement.offset(skip).limit(limit).order_by(Admin.created_at.desc())
        result = await session.execute(statement)
        return list(result.scalars().all())

    @staticmethod
    async def deactivate_admin(
        session: AsyncSession, admin_id: UUID
    ) -> Optional[Admin]:
        """Deactivate admin (soft delete)"""
        admin = await AdminService.get_admin_by_id(session, admin_id)
        if not admin:
            return None

        admin.is_active = False
        admin.updated_at = datetime.utcnow()
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        return admin