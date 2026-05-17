from decimal import Decimal

from apps.uploads.models import (
    SWIFTMessage,
    SSIInstruction,
    CashBalance,
    SecurityHolding,
    InvestigationResult,
    Trade,
)
from apps.uploads.services.audit_logger import AuditLogger


class InvestigationService:

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
            trade_reference=swift_message.related_ref or swift_message.transaction_ref
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
                or cash_balance.available_balance < swift_message.settlement_amount
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
        investigation = InvestigationResult.objects.create(
            swift_message=swift_message,
            root_cause=result["root_cause"],
            reason_category=result["reason_category"],
            severity=result["severity"],
            recommended_action=result["recommended_action"],
            investigation_data=result["details"],
        )

        AuditLogger.log_investigation_completed(investigation)

        return investigation