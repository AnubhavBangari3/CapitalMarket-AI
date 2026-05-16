from django.core.management.base import BaseCommand
from datetime import date

from apps.uploads.models import (
    Trade,
    SSIInstruction,
    SecurityHolding,
    CashBalance,
)


class Command(BaseCommand):
    help = "Seed realistic settlement dummy data"

    def handle(self, *args, **kwargs):

        self.stdout.write(self.style.WARNING("Deleting old data..."))

        Trade.objects.all().delete()
        SSIInstruction.objects.all().delete()
        SecurityHolding.objects.all().delete()
        CashBalance.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Creating Trades..."))

        trades = [
            {
                "trade_reference": "TRD1001",
                "isin": "US5949181045",
                "security_name": "MICROSOFT CORP",
                "quantity": 1000,
                "settlement_amount": 420000,
                "currency": "USD",
                "counterparty_bic": "GSUS33XXX",
                "settlement_direction": "RECEIVE",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "OPEN",
                "custody_account": "SAFE1001",
                "cash_account": "CASH1001",
            },

            {
                "trade_reference": "TRD1002",
                "isin": "US0378331005",
                "security_name": "APPLE INC",
                "quantity": 5000,
                "settlement_amount": 950000,
                "currency": "USD",
                "counterparty_bic": "CITIUS33XXX",
                "settlement_direction": "DELIVER",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "OPEN",
                "custody_account": "SAFE1002",
                "cash_account": "CASH1002",
            },

            {
                "trade_reference": "TRD1003",
                "isin": "US02079K3059",
                "security_name": "ALPHABET INC",
                "quantity": 3000,
                "settlement_amount": 1200000,
                "currency": "USD",
                "counterparty_bic": "BOFAUS3NXXX",
                "settlement_direction": "RECEIVE",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "OPEN",
                "custody_account": "SAFE1003",
                "cash_account": "CASH1003",
            },

            {
                "trade_reference": "TRD1004",
                "isin": "US0231351067",
                "security_name": "AMAZON COM INC",
                "quantity": 1500,
                "settlement_amount": 280000,
                "currency": "USD",
                "counterparty_bic": "JPMBUS33XXX",
                "settlement_direction": "DELIVER",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "OPEN",
                "custody_account": "SAFE1004",
                "cash_account": "CASH1004",
            },

            {
                "trade_reference": "TRD1005",
                "isin": "US88160R1014",
                "security_name": "TESLA INC",
                "quantity": 800,
                "settlement_amount": 144000,
                "currency": "USD",
                "counterparty_bic": "MSNYUS33XXX",
                "settlement_direction": "DELIVER",
                "payment_type": "FREE",
                "trade_status": "OPEN",
                "custody_account": "SAFE1005",
                "cash_account": "CASH1005",
            },

            {
                "trade_reference": "TRD1006",
                "isin": "US1912161007",
                "security_name": "COCA COLA CO",
                "quantity": 2000,
                "settlement_amount": 125000,
                "currency": "USD",
                "counterparty_bic": "CITIUS33XXX",
                "settlement_direction": "RECEIVE",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "SETTLED",
                "custody_account": "SAFE1006",
                "cash_account": "CASH1006",
            },

            {
                "trade_reference": "TRD1007",
                "isin": "US46625H1005",
                "security_name": "JPMORGAN CHASE",
                "quantity": 4000,
                "settlement_amount": 820000,
                "currency": "USD",
                "counterparty_bic": "JPMBUS33XXX",
                "settlement_direction": "DELIVER",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "OPEN",
                "custody_account": "SAFE1007",
                "cash_account": "CASH1007",
            },

            {
                "trade_reference": "TRD1008",
                "isin": "INE467B01029",
                "security_name": "TCS LTD",
                "quantity": 1000,
                "settlement_amount": 4200000,
                "currency": "INR",
                "counterparty_bic": "HDFCINBBXXX",
                "settlement_direction": "DELIVER",
                "payment_type": "FREE",
                "trade_status": "OPEN",
                "custody_account": "SAFE1008",
                "cash_account": "CASH1008",
            },

            {
                "trade_reference": "TRD1009",
                "isin": "INE009A01021",
                "security_name": "INFOSYS LTD",
                "quantity": 2500,
                "settlement_amount": 3750000,
                "currency": "INR",
                "counterparty_bic": "ICICINBBXXX",
                "settlement_direction": "RECEIVE",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "OPEN",
                "custody_account": "SAFE1009",
                "cash_account": "CASH1009",
            },

            {
                "trade_reference": "TRD1010",
                "isin": "US30303M1027",
                "security_name": "META PLATFORMS",
                "quantity": 1200,
                "settlement_amount": 600000,
                "currency": "USD",
                "counterparty_bic": "UBSWUS33XXX",
                "settlement_direction": "RECEIVE",
                "payment_type": "AGAINST_PAYMENT",
                "trade_status": "OPEN",
                "custody_account": "SAFE1010",
                "cash_account": "CASH1010",
            },
        ]

        for trade in trades:
            Trade.objects.create(
                trade_reference=trade["trade_reference"],
                isin=trade["isin"],
                security_name=trade["security_name"],
                trade_date=date(2026, 5, 15),
                settlement_date=date(2026, 5, 16),
                quantity=trade["quantity"],
                settlement_amount=trade["settlement_amount"],
                currency=trade["currency"],
                counterparty_bic=trade["counterparty_bic"],
                settlement_direction=trade["settlement_direction"],
                payment_type=trade["payment_type"],
                trade_status=trade["trade_status"],
                custody_account=trade["custody_account"],
                cash_account=trade["cash_account"],
            )

        self.stdout.write(self.style.SUCCESS("Creating SSI Instructions..."))

        SSIInstruction.objects.bulk_create([
            SSIInstruction(
                counterparty_bic="CITIUS33XXX",
                safekeeping_account="SAFE1002",
                delivering_agent="ICICINBBXXX",
                receiving_agent="CITIUS33XXX",
                place_of_settlement="DTCCUS33XXX",
                currency="USD",
                active=True,
                effective_from=date(2026, 1, 1),
            ),

            SSIInstruction(
                counterparty_bic="GSUS33XXX",
                safekeeping_account="SAFE1001",
                delivering_agent="HDFCINBBXXX",
                receiving_agent="GSUS33XXX",
                place_of_settlement="DTCCUS33XXX",
                currency="USD",
                active=True,
                effective_from=date(2026, 1, 1),
            ),

            SSIInstruction(
                counterparty_bic="HDFCINBBXXX",
                safekeeping_account="SAFE1008",
                delivering_agent="HDFCINBBXXX",
                receiving_agent="HDFCINBBXXX",
                place_of_settlement="NSDLINBBXXX",
                currency="INR",
                active=True,
                effective_from=date(2026, 1, 1),
            ),
        ])

        self.stdout.write(self.style.SUCCESS("Creating Security Holdings..."))

        SecurityHolding.objects.bulk_create([

            # Success
            SecurityHolding(
                isin="US5949181045",
                account_number="SAFE1001",
                available_quantity=10000,
                blocked_quantity=0,
                total_quantity=10000,
            ),

            # Insufficient securities
            SecurityHolding(
                isin="US0378331005",
                account_number="SAFE1002",
                available_quantity=2000,
                blocked_quantity=500,
                total_quantity=2500,
            ),

            # Cash shortage trade
            SecurityHolding(
                isin="US02079K3059",
                account_number="SAFE1003",
                available_quantity=10000,
                blocked_quantity=0,
                total_quantity=10000,
            ),

            # SSI mismatch trade
            SecurityHolding(
                isin="US0231351067",
                account_number="SAFE1004",
                available_quantity=5000,
                blocked_quantity=0,
                total_quantity=5000,
            ),

            # Partial settlement
            SecurityHolding(
                isin="US46625H1005",
                account_number="SAFE1007",
                available_quantity=2500,
                blocked_quantity=0,
                total_quantity=2500,
            ),

            # Indian security shortage
            SecurityHolding(
                isin="INE467B01029",
                account_number="SAFE1008",
                available_quantity=500,
                blocked_quantity=0,
                total_quantity=500,
            ),
        ])

        self.stdout.write(self.style.SUCCESS("Creating Cash Balances..."))

        CashBalance.objects.bulk_create([

            # Good balance
            CashBalance(
                account_number="CASH1001",
                currency="USD",
                available_balance=5000000,
                blocked_balance=100000,
            ),

            # Good balance
            CashBalance(
                account_number="CASH1002",
                currency="USD",
                available_balance=3000000,
                blocked_balance=50000,
            ),

            # Cash shortage
            CashBalance(
                account_number="CASH1003",
                currency="USD",
                available_balance=300000,
                blocked_balance=50000,
            ),

            # SSI mismatch trade
            CashBalance(
                account_number="CASH1004",
                currency="USD",
                available_balance=2000000,
                blocked_balance=100000,
            ),

            # Indian cash
            CashBalance(
                account_number="CASH1008",
                currency="INR",
                available_balance=1000000,
                blocked_balance=200000,
            ),
        ])

        self.stdout.write(
            self.style.SUCCESS(
                "Realistic settlement dummy data created successfully."
            )
        )