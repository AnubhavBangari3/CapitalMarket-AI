from django.urls import path

from .views import (
    SwiftFileUploadAPIView,
    TradeListAPIView,
    InvestigationListAPIView,
    OrchestratedActionListAPIView,
    AuditLogListAPIView,
    AuditLogByTransactionAPIView,
)


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

    path(
        "investigations/",
        InvestigationListAPIView.as_view(),
        name="investigation-list"
    ),

    path(
        "orchestrated-actions/",
        OrchestratedActionListAPIView.as_view(),
        name="orchestrated-action-list"
    ),

    path(
        "audit-logs/",
        AuditLogListAPIView.as_view(),
        name="audit-log-list"
    ),

    path(
        "audit-logs/<str:transaction_ref>/",
        AuditLogByTransactionAPIView.as_view(),
        name="audit-log-by-transaction"
    ),
]