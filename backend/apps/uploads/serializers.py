from rest_framework import serializers

from .models import UploadedSwiftFile, Trade


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