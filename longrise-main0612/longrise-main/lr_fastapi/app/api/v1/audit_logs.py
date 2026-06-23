"""
Audit Log API endpoints
"""
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_admin
from app.core.database import get_session
from app.models.audit_log import (
    AuditLog,
    AuditLogRead,
    SystemEvent,
    SystemEventRead,
    AuditAction,
    AuditResource
)
from app.models.admin import Admin, AdminRole
from app.services.audit_service import AuditService

router = APIRouter()


@router.get("/", response_model=List[AuditLogRead])
async def get_audit_logs(
    *,
    session: AsyncSession = Depends(get_session),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    admin_id: Optional[UUID] = Query(None, description="Filter by admin ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    resource: Optional[str] = Query(None, description="Filter by resource"),
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    ip_address: Optional[str] = Query(None, description="Filter by IP address"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    requires_review: Optional[bool] = Query(None, description="Filter by review requirement"),
    resource_id: Optional[str] = Query(None, description="Filter by resource ID"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> List[AuditLogRead]:
    """
    Get audit logs with filters (admin only)
    """
    try:
        audit_logs = await AuditService.get_audit_logs(
            session=session,
            skip=skip,
            limit=limit,
            admin_id=admin_id,
            action=action,
            resource=resource,
            status=status,
            start_date=start_date,
            end_date=end_date,
            ip_address=ip_address,
            risk_level=risk_level,
            requires_review=requires_review,
            resource_id=resource_id
        )
        return [AuditLogRead.model_validate(log) for log in audit_logs]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching audit logs: {str(e)}"
        )


@router.get("/system-events", response_model=List[SystemEventRead])
async def get_system_events(
    *,
    session: AsyncSession = Depends(get_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    event_type: Optional[str] = Query(None),
    event_source: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_admin: Admin = Depends(get_current_active_admin)
) -> List[SystemEventRead]:
    """
    Get system events with filters (admin only)
    """
    try:
        events = await AuditService.get_system_events(
            session=session,
            skip=skip,
            limit=limit,
            event_type=event_type,
            event_source=event_source,
            status=status,
            start_date=start_date,
            end_date=end_date
        )
        return [SystemEventRead.model_validate(event) for event in events]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching system events: {str(e)}"
        )


@router.get("/summary")
async def get_audit_summary(
    *,
    session: AsyncSession = Depends(get_session),
    days: int = Query(30, ge=1, le=365, description="Number of days to include in summary"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> dict:
    """
    Get audit log summary statistics (admin only)
    """
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        summary = await AuditService.get_audit_summary(
            session=session,
            start_date=start_date,
            end_date=end_date
        )

        return {
            "period": {
                "days": days,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching audit summary: {str(e)}"
        )


@router.get("/admin/{admin_id}/activity")
async def get_admin_activity(
    *,
    session: AsyncSession = Depends(get_session),
    admin_id: UUID,
    days: int = Query(30, ge=1, le=365),
    current_admin: Admin = Depends(get_current_active_admin)
) -> dict:
    """
    Get activity summary for a specific admin (admin only)
    """
    try:
        # Check if requesting admin has permission (for now, allow all admins)
        # In production, you might want to restrict this to super admins or self-requests

        activity = await AuditService.get_admin_activity(
            session=session,
            admin_id=admin_id,
            days=days
        )

        return activity

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching admin activity: {str(e)}"
        )


@router.put("/{audit_log_id}/review", response_model=AuditLogRead)
async def mark_for_review(
    *,
    session: AsyncSession = Depends(get_session),
    audit_log_id: UUID,
    current_admin: Admin = Depends(get_current_active_admin)
) -> AuditLogRead:
    """
    Mark an audit log for review (admin only)
    """
    try:
        audit_log = await AuditService.mark_for_review(
            session=session,
            audit_log_id=audit_log_id,
            admin_id=current_admin.id
        )

        if not audit_log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit log not found"
            )

        return AuditLogRead.model_validate(audit_log)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking audit log for review: {str(e)}"
        )


@router.post("/archive")
async def archive_old_logs(
    *,
    session: AsyncSession = Depends(get_session),
    days_old: int = Query(90, ge=30, description="Archive logs older than this many days"),
    batch_size: int = Query(1000, ge=100, le=10000, description="Batch size for archiving"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> dict:
    """
    Archive old audit logs (admin only)
    """
    try:
        # Only allow super admins to archive logs
        if current_admin.role != AdminRole.SUPER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admins can archive audit logs"
            )

        archive_date = datetime.utcnow() - timedelta(days=days_old)
        archived_count = await AuditService.archive_old_logs(
            session=session,
            older_than=archive_date,
            batch_size=batch_size
        )

        return {
            "archived_count": archived_count,
            "archive_date": archive_date.isoformat(),
            "days_old": days_old,
            "message": f"Successfully archived {archived_count} audit logs older than {days_old} days"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error archiving audit logs: {str(e)}"
        )


@router.get("/recent")
async def get_recent_activity(
    *,
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=200, description="Number of recent logs to return"),
    hours: int = Query(24, ge=1, le=168, description="Number of hours to look back"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> List[AuditLogRead]:
    """
    Get recent audit activity (admin only)
    """
    try:
        start_date = datetime.utcnow() - timedelta(hours=hours)

        audit_logs = await AuditService.get_audit_logs(
            session=session,
            skip=0,
            limit=limit,
            start_date=start_date
        )

        return [AuditLogRead.model_validate(log) for log in audit_logs]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching recent activity: {str(e)}"
        )


@router.get("/high-risk")
async def get_high_risk_events(
    *,
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=200),
    days: int = Query(7, ge=1, le=30, description="Number of days to look back"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> List[AuditLogRead]:
    """
    Get high-risk audit events (admin only)
    """
    try:
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get logs with high or critical risk level
        high_risk_logs = await AuditService.get_audit_logs(
            session=session,
            skip=0,
            limit=limit,
            start_date=start_date,
            risk_level="high"
        )

        critical_risk_logs = await AuditService.get_audit_logs(
            session=session,
            skip=0,
            limit=limit,
            start_date=start_date,
            risk_level="critical"
        )

        # Combine and sort by timestamp
        all_high_risk = high_risk_logs + critical_risk_logs
        all_high_risk.sort(key=lambda x: x.timestamp, reverse=True)

        # Limit results
        return [AuditLogRead.model_validate(log) for log in all_high_risk[:limit]]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching high-risk events: {str(e)}"
        )


@router.get("/pending-review")
async def get_pending_reviews(
    *,
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=200),
    current_admin: Admin = Depends(get_current_active_admin)
) -> List[AuditLogRead]:
    """
    Get audit logs pending review (admin only)
    """
    try:
        audit_logs = await AuditService.get_audit_logs(
            session=session,
            skip=0,
            limit=limit,
            requires_review=True
        )

        return [AuditLogRead.model_validate(log) for log in audit_logs]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending reviews: {str(e)}"
        )


@router.get("/export")
async def export_audit_logs(
    *,
    session: AsyncSession = Depends(get_session),
    start_date: datetime = Query(..., description="Start date for export"),
    end_date: datetime = Query(..., description="End date for export"),
    format: str = Query("json", regex="^(json|csv)$", description="Export format"),
    current_admin: Admin = Depends(get_current_active_admin)
) -> dict:
    """
    Export audit logs for compliance (admin only)
    """
    try:
        # Only allow super admins to export logs
        if current_admin.role != AdminRole.SUPER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admins can export audit logs"
            )

        # For now, return metadata about what would be exported
        # In production, you'd implement actual file generation and secure download

        audit_logs = await AuditService.get_audit_logs(
            session=session,
            skip=0,
            limit=10000,  # Large limit for export
            start_date=start_date,
            end_date=end_date
        )

        # Log the export action
        await AuditService.log_action(
            session=session,
            admin_id=current_admin.id,
            action="export",
            resource="audit_log",
            description=f"Exported {len(audit_logs)} audit logs from {start_date} to {end_date}",
            extra_data={
                "export_format": format,
                "record_count": len(audit_logs),
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        )

        return {
            "export_id": f"export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "record_count": len(audit_logs),
            "format": format,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "prepared",
            "message": f"Export prepared with {len(audit_logs)} records. In production, this would generate a secure download link."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting audit logs: {str(e)}"
        )