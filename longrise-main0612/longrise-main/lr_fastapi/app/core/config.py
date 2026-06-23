"""
Core configuration settings for Longrise API
"""
import os
from typing import List, Union

from pydantic import EmailStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_env = os.getenv("ENVIRONMENT", "development")
_env_file = ".env.staging" if _env == "staging" else ".env.local"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_file,
        env_ignore_empty=True,
        extra="ignore"
    )

    # Project Information
    PROJECT_NAME: str = "Longrise AI API"
    PROJECT_VERSION: str = "0.1.0"
    PROJECT_DESCRIPTION: str = "Longrise AI Crypto Investment Platform API"
    API_V1_STR: str = "/api/v1"

    # Database — no default; app will not start without this
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False

    # Security — no default; app will not start without this
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # CORS — required in non-development; empty list means no CORS middleware
    BACKEND_CORS_ORIGINS: List[str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    @model_validator(mode="after")
    def require_cors_in_non_dev(self) -> "Settings":
        if self.ENVIRONMENT != "development" and not self.BACKEND_CORS_ORIGINS:
            raise ValueError(
                f"BACKEND_CORS_ORIGINS must be configured when ENVIRONMENT={self.ENVIRONMENT!r}. "
                f"Check that {_env_file} exists and contains BACKEND_CORS_ORIGINS."
            )
        return self

    # Logging
    LOG_LEVEL: str = "info"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Signup email verification
    SIGNUP_VERIFICATION_EXPIRE_MINUTES: int = 10
    SIGNUP_VERIFICATION_RESEND_SECONDS: int = 180
    SIGNUP_VERIFICATION_MAX_ATTEMPTS: int = 5
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: EmailStr | str = "no-reply@longrise.ai"
    SMTP_USE_TLS: bool = True

    # OTP / Google Authenticator
    OTP_ISSUER_NAME: str = "Longrise"
    OTP_ENCRYPTION_KEY: str = ""
    OTP_SETUP_EXPIRE_MINUTES: int = 10
    OTP_BACKUP_CODE_COUNT: int = 10

    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


# Fail immediately at import time if required settings are missing.
settings = Settings()
