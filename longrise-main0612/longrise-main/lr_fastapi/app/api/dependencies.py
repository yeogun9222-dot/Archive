"""
API dependencies for authentication and authorization
"""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import verify_token
from app.models.user import User
from app.models.admin import Admin, AdminRole
from app.services.user_service import UserService
from app.services.admin_service import AdminService
from jose import jwt
from app.core.config import settings

# Security scheme
security = HTTPBearer()


async def get_current_user(
    session: AsyncSession = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        email = verify_token(token)
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = await UserService.get_user_by_email(session, email=email)
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user"""
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_user_optional(
    session: AsyncSession = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[User]:
    """Get current user if authenticated (optional)"""
    if not credentials:
        return None

    try:
        token = credentials.credentials
        email = verify_token(token)
        if email is None:
            return None

        user = await UserService.get_user_by_email(session, email=email)
        return user
    except Exception:
        return None


async def get_current_admin(
    session: AsyncSession = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Admin:
    """Get current authenticated admin"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        # Check if it's an admin token
        token_type = payload.get("type")
        if token_type != "admin":
            raise credentials_exception

        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception

    admin = await AdminService.get_admin_by_username(session, username=username)
    if admin is None:
        raise credentials_exception

    return admin


async def get_current_active_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> Admin:
    """Get current active admin"""
    if not current_admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive admin"
        )
    return current_admin


def require_admin_permission(required_permission: str):
    """Dependency factory for requiring specific admin permission"""
    async def permission_dependency(
        admin: Admin = Depends(get_current_active_admin),
    ) -> Admin:
        # Super admin has all permissions
        if admin.role == AdminRole.SUPER:  # "super"
            return admin

        # Check specific permission
        if required_permission not in admin.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {required_permission}"
            )
        return admin

    return permission_dependency