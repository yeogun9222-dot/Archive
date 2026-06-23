"""
Authentication API endpoints
"""
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.config import settings
from app.core.database import get_session
from app.core.security import create_access_token
from app.models.email_verification import (
    EmailAvailabilityRequest,
    EmailAvailabilityResponse,
    SendSignupVerificationRequest,
    SendSignupVerificationResponse,
    SignupCompleteRequest,
    VerifySignupCodeRequest,
    VerifySignupCodeResponse,
)
from app.models.user import Token, User, UserLogin, UserRead
from app.services.signup_service import SignupService
from app.services.user_service import UserService

router = APIRouter()


def build_token_for_user(user: User) -> Token:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/signup/check-email", response_model=EmailAvailabilityResponse)
async def check_signup_email(
    *,
    session: AsyncSession = Depends(get_session),
    payload: EmailAvailabilityRequest,
) -> EmailAvailabilityResponse:
    """
    Check whether an email can be used for public signup.
    """
    existing_user = await UserService.get_user_by_email(
        session, SignupService.normalize_email(payload.email)
    )
    if existing_user:
        return EmailAvailabilityResponse(available=False, message="Email already exists.")
    return EmailAvailabilityResponse(available=True, message="Email is available.")


@router.post("/signup/send-code", response_model=SendSignupVerificationResponse)
async def send_signup_verification_code(
    *,
    session: AsyncSession = Depends(get_session),
    payload: SendSignupVerificationRequest,
) -> SendSignupVerificationResponse:
    """
    Send a six-digit signup verification code to the email address.
    """
    cooldown_seconds, expires_in_seconds = await SignupService.send_verification(
        session, payload.email
    )
    return SendSignupVerificationResponse(
        sent=True,
        cooldown_seconds=cooldown_seconds,
        expires_in_seconds=expires_in_seconds,
        message="Verification code sent.",
    )


@router.post("/signup/verify-code", response_model=VerifySignupCodeResponse)
async def verify_signup_code(
    *,
    session: AsyncSession = Depends(get_session),
    payload: VerifySignupCodeRequest,
) -> VerifySignupCodeResponse:
    """
    Verify the six-digit signup code.
    """
    await SignupService.verify_code(session, payload.email, payload.code)
    return VerifySignupCodeResponse(verified=True, message="Verification successful.")


@router.post("/signup/complete", response_model=Token)
async def complete_signup(
    *,
    session: AsyncSession = Depends(get_session),
    payload: SignupCompleteRequest,
) -> Any:
    """
    Complete public signup after successful email verification and return a login token.
    """
    user = await SignupService.complete_signup(
        session,
        payload.email,
        payload.password,
        payload.referral_code,
    )
    await UserService.update_last_login(session, user.id)
    return build_token_for_user(user)


@router.post("/login", response_model=Token)
async def login_for_access_token(
    session: AsyncSession = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await UserService.authenticate_user(
        session, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Update last login
    await UserService.update_last_login(session, user.id)

    return build_token_for_user(user)


@router.post("/login/json", response_model=Token)
async def login_json(
    *,
    session: AsyncSession = Depends(get_session),
    user_in: UserLogin,
) -> Any:
    """
    JSON login endpoint
    """
    user = await UserService.authenticate_user(
        session, user_in.email, user_in.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Update last login
    await UserService.update_last_login(session, user.id)

    return build_token_for_user(user)


@router.post("/test-token", response_model=UserRead)
async def test_token(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Test access token
    """
    return UserRead.model_validate(current_user)


@router.post("/logout")
async def logout() -> dict:
    """
    Logout endpoint (client-side token removal)
    """
    return {"message": "Successfully logged out. Please remove the token from client storage."}


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Refresh access token
    """
    return build_token_for_user(current_user)
