from typing import Optional

from apps.uploads.models import (
    AuditLog,
    SWIFTMessage,
    InvestigationResult,
    OrchestratedAction,
)


class AuditLogger:
    """
    Central audit logging service.

    Every important AI/platform action should be logged here:
    - upload processing
    - AI investigation
    - Jira creation
    - Teams alert
    - Email escalation
    - failures/skips
    """

    @staticmethod
    def log(
        *,
        action: str,
        system: str,
        status: str = "SUCCESS",
        swift_message: Optional[SWIFTMessage] = None,
        investigation_result: Optional[InvestigationResult] = None,
        orchestrated_action: Optional[OrchestratedAction] = None,
        severity: Optional[str] = None,
        message: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> AuditLog:
        return AuditLog.objects.create(
            swift_message=swift_message,
            investigation_result=investigation_result,
            orchestrated_action=orchestrated_action,
            action=action,
            system=system,
            status=status,
            severity=severity,
            message=message,
            metadata=metadata or {},
        )

    @staticmethod
    def log_investigation_completed(
        investigation_result: InvestigationResult,
    ) -> AuditLog:
        swift_message = investigation_result.swift_message

        return AuditLogger.log(
            swift_message=swift_message,
            investigation_result=investigation_result,
            action="Investigation completed",
            system="AI_ENGINE",
            status="SUCCESS",
            severity=investigation_result.severity,
            message=(
                f"AI investigation completed for "
                f"{swift_message.transaction_ref}. "
                f"Root cause: {investigation_result.root_cause}."
            ),
            metadata={
                "transaction_ref": swift_message.transaction_ref,
                "message_type": swift_message.message_type,
                "root_cause": investigation_result.root_cause,
                "reason_category": investigation_result.reason_category,
                "severity": investigation_result.severity,
                "recommended_action": investigation_result.recommended_action,
                "investigation_data": investigation_result.investigation_data,
            },
        )

    @staticmethod
    def log_orchestrated_action(
        orchestrated_action: OrchestratedAction,
    ) -> AuditLog:
        investigation = orchestrated_action.investigation_result
        swift_message = investigation.swift_message

        readable_action = {
            "CREATE_JIRA_TICKET": "Jira ticket created",
            "SEND_TEAMS_ALERT": "Teams alert sent",
            "SEND_EMAIL_ESCALATION": "Email escalation sent",
        }.get(
            orchestrated_action.action_type,
            orchestrated_action.action_type
        )

        return AuditLogger.log(
            swift_message=swift_message,
            investigation_result=investigation,
            orchestrated_action=orchestrated_action,
            action=readable_action,
            system=orchestrated_action.target_system,
            status="SUCCESS",
            severity=orchestrated_action.severity,
            message=orchestrated_action.title,
            metadata={
                "transaction_ref": swift_message.transaction_ref,
                "action_type": orchestrated_action.action_type,
                "target_system": orchestrated_action.target_system,
                "external_reference": orchestrated_action.external_reference,
                "payload": orchestrated_action.payload,
            },
        )

    @staticmethod
    def log_duplicate_message(swift_message: SWIFTMessage) -> AuditLog:
        return AuditLogger.log(
            swift_message=swift_message,
            action="Duplicate SWIFT message detected",
            system="UPLOAD",
            status="SKIPPED",
            severity="LOW",
            message=(
                f"Duplicate message skipped for "
                f"{swift_message.transaction_ref}."
            ),
            metadata={
                "transaction_ref": swift_message.transaction_ref,
                "message_type": swift_message.message_type,
                "isin": swift_message.isin,
            },
        )

    @staticmethod
    def log_upload_failed(
        *,
        action: str,
        error: Exception,
        swift_message: Optional[SWIFTMessage] = None,
    ) -> AuditLog:
        return AuditLogger.log(
            swift_message=swift_message,
            action=action,
            system="UPLOAD",
            status="FAILED",
            severity="HIGH",
            message=str(error),
            metadata={
                "error": str(error),
                "error_type": error.__class__.__name__,
            },
        )