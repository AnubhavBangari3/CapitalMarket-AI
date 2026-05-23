from decimal import Decimal


class AgentWorkflow:
    """
    Semantic Kernel style multi-agent workflow.

    This is a deterministic agent workflow for hackathon MVP.
    Later, Azure OpenAI / Semantic Kernel can replace the reasoning text
    without changing the rest of the backend.
    """

    @staticmethod
    def run(*, swift_message, rule_result: dict) -> dict:
        planner_output = AgentWorkflow._planner_agent(swift_message)
        rca_output = AgentWorkflow._rca_agent(swift_message, rule_result)
        risk_output = AgentWorkflow._risk_agent(swift_message, rule_result)
        action_output = AgentWorkflow._action_agent(swift_message, rule_result)
        audit_output = AgentWorkflow._audit_agent(swift_message, rule_result)

        final_summary = (
            f"The AI agent investigated transaction "
            f"{swift_message.transaction_ref} and identified "
            f"{rule_result['root_cause']} as the primary root cause. "
            f"The case is classified as {rule_result['severity']} severity. "
            f"Recommended action: {rule_result['recommended_action']}"
        )

        return {
            "workflow_name": "Semantic Kernel Settlement Investigation Workflow",
            "agentic_mode": "deterministic_semantic_kernel_style",
            "confidence_score": AgentWorkflow._confidence_score(rule_result),
            "final_agent_summary": final_summary,
            "agents": [
                planner_output,
                rca_output,
                risk_output,
                action_output,
                audit_output,
            ],
        }

    @staticmethod
    def _planner_agent(swift_message) -> dict:
        checks = [
            "Validate SWIFT settlement status",
            "Match transaction against internal trade record",
            "Check SSI setup",
            "Check cash availability",
            "Check securities availability",
            "Decide escalation path",
        ]

        return {
            "agent_name": "Planner Agent",
            "role": "Creates investigation plan",
            "status": "COMPLETED",
            "reasoning": (
                f"Settlement message {swift_message.message_type} was received "
                f"for transaction {swift_message.transaction_ref}. "
                f"The agent planned operational checks across trade, SSI, cash, "
                f"securities, and escalation systems."
            ),
            "output": {
                "planned_checks": checks,
                "transaction_ref": swift_message.transaction_ref,
                "message_type": swift_message.message_type,
            },
        }

    @staticmethod
    def _rca_agent(swift_message, rule_result: dict) -> dict:
        return {
            "agent_name": "RCA Agent",
            "role": "Generates root cause analysis",
            "status": "COMPLETED",
            "reasoning": (
                f"The RCA agent analyzed SWIFT fields, settlement status, "
                f"trade data, SSI records, balances, and holdings. "
                f"It determined that the root cause is "
                f"{rule_result['root_cause']}."
            ),
            "output": {
                "root_cause": rule_result["root_cause"],
                "reason_category": rule_result["reason_category"],
                "evidence": rule_result.get("details", {}),
            },
        }

    @staticmethod
    def _risk_agent(swift_message, rule_result: dict) -> dict:
        amount = swift_message.settlement_amount or Decimal("0")
        severity = rule_result["severity"]

        return {
            "agent_name": "Risk Agent",
            "role": "Classifies operational risk",
            "status": "COMPLETED",
            "reasoning": (
                f"The risk agent classified the case as {severity} based on "
                f"root cause category, settlement impact, and transaction value."
            ),
            "output": {
                "severity": severity,
                "settlement_amount": str(amount),
                "currency": swift_message.currency,
                "risk_category": rule_result["reason_category"],
            },
        }

    @staticmethod
    def _action_agent(swift_message, rule_result: dict) -> dict:
        severity = rule_result["severity"]
        category = rule_result["reason_category"]

        actions = []

        if category == "SUCCESS":
            actions.append("No external escalation required")
        else:
            actions.append("Create Jira incident")
            actions.append("Send email escalation")

            if severity in ["HIGH", "CRITICAL"]:
                actions.append("Send Microsoft Teams alert")

        return {
            "agent_name": "Action Agent",
            "role": "Decides cross-system orchestration",
            "status": "COMPLETED",
            "reasoning": (
                f"The action agent selected operational actions based on "
                f"severity {severity} and category {category}."
            ),
            "output": {
                "selected_actions": actions,
                "recommended_action": rule_result["recommended_action"],
            },
        }

    @staticmethod
    def _audit_agent(swift_message, rule_result: dict) -> dict:
        return {
            "agent_name": "Audit Agent",
            "role": "Creates compliance trace",
            "status": "COMPLETED",
            "reasoning": (
                f"The audit agent prepared a traceable decision record for "
                f"transaction {swift_message.transaction_ref}."
            ),
            "output": {
                "audit_required": True,
                "systems_to_log": [
                    "AI_ENGINE",
                    "ORCHESTRATOR",
                    "JIRA",
                    "TEAMS",
                    "EMAIL",
                ],
            },
        }

    @staticmethod
    def _confidence_score(rule_result: dict) -> int:
        category = rule_result.get("reason_category")

        if category in ["SSI", "CASH", "SECURITY"]:
            return 92

        if category == "SUCCESS":
            return 88

        return 70