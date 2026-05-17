from apps.uploads.models import InvestigationResult, OrchestratedAction
from apps.uploads.services.audit_logger import AuditLogger


class ActionOrchestrator:

    @staticmethod
    def orchestrate(investigation: InvestigationResult):
        """
        Mock action orchestrator for hackathon demo.

        This simulates:
        1. Jira ticket creation
        2. Microsoft Teams alert
        3. Email escalation

        No real external API call yet.
        """

        if not investigation:
            return []

        existing_actions = OrchestratedAction.objects.filter(
            investigation_result=investigation
        )

        if existing_actions.exists():
            return list(existing_actions)

        root_cause = investigation.root_cause
        category = investigation.reason_category
        severity = investigation.severity
        swift_message = investigation.swift_message

        actions_to_create = ActionOrchestrator._decide_actions(
            investigation=investigation
        )

        created_actions = []

        for action in actions_to_create:
            created_action = OrchestratedAction.objects.create(
                investigation_result=investigation,
                action_type=action["action_type"],
                target_system=action["target_system"],
                title=action["title"],
                description=action["description"],
                severity=severity,
                status="COMPLETED",
                external_reference=action["external_reference"],
                payload={
                    "transaction_ref": swift_message.transaction_ref,
                    "message_type": swift_message.message_type,
                    "isin": swift_message.isin,
                    "security_name": swift_message.security_name,
                    "root_cause": root_cause,
                    "reason_category": category,
                    "severity": severity,
                    "recommended_action": investigation.recommended_action,
                    "mocked": True,
                },
            )

            AuditLogger.log_orchestrated_action(created_action)

            created_actions.append(created_action)

        return created_actions

    @staticmethod
    def _decide_actions(investigation: InvestigationResult):
        swift_message = investigation.swift_message

        transaction_ref = swift_message.transaction_ref
        root_cause = investigation.root_cause
        category = investigation.reason_category
        severity = investigation.severity

        actions = []

        if category == "SUCCESS":
            return [
                {
                    "action_type": "SEND_EMAIL_ESCALATION",
                    "target_system": "EMAIL",
                    "title": f"No action required for {transaction_ref}",
                    "description": (
                        f"Settlement investigation completed for {transaction_ref}. "
                        "No operational issue was detected."
                    ),
                    "external_reference": f"EMAIL-NOOP-{transaction_ref}",
                }
            ]

        jira_priority = "P1" if severity == "CRITICAL" else "P2"

        actions.append(
            {
                "action_type": "CREATE_JIRA_TICKET",
                "target_system": "JIRA",
                "title": f"{jira_priority} Settlement Failure - {transaction_ref}",
                "description": (
                    f"Auto-created incident for settlement failure.\n\n"
                    f"Transaction Ref: {transaction_ref}\n"
                    f"Root Cause: {root_cause}\n"
                    f"Category: {category}\n"
                    f"Severity: {severity}\n"
                    f"Recommended Action: {investigation.recommended_action}"
                ),
                "external_reference": f"JIRA-{transaction_ref}-{category}",
            }
        )

        if severity in ["HIGH", "CRITICAL"]:
            actions.append(
                {
                    "action_type": "SEND_TEAMS_ALERT",
                    "target_system": "TEAMS",
                    "title": f"Settlement Alert - {transaction_ref}",
                    "description": (
                        f"Teams alert sent to Operations channel.\n\n"
                        f"{transaction_ref} failed due to {root_cause}. "
                        f"Severity is {severity}."
                    ),
                    "external_reference": f"TEAMS-{transaction_ref}",
                }
            )

        actions.append(
            {
                "action_type": "SEND_EMAIL_ESCALATION",
                "target_system": "EMAIL",
                "title": f"Escalation Email - {transaction_ref}",
                "description": (
                    f"Email escalation generated for Ops/Treasury team.\n\n"
                    f"Transaction: {transaction_ref}\n"
                    f"Root Cause: {root_cause}\n"
                    f"Action Needed: {investigation.recommended_action}"
                ),
                "external_reference": f"EMAIL-{transaction_ref}",
            }
        )

        return actions