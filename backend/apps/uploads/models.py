from django.db import models


class UploadedSwiftFile(models.Model):

    STATUS_CHOICES = [
        ("uploaded", "Uploaded"),
        ("processing", "Processing"),
        ("parsed", "Parsed"),
        ("failed", "Failed"),
    ]

    original_filename = models.CharField(max_length=255)

    file = models.FileField(
        upload_to="swift_uploads/"
    )

    file_type = models.CharField(max_length=20)

    file_size = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="uploaded"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.original_filename