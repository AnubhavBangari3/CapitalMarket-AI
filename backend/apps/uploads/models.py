from django.db import models


class UploadedSwiftFile(models.Model):
    STATUS_CHOICES = [
        ("uploaded", "Uploaded"),
        ("processing", "Processing"),
        ("parsed", "Parsed"),
        ("failed", "Failed"),
    ]

    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to="swift_uploads/")
    file_type = models.CharField(max_length=20)
    file_size = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="uploaded"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_filename


class SWIFTMessage(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ("MT540", "MT540 Receive Free"),
        ("MT541", "MT541 Receive Against Payment"),
        ("MT542", "MT542 Deliver Free"),
        ("MT543", "MT543 Deliver Against Payment"),
        ("MT544", "MT544 Receive Free Confirmation"),
        ("MT545", "MT545 Receive Against Payment Confirmation"),
        ("MT546", "MT546 Deliver Free Confirmation"),
        ("MT547", "MT547 Deliver Against Payment Confirmation"),
        ("MT548", "MT548 Settlement Status Advice"),
    ]

    SETTLEMENT_DIRECTION_CHOICES = [
        ("RECEIVE", "Receive"),
        ("DELIVER", "Deliver"),
        ("UNKNOWN", "Unknown"),
    ]

    PAYMENT_TYPE_CHOICES = [
        ("FREE", "Free of Payment"),
        ("AGAINST_PAYMENT", "Against Payment"),
        ("UNKNOWN", "Unknown"),
    ]

    uploaded_file = models.ForeignKey(
        UploadedSwiftFile,
        on_delete=models.CASCADE,
        related_name="swift_messages"
    )

    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES)

    sender_bic = models.CharField(max_length=20, blank=True, null=True)
    receiver_bic = models.CharField(max_length=20, blank=True, null=True)

    transaction_ref = models.CharField(max_length=100, db_index=True)
    related_ref = models.CharField(max_length=100, blank=True, null=True)

    function_code = models.CharField(max_length=20, blank=True, null=True)

    trade_date = models.DateField(blank=True, null=True)
    settlement_date = models.DateField(blank=True, null=True)
    preparation_date = models.DateField(blank=True, null=True)

    isin = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    security_name = models.CharField(max_length=255, blank=True, null=True)

    quantity = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        blank=True,
        null=True
    )

    quantity_type = models.CharField(max_length=20, blank=True, null=True)

    safekeeping_account = models.CharField(max_length=100, blank=True, null=True)

    delivering_agent = models.CharField(max_length=20, blank=True, null=True)
    receiving_agent = models.CharField(max_length=20, blank=True, null=True)
    place_of_settlement = models.CharField(max_length=20, blank=True, null=True)

    settlement_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        blank=True,
        null=True
    )

    currency = models.CharField(max_length=3, blank=True, null=True)

    settlement_direction = models.CharField(
        max_length=20,
        choices=SETTLEMENT_DIRECTION_CHOICES,
        default="UNKNOWN"
    )

    payment_type = models.CharField(
        max_length=30,
        choices=PAYMENT_TYPE_CHOICES,
        default="UNKNOWN"
    )

    settlement_status = models.CharField(max_length=50, blank=True, null=True)
    matching_status = models.CharField(max_length=50, blank=True, null=True)

    reason_code = models.CharField(max_length=50, blank=True, null=True)
    narrative_reason = models.TextField(blank=True, null=True)

    raw_message = models.TextField()
    parsed_json = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.message_type} - {self.transaction_ref}"


class Trade(models.Model):
    TRADE_STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("SETTLED", "Settled"),
        ("FAILED", "Failed"),
        ("CANCELLED", "Cancelled"),
    ]

    SETTLEMENT_DIRECTION_CHOICES = [
        ("RECEIVE", "Receive"),
        ("DELIVER", "Deliver"),
    ]

    PAYMENT_TYPE_CHOICES = [
        ("FREE", "Free of Payment"),
        ("AGAINST_PAYMENT", "Against Payment"),
    ]

    trade_reference = models.CharField(
        max_length=100,
        unique=True,
        db_index=True
    )

    isin = models.CharField(max_length=20, db_index=True)
    security_name = models.CharField(max_length=255)

    trade_date = models.DateField()
    settlement_date = models.DateField()

    quantity = models.DecimalField(max_digits=20, decimal_places=4)

    settlement_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        blank=True,
        null=True
    )

    currency = models.CharField(max_length=3, default="USD")

    counterparty_bic = models.CharField(max_length=20)

    custody_account = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    cash_account = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    settlement_direction = models.CharField(
        max_length=20,
        choices=SETTLEMENT_DIRECTION_CHOICES
    )

    payment_type = models.CharField(
        max_length=30,
        choices=PAYMENT_TYPE_CHOICES
    )

    trade_status = models.CharField(
        max_length=20,
        choices=TRADE_STATUS_CHOICES,
        default="OPEN"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.trade_reference


class SSIInstruction(models.Model):
    counterparty_bic = models.CharField(max_length=20, db_index=True)

    safekeeping_account = models.CharField(max_length=100)

    delivering_agent = models.CharField(max_length=20, blank=True, null=True)
    receiving_agent = models.CharField(max_length=20, blank=True, null=True)
    place_of_settlement = models.CharField(max_length=20)

    currency = models.CharField(max_length=3, default="USD")

    active = models.BooleanField(default=True)

    effective_from = models.DateField()
    effective_to = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.counterparty_bic} - {self.place_of_settlement}"


class SecurityHolding(models.Model):
    isin = models.CharField(max_length=20, db_index=True)

    account_number = models.CharField(max_length=100)

    available_quantity = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        default=0
    )

    blocked_quantity = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        default=0
    )

    total_quantity = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        default=0
    )

    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.isin} - {self.account_number}"


class CashBalance(models.Model):
    account_number = models.CharField(max_length=100)

    currency = models.CharField(max_length=3)

    available_balance = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    blocked_balance = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0
    )

    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_number} - {self.currency}"
    
class InvestigationResult(models.Model):

    SEVERITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    ]

    swift_message = models.OneToOneField(
        SWIFTMessage,
        on_delete=models.CASCADE,
        related_name="investigation_result"
    )

    root_cause = models.CharField(max_length=255)

    reason_category = models.CharField(max_length=100)

    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default="MEDIUM"
    )

    investigation_status = models.CharField(
        max_length=50,
        default="COMPLETED"
    )

    ai_summary = models.TextField(blank=True, null=True)

    recommended_action = models.TextField(blank=True, null=True)

    investigation_data = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.swift_message.transaction_ref} - {self.root_cause}"