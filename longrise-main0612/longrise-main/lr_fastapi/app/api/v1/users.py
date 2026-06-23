"""
User API endpoints
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_admin, get_current_active_user, get_current_user
from app.core.database import get_session
from app.models.user import User, UserCreate, UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    *,
    session: AsyncSession = Depends(get_session),
    user_in: UserCreate,
) -> UserRead:
    """
    Create new user.
    """
    # Check if user with this email already exists
    existing_user = await UserService.get_user_by_email(session, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )

    # Check if user with this nickname already exists
    existing_nickname = await UserService.get_user_by_nickname(session, user_in.nickname)
    if existing_nickname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this nickname already exists in the system."
        )

    user = await UserService.create_user(session, user_in)
    return UserRead.model_validate(user)


@router.get("/", response_model=List[UserRead])
async def read_users(
    *,
    session: AsyncSession = Depends(get_session),
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of users to return"),
    status: Optional[str] = Query(None, description="Filter by user status"),
    current_admin=Depends(get_current_active_admin),
) -> List[UserRead]:
    """
    Retrieve users.
    """
    users = await UserService.get_users(session, skip=skip, limit=limit, status=status)
    return [UserRead.model_validate(user) for user in users]


@router.get("/me", response_model=UserRead)
async def read_user_me(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
) -> UserRead:
    """
    Get current user.
    """
    user = await UserService.ensure_referral_code(session, current_user)
    return UserRead.model_validate(user)


@router.get("/{user_id}", response_model=UserRead)
async def read_user_by_id(
    *,
    session: AsyncSession = Depends(get_session),
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> UserRead:
    """
    Get a specific user by ID.
    """
    user = await UserService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Users can only see their own data unless they're admin
    # For now, allowing all authenticated users to see others
    # In production, you might want to add role-based access control
    return UserRead.model_validate(user)


@router.put("/me", response_model=UserRead)
async def update_user_me(
    *,
    session: AsyncSession = Depends(get_session),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> UserRead:
    """
    Update own user.
    """
    # Check nickname uniqueness if it's being updated
    if user_in.nickname:
        existing_user = await UserService.get_user_by_nickname(session, user_in.nickname)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this nickname already exists in the system."
            )

    user = await UserService.update_user(session, current_user.id, user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserRead.model_validate(user)


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    *,
    session: AsyncSession = Depends(get_session),
    user_id: UUID,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> UserRead:
    """
    Update a user (admin function).
    """
    # Check nickname uniqueness if it's being updated
    if user_in.nickname:
        existing_user = await UserService.get_user_by_nickname(session, user_in.nickname)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this nickname already exists in the system."
            )

    user = await UserService.update_user(session, user_id, user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserRead.model_validate(user)


@router.delete("/{user_id}")
async def delete_user(
    *,
    session: AsyncSession = Depends(get_session),
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Delete a user (admin function).
    """
    success = await UserService.delete_user(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"message": "User deleted successfully"}


@router.get("/count/total")
async def get_users_count(
    *,
    session: AsyncSession = Depends(get_session),
    status: Optional[str] = Query(None, description="Filter by user status"),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Get total users count.
    """
    count = await UserService.get_users_count(session, status=status)
    return {"total_users": count}
