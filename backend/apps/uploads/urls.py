from django.urls import path

from .views import SwiftFileUploadAPIView, TradeListAPIView


urlpatterns = [
    path(
        "swift/upload/",
        SwiftFileUploadAPIView.as_view(),
        name="swift-upload"
    ),

    path(
        "trades/",
        TradeListAPIView.as_view(),
        name="trade-list"
    ),
]