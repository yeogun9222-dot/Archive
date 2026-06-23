"""
Admin models for Longrise AI Platform
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy import Enum as SAEnum, JSON

import enum


class AdminRole(str, enum.Enum):
    """Admin role enumeration"""
    SUPER = "super"
    FINANCE = "finance"
    COMMUNITY = "community"
    CONTENT = "content"


class AdminBase(SQLModel):
    """Base admin model with common fields"""
    username: str = Field(max_length=50, unique=True, index=True)
    email: EmailStr = Field(unique=True, index=True)
    name: str = Field(max_length=100)
    role: AdminRole = Field(
        sa_column=Column(
            SAEnum(
                AdminRole,
                name="admin_role",
                create_type=False,
                values_callable=lambda values: [item.value for item in values],
            )
        )
    )
    permissions: List[str] = Field(default=[], sa_column=Column(JSON))
    is_active: bool = Field(default=True)


class Admin(AdminBase, table=True):
    """Admin table model"""
    __tablename__ = "admin_users"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    password_hash: str = Field(max_length=255)
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AdminCreate(AdminBase):
    """Schema for creating admin"""
    password: str = Field(min_length=4, max_length=100)  # 개발용 최소 4자


class AdminRead(AdminBase):
    """Schema for reading admin"""
    id: UUID
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class AdminUpdate(SQLModel):
    """Schema for updating admin"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[AdminRole] = None
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None


class AdminLogin(SQLModel):
    """Schema for admin login"""
    username: str
    password: str


class Token(SQLModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin_id: str
    role: str
