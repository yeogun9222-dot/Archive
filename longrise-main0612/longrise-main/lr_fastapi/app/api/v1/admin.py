"""
Admin API endpoints
"""
from datetime import timedelta
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_admin, require_admin_permission
from app.core.config import settings
from app.core.database import get_session
from app.core.security import create_admin_access_token
from app.models.admin import (
    Admin,
    AdminCreate,
    AdminRead,
    AdminLogin,
    Token,
    AdminUpdate,
)
from app.services.admin_service import AdminService

router = APIRouter()


@router.post("/login", response_model=Token)
async def admin_login_for_access_token(
    session: AsyncSession = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible admin login, get an access token for future requests
    """
    admin = await AdminService.authenticate_admin(
        session, form_data.username, form_data.password
    )
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive admin"
        )

    # Update last login
    await AdminService.update_last_login(session, admin.id)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_admin_access_token(
        admin_username=admin.username,
        admin_id=str(admin.id),
        admin_role=admin.role,
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "admin_id": str(admin.id),
        "role": admin.role
    }


@router.post("/login/json", response_model=Token)
async def admin_login_json(
    admin_login: AdminLogin,
    session: AsyncSession = Depends(get_session),
) -> Any:
    """
    JSON admin login endpoint
    """
    admin = await AdminService.authenticate_admin(
        session, admin_login.username, admin_login.password
    )
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive admin"
        )

    # Update last login
    await AdminService.update_last_login(session, admin.id)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_admin_access_token(
        admin_username=admin.username,
        admin_id=str(admin.id),
        admin_role=admin.role,
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "admin_id": str(admin.id),
        "role": admin.role
    }


@router.post("/test-token", response_model=AdminRead)
async def test_admin_token(
    current_admin: Admin = Depends(get_current_active_admin),
) -> Any:
    """
    Test admin access token
    """
    return current_admin


@router.get("/me", response_model=AdminRead)
async def get_current_admin_info(
    current_admin: Admin = Depends(get_current_active_admin),
) -> Any:
    """
    Get current admin information
    """
    return current_admin


@router.get("/", response_model=List[AdminRead])
async def list_admins(
    session: AsyncSession = Depends(get_session),
    current_admin: Admin = Depends(require_admin_permission("admin:read")),
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
) -> Any:
    """
    Get list of all admins (requires admin:read permission)
    """
    admins = await AdminService.list_admins(
        session, skip=skip, limit=limit, include_inactive=include_inactive
    )
    return admins


@router.post("/", response_model=AdminRead)
async def create_admin(
    admin_create: AdminCreate,
    session: AsyncSession = Depends(get_session),
    current_admin: Admin = Depends(require_admin_permission("admin:write")),
) -> Any:
    """
    Create new admin (requires admin:write permission)
    """
    # Check if username or email already exists
    existing_username = await AdminService.get_admin_by_username(
        session, admin_create.username
    )
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    existing_email = await AdminService.get_admin_by_email(
        session, admin_create.email
    )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    admin = await AdminService.create_admin(session, admin_create)
    return admin


@router.put("/{admin_id}", response_model=AdminRead)
async def update_admin(
    admin_id: str,
    admin_update: AdminUpdate,
    session: AsyncSession = Depends(get_session),
    current_admin: Admin = Depends(require_admin_permission("admin:write")),
) -> Any:
    """
    Update admin information (requires admin:write permission)
    """
    try:
        from uuid import UUID
        admin_uuid = UUID(admin_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID format"
        )

    admin = await AdminService.update_admin(
        session, admin_uuid, admin_update.model_dump(exclude_unset=True)
    )
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )

    return admin


@router.delete("/{admin_id}", response_model=AdminRead)
async def deactivate_admin(
    admin_id: str,
    session: AsyncSession = Depends(get_session),
    current_admin: Admin = Depends(require_admin_permission("admin:write")),
) -> Any:
    """
    Deactivate admin (soft delete, requires admin:write permission)
    """
    try:
        from uuid import UUID
        admin_uuid = UUID(admin_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID format"
        )

    # Prevent self-deactivation
    if admin_uuid == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )

    admin = await AdminService.deactivate_admin(session, admin_uuid)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )

    return admin


@router.post("/logout")
async def admin_logout(
    current_admin: Admin = Depends(get_current_active_admin),
) -> Any:
    """
    Admin logout endpoint (token invalidation is handled by frontend)
    """
    return {"message": "Successfully logged out"}