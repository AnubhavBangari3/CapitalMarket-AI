from rest_framework import serializers
from .models import UploadedSwiftFile


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