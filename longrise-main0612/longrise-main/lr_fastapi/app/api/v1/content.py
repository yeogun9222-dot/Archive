"""
Content API endpoints.
"""
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.services.operations_service import OperationsService

router = APIRouter()


MASTER_PLAN_PATH = Path(__file__).resolve().parents[4] / "docs" / "master_plan" / "LONGRISE_MasterPlan_V8_9_KO.html"


@router.get("/news")
async def get_news(
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, Any]]:
    return await OperationsService.get_news(session, limit=limit)


@router.get("/support/faq")
async def get_support_faq(
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, Any]]:
    return await OperationsService.get_support_faq(session, limit=limit)


@router.get("/whitepaper")
async def get_whitepaper() -> FileResponse:
    if not MASTER_PLAN_PATH.exists():
        raise HTTPException(status_code=404, detail="LONGRISE V8.9 master plan document is not available")
    return FileResponse(
        MASTER_PLAN_PATH,
        media_type="text/html; charset=utf-8",
        filename="LONGRISE_MasterPlan_V8_9_KO.html",
    )
