from decimal import Decimal


class AgentWorkflow:
    """
    Semantic Kernel style multi-agent workflow for hackathon MVP.

    Agents:
    1. Planner Agent
    2. Data Validation Agent
    3. RCA Agent
    4. Risk Agent
    5. Action Agent
    6. Audit Agent

    This is deterministic now.
    Azure OpenAI can replace RCA reasoning in Step 11.
    """

    @staticmethod
    def run(*, swift_message, rule_result: dict) -> dict:
        agents = [
            AgentWorkflow._planner_agent(swift_message),
            AgentWorkflow._data_validation_agent(swift_message, rule_result),
            AgentWorkflow._rca_agent(swift_message, rule_result),
            AgentWorkflow._risk_agent(swift_message, rule_result),
            AgentWorkflow._action_agent(swift_message, rule_result),
            AgentWorkflow._audit_agent(swift_message, rule_result),
        ]

        final_summary = (
            f"The multi-agent workflow investigated transaction "
            f"{swift_message.transaction_ref}. "
            f"The RCA Agent identified {rule_result['root_cause']} as the primary root cause. "
            f"The Risk Agent classified this case as {rule_result['severity']} severity. "
            f"The Action Agent recommended: {rule_result['recommended_action']}"
        )

        return {
            "workflow_name": "Semantic Kernel Settlement Investigation Workflow",
            "workflow_type": "multi_agent_orchestration",
            "agentic_mode": "semantic_kernel_style_deterministic",
            "confidence_score": AgentWorkflow._confidence_score(rule_result),
            "final_agent_summary": final_summary,
            "agents": agents,
        }

    @staticmethod
    def _planner_agent(swift_message) -> dict:
        return {
            "agent_name": "Planner Agent",
            "role": "Plans investigation workflow",
            "status": "COMPLETED",
            "reasoning": (
                f"Received {swift_message.message_type} for transaction "
                f"{swift_message.transaction_ref}. Planned investigation across "
                f"trade matching, SSI validation, cash balance, securities holding, "
                f"risk classification, and escalation systems."
            ),
            "output": {
                "planned_steps": [
                    "Parse SWIFT settlement message",
                    "Validate transaction reference",
                    "Check SSI setup",
                    "Check cash balance",
                    "Check securities holding",
                    "Generate RCA",
                    "Decide Jira / Teams / Email actions",
                    "Write audit trail",
                ],
                "transaction_ref": swift_message.transaction_ref,
                "message_type": swift_message.message_type,
            },
        }

    @staticmethod
    def _data_validation_agent(swift_message, rule_result: dict) -> dict:
        return {
            "agent_name": "Data Validation Agent",
            "role": "Validates settlement data",
            "status": "COMPLETED",
            "reasoning": (
                "Validated parsed SWIFT fields including ISIN, quantity, "
                "settlement amount, safekeeping account, settlement direction, "
                "payment type, and settlement status."
            ),
            "output": {
                "isin": swift_message.isin,
                "quantity": str(swift_message.quantity) if swift_message.quantity is not None else None,
                "settlement_amount": str(swift_message.settlement_amount) if swift_message.settlement_amount is not None else None,
                "currency": swift_message.currency,
                "settlement_status": swift_message.settlement_status,
                "evidence": rule_result.get("details", {}),
            },
        }

    @staticmethod
    def _rca_agent(swift_message, rule_result: dict) -> dict:
        return {
            "agent_name": "RCA Agent",
            "role": "Generates root cause analysis",
            "status": "COMPLETED",
            "reasoning": (
                f"Analyzed settlement message, trade reference, SSI setup, "
                f"cash balance, and securities holding. Root cause identified: "
                f"{rule_result['root_cause']}."
            ),
            "output": {
                "root_cause": rule_result["root_cause"],
                "reason_category": rule_result["reason_category"],
                "recommended_action": rule_result["recommended_action"],
                "evidence": rule_result.get("details", {}),
            },
        }

    @staticmethod
    def _risk_agent(swift_message, rule_result: dict) -> dict:
        amount = swift_message.settlement_amount or Decimal("0")

        return {
            "agent_name": "Risk Agent",
            "role": "Classifies operational risk",
            "status": "COMPLETED",
            "reasoning": (
                f"Classified case as {rule_result['severity']} based on "
                f"root cause category, settlement impact, and transaction value."
            ),
            "output": {
                "severity": rule_result["severity"],
                "risk_category": rule_result["reason_category"],
                "settlement_amount": str(amount),
                "currency": swift_message.currency,
            },
        }

    @staticmethod
    def _action_agent(swift_message, rule_result: dict) -> dict:
        severity = rule_result["severity"]
        category = rule_result["reason_category"]

        selected_actions = []

        if category == "SUCCESS":
            selected_actions.append("No external escalation required")
        else:
            selected_actions.append("Create Jira incident")
            selected_actions.append("Generate email escalation")

            if severity in ["HIGH", "CRITICAL"]:
                selected_actions.append("Send Microsoft Teams alert")

        return {
            "agent_name": "Action Agent",
            "role": "Decides cross-system orchestration",
            "status": "COMPLETED",
            "reasoning": (
                f"Selected actions based on category {category} and severity {severity}."
            ),
            "output": {
                "selected_actions": selected_actions,
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
                f"Prepared traceable audit record for transaction "
                f"{swift_message.transaction_ref}."
            ),
            "output": {
                "audit_required": True,
                "systems_to_log": [
                    "UPLOAD",
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