from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Trade,
    InvestigationResult,
    OrchestratedAction,
    AuditLog,
)

from .serializers import (
    UploadedSwiftFileSerializer,
    TradeSerializer,
    InvestigationResultSerializer,
    OrchestratedActionSerializer,
    AuditLogSerializer,
)

from .services.swift_parser import SwiftParser
from .services.investigation_service import InvestigationService
from .services.action_orchestrator import ActionOrchestrator
from .services.audit_logger import AuditLogger


class SwiftFileUploadAPIView(APIView):

    def post(self, request):
        serializer = UploadedSwiftFileSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.save()

        try:
            uploaded_file.status = "processing"
            uploaded_file.save()

            with uploaded_file.file.open("rb") as file:
                raw_message = file.read().decode("utf-8")

            swift_message = SwiftParser.parse(
                uploaded_file=uploaded_file,
                raw_message=raw_message,
            )

            is_duplicate = getattr(swift_message, "is_duplicate", False)

            investigation = None
            orchestrated_actions = []

            if is_duplicate:
                AuditLogger.log_duplicate_message(swift_message)
            else:
                investigation = InvestigationService.investigate(swift_message)
                orchestrated_actions = ActionOrchestrator.orchestrate(investigation)

            uploaded_file.status = "duplicate" if is_duplicate else "parsed"
            uploaded_file.save()

            audit_logs = AuditLog.objects.filter(
                swift_message=swift_message
            ).order_by("created_at")

            response_data = {
                "message": (
                    "Duplicate SWIFT message detected. This message already exists."
                    if is_duplicate
                    else "File uploaded, parsed, investigated, orchestrated, and audited successfully"
                ),
                "is_duplicate": is_duplicate,
                "file_id": uploaded_file.id,
                "filename": uploaded_file.original_filename,
                "upload_status": uploaded_file.status,
                "status": uploaded_file.status,
                "swift_message_id": swift_message.id,
                "message_type": swift_message.message_type,
                "transaction_ref": swift_message.transaction_ref,
                "related_ref": swift_message.related_ref,
                "isin": swift_message.isin,
                "security_name": swift_message.security_name,
                "quantity": str(swift_message.quantity) if swift_message.quantity is not None else None,
                "settlement_amount": str(swift_message.settlement_amount) if swift_message.settlement_amount is not None else None,
                "currency": swift_message.currency,
                "settlement_status": swift_message.settlement_status,
                "matching_status": swift_message.matching_status,
                "reason_code": swift_message.reason_code,
                "narrative_reason": swift_message.narrative_reason,
                "settlement_direction": swift_message.settlement_direction,
                "payment_type": swift_message.payment_type,
                "sender_bic": swift_message.sender_bic,
                "receiver_bic": swift_message.receiver_bic,
                "delivering_agent": swift_message.delivering_agent,
                "receiving_agent": swift_message.receiving_agent,
                "place_of_settlement": swift_message.place_of_settlement,
                "parsed_json": swift_message.parsed_json,
                "investigation": (
                    {
                        "id": investigation.id,
                        "root_cause": investigation.root_cause,
                        "reason_category": investigation.reason_category,
                        "severity": investigation.severity,
                        "recommended_action": investigation.recommended_action,
                        "investigation_data": investigation.investigation_data,
                    }
                    if investigation
                    else None
                ),
                "orchestration": {
                    "actions_triggered": [
                        {
                            "id": action.id,
                            "action_type": action.action_type,
                            "target_system": action.target_system,
                            "title": action.title,
                            "description": action.description,
                            "severity": action.severity,
                            "status": action.status,
                            "external_reference": action.external_reference,
                            "payload": action.payload,
                        }
                        for action in orchestrated_actions
                    ],
                    "total_actions": len(orchestrated_actions),
                },
                "audit_logs": AuditLogSerializer(audit_logs, many=True).data,
            }

            if is_duplicate:
                return Response(response_data, status=status.HTTP_409_CONFLICT)

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as error:
            uploaded_file.status = "failed"
            uploaded_file.save()

            AuditLogger.log_upload_failed(
                action="File parsing/investigation/orchestration failed",
                error=error,
            )

            return Response(
                {
                    "message": "File uploaded but parsing/investigation/orchestration failed",
                    "file_id": uploaded_file.id,
                    "filename": uploaded_file.original_filename,
                    "upload_status": uploaded_file.status,
                    "status": uploaded_file.status,
                    "error": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class TradeListAPIView(APIView):

    def get(self, request):
        trades = Trade.objects.all().order_by("trade_reference")
        serializer = TradeSerializer(trades, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InvestigationListAPIView(APIView):

    def get(self, request):
        investigations = (
            InvestigationResult.objects
            .select_related("swift_message")
            .prefetch_related(
                "orchestrated_actions",
                "audit_logs",
                "orchestrated_actions__audit_logs",
            )
            .all()
            .order_by("-created_at")
        )

        serializer = InvestigationResultSerializer(investigations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrchestratedActionListAPIView(APIView):

    def get(self, request):
        actions = (
            OrchestratedAction.objects
            .select_related(
                "investigation_result",
                "investigation_result__swift_message"
            )
            .prefetch_related("audit_logs")
            .all()
            .order_by("-created_at")
        )

        serializer = OrchestratedActionSerializer(actions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AuditLogListAPIView(APIView):

    def get(self, request):
        audit_logs = (
            AuditLog.objects
            .select_related(
                "swift_message",
                "investigation_result",
                "orchestrated_action",
            )
            .all()
            .order_by("-created_at")
        )

        serializer = AuditLogSerializer(audit_logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AuditLogByTransactionAPIView(APIView):

    def get(self, request, transaction_ref):
        audit_logs = (
            AuditLog.objects
            .select_related(
                "swift_message",
                "investigation_result",
                "orchestrated_action",
            )
            .filter(swift_message__transaction_ref=transaction_ref)
            .order_by("created_at")
        )

        serializer = AuditLogSerializer(audit_logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
