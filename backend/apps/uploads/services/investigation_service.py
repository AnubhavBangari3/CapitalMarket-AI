from decimal import Decimal
import os
import json
import re

from dotenv import load_dotenv
from openai import AzureOpenAI

from apps.uploads.models import (
    SWIFTMessage,
    SSIInstruction,
    CashBalance,
    SecurityHolding,
    InvestigationResult,
    Trade,
)

from apps.uploads.services.audit_logger import AuditLogger
from apps.uploads.services.agent_workflow import AgentWorkflow

load_dotenv()


class InvestigationService:

    @staticmethod
    def _get_azure_client():
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        api_key = (
            os.getenv("AZURE_OPENAI_API_KEY_1")
        )
        api_version = os.getenv(
            "AZURE_OPENAI_API_VERSION",
            "2025-01-01-preview"
        )

        if not endpoint or not api_key:
            return None

        return AzureOpenAI(
            api_key=api_key,
            api_version=api_version,
            azure_endpoint=endpoint,
        )

    @staticmethod
    def _extract_json(content: str) -> dict:
        try:
            return json.loads(content)
        except Exception:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise

    @staticmethod
    def generate_ai_rca(swift_message: SWIFTMessage, result: dict) -> dict:
        client = InvestigationService._get_azure_client()
        deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")

        fallback = {
            "reasoning": (
                f"The settlement investigation identified {result['root_cause']} "
                f"as the primary issue for transaction {swift_message.transaction_ref}. "
                f"The case is categorized under {result['reason_category']} with "
                f"{result['severity']} severity."
            ),
            "risk_impact": (
                "Potential settlement delay, operational follow-up, reconciliation effort, "
                "and possible market/counterparty impact."
            ),
            "recommended_action": result["recommended_action"],
            "confidence_score": (
                90
                if result["reason_category"] in ["SSI", "CASH", "SECURITY"]
                else 75
            ),
            "azure_openai_used": False,
        }

        if not client or not deployment:
            return fallback

        prompt = f"""
You are a Capital Markets settlement operations RCA agent.

Analyze the failed settlement and generate an enterprise-grade root cause analysis.

SWIFT / Trade Context:
- Transaction Ref: {swift_message.transaction_ref}
- Related Ref: {swift_message.related_ref}
- Message Type: {swift_message.message_type}
- ISIN: {swift_message.isin}
- Security Name: {swift_message.security_name}
- Quantity: {swift_message.quantity}
- Settlement Amount: {swift_message.settlement_amount}
- Currency: {swift_message.currency}
- Settlement Direction: {swift_message.settlement_direction}
- Payment Type: {swift_message.payment_type}
- Settlement Status: {swift_message.settlement_status}
- Matching Status: {swift_message.matching_status}
- Reason Code: {swift_message.reason_code}
- Narrative Reason: {swift_message.narrative_reason}
- Safekeeping Account: {swift_message.safekeeping_account}
- Delivering Agent: {swift_message.delivering_agent}
- Receiving Agent: {swift_message.receiving_agent}
- Place of Settlement: {swift_message.place_of_settlement}

Rule Engine Finding:
- Root Cause: {result["root_cause"]}
- Category: {result["reason_category"]}
- Severity: {result["severity"]}
- Evidence: {json.dumps(result.get("details", {}), default=str)}
- Initial Recommended Action: {result["recommended_action"]}

Return JSON ONLY in this exact format:
{{
  "reasoning": "clear RCA explanation in 3-5 sentences",
  "risk_impact": "business/operations risk impact in 2-4 sentences",
  "recommended_action": "specific operational action",
  "confidence_score": 0
}}
"""

        try:
            response = client.chat.completions.create(
                model=deployment,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert AI agent for capital markets settlement "
                            "operations, SWIFT messages, SSI, cash, securities, and RCA."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                #temperature=0.2,
                max_completion_tokens=700,
            )

            content = response.choices[0].message.content
            parsed = InvestigationService._extract_json(content)

            return {
                "reasoning": parsed.get("reasoning") or fallback["reasoning"],
                "risk_impact": parsed.get("risk_impact") or fallback["risk_impact"],
                "recommended_action": (
                    parsed.get("recommended_action")
                    or fallback["recommended_action"]
                ),
                "confidence_score": (
                    parsed.get("confidence_score")
                    or fallback["confidence_score"]
                ),
                "azure_openai_used": True,
            }

        except Exception as error:
            fallback["reasoning"] = (
                f"{fallback['reasoning']} Azure OpenAI fallback used because: {str(error)}"
            )
            return fallback

    @staticmethod
    def investigate(swift_message: SWIFTMessage):

        existing_result = InvestigationResult.objects.filter(
            swift_message=swift_message
        ).first()

        if existing_result:
            return existing_result

        result = {
            "root_cause": "UNKNOWN",
            "reason_category": "UNKNOWN",
            "severity": "LOW",
            "recommended_action": "",
            "details": {},
        }

        trade = Trade.objects.filter(
            trade_reference=swift_message.related_ref
            or swift_message.transaction_ref
        ).first()

        ssi_exists = SSIInstruction.objects.filter(
            counterparty_bic=swift_message.receiver_bic,
            safekeeping_account=swift_message.safekeeping_account,
            place_of_settlement=swift_message.place_of_settlement,
            active=True,
        ).exists()

        if not ssi_exists:
            result["root_cause"] = "SSI Mismatch"
            result["reason_category"] = "SSI"
            result["severity"] = "HIGH"
            result["recommended_action"] = (
                "Validate settlement instruction setup "
                "for counterparty and PSET."
            )
            result["details"] = {
                "receiver_bic": swift_message.receiver_bic,
                "safekeeping_account": swift_message.safekeeping_account,
                "place_of_settlement": swift_message.place_of_settlement,
            }

            return InvestigationService._create_result(
                swift_message=swift_message,
                result=result,
            )

        should_check_cash = (
            swift_message.payment_type == "AGAINST_PAYMENT"
            and swift_message.settlement_amount
            and swift_message.settlement_direction == "RECEIVE"
        )

        if should_check_cash:
            cash_account = (
                trade.cash_account
                if trade and trade.cash_account
                else swift_message.safekeeping_account
            )

            cash_balance = CashBalance.objects.filter(
                account_number=cash_account,
                currency=swift_message.currency,
            ).first()

            if (
                not cash_balance
                or cash_balance.available_balance
                < swift_message.settlement_amount
            ):
                available = (
                    cash_balance.available_balance
                    if cash_balance
                    else Decimal("0")
                )

                shortage = swift_message.settlement_amount - available

                result["root_cause"] = "Insufficient Cash"
                result["reason_category"] = "CASH"
                result["severity"] = "CRITICAL"
                result["recommended_action"] = (
                    "Fund cash account immediately "
                    "to avoid settlement penalties."
                )
                result["details"] = {
                    "cash_account": cash_account,
                    "required_amount": str(swift_message.settlement_amount),
                    "available_balance": str(available),
                    "shortage_amount": str(shortage),
                    "currency": swift_message.currency,
                }

                return InvestigationService._create_result(
                    swift_message=swift_message,
                    result=result,
                )

        security_holding = SecurityHolding.objects.filter(
            isin=swift_message.isin,
            account_number=swift_message.safekeeping_account,
        ).first()

        if (
            not security_holding
            or security_holding.available_quantity < swift_message.quantity
        ):
            available_qty = (
                security_holding.available_quantity
                if security_holding
                else Decimal("0")
            )

            shortage_qty = swift_message.quantity - available_qty

            result["root_cause"] = "Insufficient Securities"
            result["reason_category"] = "SECURITY"
            result["severity"] = "HIGH"
            result["recommended_action"] = (
                "Acquire additional securities "
                "before settlement deadline."
            )
            result["details"] = {
                "required_quantity": str(swift_message.quantity),
                "available_quantity": str(available_qty),
                "shortage_quantity": str(shortage_qty),
                "isin": swift_message.isin,
            }

            return InvestigationService._create_result(
                swift_message=swift_message,
                result=result,
            )

        result["root_cause"] = "No Issue Detected"
        result["reason_category"] = "SUCCESS"
        result["severity"] = "LOW"
        result["recommended_action"] = "No operational action required."
        result["details"] = {}

        return InvestigationService._create_result(
            swift_message=swift_message,
            result=result,
        )

    @staticmethod
    def _create_result(swift_message: SWIFTMessage, result: dict):
        ai_rca = InvestigationService.generate_ai_rca(
            swift_message=swift_message,
            result=result,
        )

        agent_workflow = AgentWorkflow.run(
            swift_message=swift_message,
            rule_result={
                **result,
                "recommended_action": ai_rca["recommended_action"],
            },
        )

        investigation = InvestigationResult.objects.create(
            swift_message=swift_message,
            root_cause=result["root_cause"],
            reason_category=result["reason_category"],
            severity=result["severity"],
            ai_summary=ai_rca["reasoning"],
            recommended_action=ai_rca["recommended_action"],
            investigation_data={
                **result["details"],
                "risk_impact": ai_rca["risk_impact"],
                "confidence_score": ai_rca["confidence_score"],
                "azure_openai_used": ai_rca["azure_openai_used"],
                "agent_workflow": agent_workflow,
            },
        )

        AuditLogger.log_investigation_completed(investigation)

        return investigation