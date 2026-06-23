"""
Audit service for logging admin and system actions
"""
import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, text

from app.models.audit_log import (
    AuditLog,
    AuditLogCreate,
    SystemEvent,
    SystemEventCreate,
    AuditAction,
    AuditResource,
    AuditStatus
)


class AuditService:
    """Service for audit logging and system events"""

    @staticmethod
    async def log_action(
        session: AsyncSession,
        action: str,
        resource: str,
        resource_id: str = None,
        resource_name: str = None,
        admin_id: Optional[UUID] = None,
        admin_name: Optional[str] = None,
        admin_email: Optional[str] = None,
        status: str = "success",
        error_message: Optional[str] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        changes: Optional[Dict[str, Any]] = None,
        description: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_method: Optional[str] = None,
        request_path: Optional[str] = None,
        session_id: Optional[str] = None,
        request_id: Optional[str] = None,
        risk_level: str = "low",
        requires_review: bool = False,
        response_time_ms: Optional[int] = None,
        affected_records: Optional[int] = None
    ) -> AuditLog:
        """Log an admin or system action"""

        # Calculate changes if not provided
        if not changes and old_values and new_values:
            changes = {}
            for key in new_values:
                if key not in old_values or old_values[key] != new_values[key]:
                    changes[key] = {
                        "old": old_values.get(key),
                        "new": new_values[key]
                    }

        # Map string values to enums
        try:
            audit_action = AuditAction(action)
        except ValueError:
            audit_action = action  # Keep original if not in enum

        try:
            audit_resource = AuditResource(resource)
        except ValueError:
            audit_resource = resource  # Keep original if not in enum

        try:
            audit_status = AuditStatus(status)
        except ValueError:
            audit_status = AuditStatus.SUCCESS

        audit_id = uuid4()
        timestamp = datetime.utcnow()
        persisted_changes = {
            "changes": changes or {},
            "oldValues": old_values,
            "newValues": new_values,
            "description": description,
            "extraData": extra_data,
            "resourceName": resource_name,
            "adminEmail": admin_email,
            "userAgent": user_agent,
            "requestMethod": request_method,
            "requestPath": request_path,
            "sessionId": session_id,
            "requestId": request_id,
            "riskLevel": risk_level,
            "requiresReview": requires_review,
            "responseTimeMs": response_time_ms,
            "affectedRecords": affected_records,
        }
        await session.execute(
            text(
                """
                INSERT INTO audit_logs (
                    id, admin_id, admin_name, action, resource, resource_id,
                    changes, status, error_message, ip_address, timestamp
                )
                VALUES (
                    :id, :admin_id, :admin_name, :action, :resource, :resource_id,
                    CAST(:changes AS jsonb), :status, :error_message, CAST(:ip_address AS inet), :timestamp
                )
                """
            ),
            {
                "id": audit_id,
                "admin_id": admin_id,
                "admin_name": admin_name,
                "action": audit_action.value if hasattr(audit_action, "value") else str(audit_action),
                "resource": audit_resource.value if hasattr(audit_resource, "value") else str(audit_resource),
                "resource_id": resource_id,
                "changes": json.dumps(persisted_changes),
                "status": audit_status.value if hasattr(audit_status, "value") else str(audit_status),
                "error_message": error_message,
                "ip_address": ip_address,
                "timestamp": timestamp,
            },
        )
        await session.commit()

        audit_log = AuditLog(
            id=audit_id,
            admin_id=admin_id,
            admin_name=admin_name,
            admin_email=admin_email,
            action=audit_action,
            resource=audit_resource,
            resource_id=resource_id,
            resource_name=resource_name,
            status=audit_status,
            error_message=error_message,
            old_values=old_values,
            new_values=new_values,
            changes=changes,
            description=description,
            extra_data=extra_data,
            ip_address=ip_address,
            user_agent=user_agent,
            request_method=request_method,
            request_path=request_path,
            session_id=session_id,
            request_id=request_id,
            risk_level=risk_level,
            requires_review=requires_review,
            response_time_ms=response_time_ms,
            affected_records=affected_records,
            timestamp=timestamp,
        )
        return audit_log

    @staticmethod
    async def log_system_event(
        session: AsyncSession,
        event_type: str,
        event_source: str,
        event_data: Dict[str, Any],
        status: str = "completed",
        error_details: Optional[str] = None,
        duration_ms: Optional[int] = None,
        memory_usage_mb: Optional[float] = None
    ) -> SystemEvent:
        """Log a system event"""

        system_event = SystemEvent(
            event_type=event_type,
            event_source=event_source,
            event_data=event_data,
            status=status,
            error_details=error_details,
            duration_ms=duration_ms,
            memory_usage_mb=memory_usage_mb
        )

        session.add(system_event)
        await session.commit()
        await session.refresh(system_event)

        return system_event

    @staticmethod
    async def get_audit_logs(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        admin_id: Optional[UUID] = None,
        action: Optional[str] = None,
        resource: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        ip_address: Optional[str] = None,
        risk_level: Optional[str] = None,
        requires_review: Optional[bool] = None,
        resource_id: Optional[str] = None
    ) -> List[AuditLog]:
        """Get audit logs with filters"""
        query = select(AuditLog)

        # Apply filters
        conditions = []
        if admin_id:
            conditions.append(AuditLog.admin_id == admin_id)
        if action:
            conditions.append(AuditLog.action == action)
        if resource:
            conditions.append(AuditLog.resource == resource)
        if status:
            conditions.append(AuditLog.status == status)
        if start_date:
            conditions.append(AuditLog.timestamp >= start_date)
        if end_date:
            conditions.append(AuditLog.timestamp <= end_date)
        if ip_address:
            conditions.append(AuditLog.ip_address == ip_address)
        if risk_level:
            conditions.append(AuditLog.risk_level == risk_level)
        if requires_review is not None:
            conditions.append(AuditLog.requires_review == requires_review)
        if resource_id:
            conditions.append(AuditLog.resource_id == resource_id)

        if conditions:
            query = query.where(and_(*conditions))

        # Exclude archived logs by default
        query = query.where(AuditLog.archived == False)

        query = query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit)
        result = await session.exec(query)
        return result.all()

    @staticmethod
    async def get_system_events(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        event_type: Optional[str] = None,
        event_source: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[SystemEvent]:
        """Get system events with filters"""
        query = select(SystemEvent)

        # Apply filters
        conditions = []
        if event_type:
            conditions.append(SystemEvent.event_type == event_type)
        if event_source:
            conditions.append(SystemEvent.event_source == event_source)
        if status:
            conditions.append(SystemEvent.status == status)
        if start_date:
            conditions.append(SystemEvent.timestamp >= start_date)
        if end_date:
            conditions.append(SystemEvent.timestamp <= end_date)

        if conditions:
            query = query.where(and_(*conditions))

        query = query.order_by(desc(SystemEvent.timestamp)).offset(skip).limit(limit)
        result = await session.exec(query)
        return result.all()

    @staticmethod
    async def get_audit_summary(
        session: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get audit log summary statistics"""
        query = select(AuditLog)

        if start_date:
            query = query.where(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.where(AuditLog.timestamp <= end_date)

        result = await session.exec(query)
        logs = result.all()

        summary = {
            "total_logs": len(logs),
            "by_action": {},
            "by_resource": {},
            "by_status": {},
            "by_admin": {},
            "by_risk_level": {},
            "recent_activity": [],
            "high_risk_events": 0,
            "pending_reviews": 0,
            "failed_actions": 0,
            "unique_admins": set(),
            "unique_resources": set()
        }

        # Process logs
        for log in logs:
            # Count by action
            action_key = log.action.value if hasattr(log.action, 'value') else str(log.action)
            summary["by_action"][action_key] = summary["by_action"].get(action_key, 0) + 1

            # Count by resource
            resource_key = log.resource.value if hasattr(log.resource, 'value') else str(log.resource)
            summary["by_resource"][resource_key] = summary["by_resource"].get(resource_key, 0) + 1

            # Count by status
            status_key = log.status.value if hasattr(log.status, 'value') else str(log.status)
            summary["by_status"][status_key] = summary["by_status"].get(status_key, 0) + 1

            # Count by admin
            if log.admin_name:
                summary["by_admin"][log.admin_name] = summary["by_admin"].get(log.admin_name, 0) + 1
                summary["unique_admins"].add(log.admin_name)

            # Count by risk level
            summary["by_risk_level"][log.risk_level] = summary["by_risk_level"].get(log.risk_level, 0) + 1

            # Count special cases
            if log.risk_level in ["high", "critical"]:
                summary["high_risk_events"] += 1

            if log.requires_review:
                summary["pending_reviews"] += 1

            if log.status == AuditStatus.FAILED:
                summary["failed_actions"] += 1

            # Track unique resources
            if log.resource_id:
                summary["unique_resources"].add(log.resource_id)

        # Get recent activity (last 10)
        recent_logs = sorted(logs, key=lambda x: x.timestamp, reverse=True)[:10]
        summary["recent_activity"] = [
            {
                "timestamp": log.timestamp.isoformat(),
                "admin_name": log.admin_name,
                "action": log.action.value if hasattr(log.action, 'value') else str(log.action),
                "resource": log.resource.value if hasattr(log.resource, 'value') else str(log.resource),
                "resource_id": log.resource_id,
                "status": log.status.value if hasattr(log.status, 'value') else str(log.status),
                "description": log.description
            }
            for log in recent_logs
        ]

        # Convert sets to counts
        summary["unique_admins"] = len(summary["unique_admins"])
        summary["unique_resources"] = len(summary["unique_resources"])

        return summary

    @staticmethod
    async def mark_for_review(
        session: AsyncSession,
        audit_log_id: UUID,
        admin_id: UUID
    ) -> Optional[AuditLog]:
        """Mark an audit log for review"""
        result = await session.exec(select(AuditLog).where(AuditLog.id == audit_log_id))
        audit_log = result.first()

        if not audit_log:
            return None

        audit_log.requires_review = True
        session.add(audit_log)
        await session.commit()
        await session.refresh(audit_log)

        # Log this action
        await AuditService.log_action(
            session=session,
            admin_id=admin_id,
            action="update",
            resource="audit_log",
            resource_id=str(audit_log_id),
            new_values={"requires_review": True},
            description="Marked audit log for review"
        )

        return audit_log

    @staticmethod
    async def archive_old_logs(
        session: AsyncSession,
        older_than: datetime,
        batch_size: int = 1000
    ) -> int:
        """Archive old audit logs"""
        archived_count = 0

        while True:
            # Get a batch of old logs
            result = await session.exec(
                select(AuditLog)
                .where(and_(
                    AuditLog.timestamp < older_than,
                    AuditLog.archived == False
                ))
                .limit(batch_size)
            )
            logs = result.all()

            if not logs:
                break

            # Mark as archived
            for log in logs:
                log.archived = True
                log.archive_date = datetime.utcnow()
                session.add(log)

            await session.commit()
            archived_count += len(logs)

        # Log the archiving process
        if archived_count > 0:
            await AuditService.log_system_event(
                session=session,
                event_type="log_archiving",
                event_source="audit_service",
                event_data={
                    "archived_count": archived_count,
                    "older_than": older_than.isoformat(),
                    "batch_size": batch_size
                }
            )

        return archived_count

    @staticmethod
    async def get_admin_activity(
        session: AsyncSession,
        admin_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get activity summary for a specific admin"""
        start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = start_date.replace(day=start_date.day - days) if start_date.day > days else start_date.replace(month=start_date.month - 1, day=start_date.day + 30 - days)

        result = await session.exec(
            select(AuditLog).where(and_(
                AuditLog.admin_id == admin_id,
                AuditLog.timestamp >= start_date
            ))
        )
        logs = result.all()

        activity = {
            "admin_id": str(admin_id),
            "period_days": days,
            "total_actions": len(logs),
            "actions_by_type": {},
            "resources_affected": {},
            "daily_activity": {},
            "recent_actions": [],
            "risk_summary": {
                "high_risk_actions": 0,
                "failed_actions": 0,
                "actions_requiring_review": 0
            }
        }

        # Process activity
        for log in logs:
            action_key = log.action.value if hasattr(log.action, 'value') else str(log.action)
            resource_key = log.resource.value if hasattr(log.resource, 'value') else str(log.resource)
            date_key = log.timestamp.date().isoformat()

            # Count by action type
            activity["actions_by_type"][action_key] = activity["actions_by_type"].get(action_key, 0) + 1

            # Count by resource
            activity["resources_affected"][resource_key] = activity["resources_affected"].get(resource_key, 0) + 1

            # Count by day
            activity["daily_activity"][date_key] = activity["daily_activity"].get(date_key, 0) + 1

            # Risk analysis
            if log.risk_level in ["high", "critical"]:
                activity["risk_summary"]["high_risk_actions"] += 1
            if log.status == AuditStatus.FAILED:
                activity["risk_summary"]["failed_actions"] += 1
            if log.requires_review:
                activity["risk_summary"]["actions_requiring_review"] += 1

        # Get recent actions
        recent_logs = sorted(logs, key=lambda x: x.timestamp, reverse=True)[:20]
        activity["recent_actions"] = [
            {
                "timestamp": log.timestamp.isoformat(),
                "action": log.action.value if hasattr(log.action, 'value') else str(log.action),
                "resource": log.resource.value if hasattr(log.resource, 'value') else str(log.resource),
                "resource_id": log.resource_id,
                "status": log.status.value if hasattr(log.status, 'value') else str(log.status),
                "description": log.description
            }
            for log in recent_logs
        ]

        return activity
