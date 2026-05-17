from rest_framework import serializers

from .models import (
    UploadedSwiftFile,
    Trade,
    InvestigationResult,
    OrchestratedAction,
    AuditLog,
)


class UploadedSwiftFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedSwiftFile
        fields = [
            "id",
            "original_filename",
            "file",
            "file_type",
            "file_size",
            "status",
            "uploaded_at",
        ]
        read_only_fields = [
            "id",
            "original_filename",
            "file_type",
            "file_size",
            "status",
            "uploaded_at",
        ]

    def create(self, validated_data):
        uploaded_file = validated_data["file"]

        return UploadedSwiftFile.objects.create(
            original_filename=uploaded_file.name,
            file=uploaded_file,
            file_type=uploaded_file.name.split(".")[-1].lower(),
            file_size=uploaded_file.size,
            status="uploaded",
        )


class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = [
            "id",
            "trade_reference",
            "isin",
            "security_name",
            "trade_date",
            "settlement_date",
            "quantity",
            "settlement_amount",
            "currency",
            "counterparty_bic",
            "custody_account",
            "cash_account",
            "settlement_direction",
            "payment_type",
            "trade_status",
            "created_at",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    transaction_ref = serializers.CharField(
        source="swift_message.transaction_ref",
        read_only=True
    )
    message_type = serializers.CharField(
        source="swift_message.message_type",
        read_only=True
    )
    root_cause = serializers.CharField(
        source="investigation_result.root_cause",
        read_only=True
    )

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "transaction_ref",
            "message_type",
            "root_cause",
            "action",
            "system",
            "status",
            "severity",
            "message",
            "metadata",
            "created_at",
        ]


class OrchestratedActionSerializer(serializers.ModelSerializer):
    audit_logs = AuditLogSerializer(many=True, read_only=True)

    class Meta:
        model = OrchestratedAction
        fields = [
            "id",
            "action_type",
            "target_system",
            "title",
            "description",
            "severity",
            "status",
            "external_reference",
            "payload",
            "audit_logs",
            "created_at",
        ]


class InvestigationResultSerializer(serializers.ModelSerializer):
    orchestrated_actions = OrchestratedActionSerializer(many=True, read_only=True)
    audit_logs = AuditLogSerializer(many=True, read_only=True)

    swift_message_id = serializers.IntegerField(source="swift_message.id", read_only=True)
    transaction_ref = serializers.CharField(source="swift_message.transaction_ref", read_only=True)
    message_type = serializers.CharField(source="swift_message.message_type", read_only=True)
    isin = serializers.CharField(source="swift_message.isin", read_only=True)
    security_name = serializers.CharField(source="swift_message.security_name", read_only=True)

    class Meta:
        model = InvestigationResult
        fields = [
            "id",
            "swift_message_id",
            "transaction_ref",
            "message_type",
            "isin",
            "security_name",
            "root_cause",
            "reason_category",
            "severity",
            "investigation_status",
            "ai_summary",
            "recommended_action",
            "investigation_data",
            "orchestrated_actions",
            "audit_logs",
            "created_at",
        ]