from django.urls import path

from .views import SwiftFileUploadAPIView


urlpatterns = [
    path(
        "swift/upload/",
        SwiftFileUploadAPIView.as_view(),
        name="swift-upload"
    ),
]