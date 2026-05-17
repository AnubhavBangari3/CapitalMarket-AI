import re
from datetime import datetime
from decimal import Decimal, InvalidOperation

from apps.uploads.models import SWIFTMessage


class SwiftParser:
    MESSAGE_TYPE_METADATA = {
        "MT544": {"related_instruction": "MT540", "description": "Receive Free Confirmation", "settlement_direction": "RECEIVE", "payment_type": "FREE"},
        "MT545": {"related_instruction": "MT541", "description": "Receive Against Payment Confirmation", "settlement_direction": "RECEIVE", "payment_type": "AGAINST_PAYMENT"},
        "MT546": {"related_instruction": "MT542", "description": "Deliver Free Confirmation", "settlement_direction": "DELIVER", "payment_type": "FREE"},
        "MT547": {"related_instruction": "MT543", "description": "Deliver Against Payment Confirmation", "settlement_direction": "DELIVER", "payment_type": "AGAINST_PAYMENT"},
        "MT548": {"related_instruction": None, "description": "Settlement Status Advice", "settlement_direction": "UNKNOWN", "payment_type": "UNKNOWN"},
    }

    @staticmethod
    def detect_message_type(raw_message):
        match = re.search(r"\{2:I(\d{3})", raw_message)
        return f"MT{match.group(1)}" if match else "UNKNOWN"

    @staticmethod
    def extract_field(pattern, text, group=1):
        match = re.search(pattern, text, re.MULTILINE)
        return match.group(group).strip() if match else None

    @staticmethod
    def parse_date(date_str):
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, "%Y%m%d").date()
        except ValueError:
            return None

    @staticmethod
    def parse_decimal(value):
        if not value:
            return None
        try:
            return Decimal(value.replace(",", "").strip())
        except (InvalidOperation, AttributeError):
            return None

    @staticmethod
    def clean_bic(raw_bic):
        if not raw_bic:
            return None

        raw_bic = raw_bic.strip()

        if len(raw_bic) >= 12 and raw_bic[12:].isdigit():
            lt_address = raw_bic[:12]
            return lt_address[:8] + lt_address[9:12]

        if len(raw_bic) >= 12:
            return raw_bic[:11]

        if len(raw_bic) == 11:
            return raw_bic

        if len(raw_bic) == 8:
            return raw_bic + "XXX"

        return raw_bic

    @classmethod
    def parse(cls, uploaded_file, raw_message):
        message_type = cls.detect_message_type(raw_message)

        metadata = cls.MESSAGE_TYPE_METADATA.get(
            message_type,
            {
                "related_instruction": None,
                "description": "Unknown Message Type",
                "settlement_direction": "UNKNOWN",
                "payment_type": "UNKNOWN",
            },
        )

        sender_bic = cls.clean_bic(cls.extract_field(r"\{1:F01([A-Z0-9]+)", raw_message))
        receiver_bic = cls.clean_bic(cls.extract_field(r"\{2:I\d{3}([A-Z0-9]+)", raw_message))

        transaction_ref = cls.extract_field(r":20C::SEME//([^\n\r]+)", raw_message)
        related_ref = cls.extract_field(r":20C::RELA//([^\n\r]+)", raw_message)
        function_code = cls.extract_field(r":23G:([^\n\r]+)", raw_message)

        preparation_date = cls.parse_date(cls.extract_field(r":98A::PREP//(\d{8})", raw_message))
        trade_date = cls.parse_date(cls.extract_field(r":98A::TRAD//(\d{8})", raw_message))
        settlement_date = cls.parse_date(cls.extract_field(r":98A::SETT//(\d{8})", raw_message))

        settlement_status = cls.extract_field(r":25D::SETT//([^\n\r]+)", raw_message)
        matching_status = cls.extract_field(r":25D::MTCH//([^\n\r]+)", raw_message)

        reason_code = cls.extract_field(r":24B::FAIL//([^\n\r]+)", raw_message)
        narrative_reason = cls.extract_field(r":70D::REAS//([^\n\r]+)", raw_message)

        isin = cls.extract_field(r":35B:ISIN\s+([A-Z0-9]+)", raw_message)
        security_name = cls.extract_field(r":35B:ISIN\s+[A-Z0-9]+\s*\n([^\n\r]+)", raw_message)

        quantity_type = cls.extract_field(r":36B::([A-Z0-9]+)//", raw_message)
        quantity = cls.parse_decimal(
            cls.extract_field(r":36B::[A-Z0-9]+//UNIT/([\d,\.]+)", raw_message)
        )

        safekeeping_account = cls.extract_field(r":97A::SAFE//([^\n\r]+)", raw_message)
        delivering_agent = cls.extract_field(r":95P::DEAG//([^\n\r]+)", raw_message)
        receiving_agent = cls.extract_field(r":95P::REAG//([^\n\r]+)", raw_message)
        place_of_settlement = cls.extract_field(r":95P::PSET//([^\n\r]+)", raw_message)

        amount_match = re.search(
            r":19A::SETT//([A-Z]{3})([\d,\.]+)",
            raw_message,
            re.MULTILINE,
        )

        currency = None
        settlement_amount = None

        if amount_match:
            currency = amount_match.group(1)
            settlement_amount = cls.parse_decimal(amount_match.group(2))

        settlement_direction = metadata["settlement_direction"]
        payment_type = metadata["payment_type"]

        parsed_data = {
            "message_type": message_type,
            "related_instruction": metadata["related_instruction"],
            "description": metadata["description"],
            "sender_bic": sender_bic,
            "receiver_bic": receiver_bic,
            "transaction_ref": transaction_ref,
            "related_ref": related_ref,
            "function_code": function_code,
            "trade_date": str(trade_date) if trade_date else None,
            "settlement_date": str(settlement_date) if settlement_date else None,
            "preparation_date": str(preparation_date) if preparation_date else None,
            "isin": isin,
            "security_name": security_name,
            "quantity": str(quantity) if quantity is not None else None,
            "quantity_type": quantity_type,
            "safekeeping_account": safekeeping_account,
            "delivering_agent": delivering_agent,
            "receiving_agent": receiving_agent,
            "place_of_settlement": place_of_settlement,
            "settlement_amount": str(settlement_amount) if settlement_amount is not None else None,
            "currency": currency,
            "settlement_direction": settlement_direction,
            "payment_type": payment_type,
            "settlement_status": settlement_status,
            "matching_status": matching_status,
            "reason_code": reason_code,
            "narrative_reason": narrative_reason,
        }

        print("\n================ SWIFT PARSER DEBUG ================")
        print("Incoming message_type:", message_type)
        print("Incoming transaction_ref:", transaction_ref)
        print("Incoming related_ref:", related_ref)
        print("Incoming settlement_status:", settlement_status)
        print("Incoming isin:", isin)
        print("Incoming quantity:", quantity, type(quantity))
        print("Incoming settlement_amount:", settlement_amount, type(settlement_amount))
        print("Incoming currency:", currency)

        candidates = SWIFTMessage.objects.filter(
            message_type=message_type,
            transaction_ref=transaction_ref,
        )

        print("Candidate count by message_type + transaction_ref:", candidates.count())

        for candidate in candidates:
            print("----------------------------------------")
            print("Existing ID:", candidate.id)
            print("Existing message_type:", candidate.message_type)
            print("Existing transaction_ref:", candidate.transaction_ref)
            print("Existing related_ref:", candidate.related_ref)
            print("Existing settlement_status:", candidate.settlement_status)
            print("Existing isin:", candidate.isin)
            print("Existing quantity:", candidate.quantity, type(candidate.quantity))
            print("Existing settlement_amount:", candidate.settlement_amount, type(candidate.settlement_amount))
            print("Existing currency:", candidate.currency)

            print("Match related_ref:", candidate.related_ref == related_ref)
            print("Match settlement_status:", candidate.settlement_status == settlement_status)
            print("Match isin:", candidate.isin == isin)
            print("Match quantity:", candidate.quantity == quantity)
            print("Match settlement_amount:", candidate.settlement_amount == settlement_amount)
            print("Match currency:", candidate.currency == currency)

        existing_message = candidates.first()

        if existing_message:
            print("DUPLICATE FOUND. Returning existing ID:", existing_message.id)
            print("====================================================\n")
            existing_message.is_duplicate = True
            return existing_message

        print("NO DUPLICATE FOUND. Creating new SWIFTMessage.")
        print("====================================================\n")

        swift_message = SWIFTMessage.objects.create(
            uploaded_file=uploaded_file,
            message_type=message_type,
            sender_bic=sender_bic,
            receiver_bic=receiver_bic,
            transaction_ref=transaction_ref or f"{message_type}-UNKNOWN",
            related_ref=related_ref,
            function_code=function_code,
            trade_date=trade_date,
            settlement_date=settlement_date,
            preparation_date=preparation_date,
            isin=isin,
            security_name=security_name,
            quantity=quantity,
            quantity_type=quantity_type,
            safekeeping_account=safekeeping_account,
            delivering_agent=delivering_agent,
            receiving_agent=receiving_agent,
            place_of_settlement=place_of_settlement,
            settlement_amount=settlement_amount,
            currency=currency,
            settlement_direction=settlement_direction,
            payment_type=payment_type,
            settlement_status=settlement_status,
            matching_status=matching_status,
            reason_code=reason_code,
            narrative_reason=narrative_reason,
            raw_message=raw_message,
            parsed_json=parsed_data,
        )

        swift_message.is_duplicate = False
        return swift_message