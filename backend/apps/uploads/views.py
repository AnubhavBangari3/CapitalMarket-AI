from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Trade
from .serializers import (
    UploadedSwiftFileSerializer,
    TradeSerializer,
)

from .services.swift_parser import SwiftParser


class SwiftFileUploadAPIView(APIView):

    def post(self, request):

        serializer = UploadedSwiftFileSerializer(data=request.data)

        if serializer.is_valid():

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

                uploaded_file.status = "parsed"
                uploaded_file.save()

                return Response(
                    {
                        "message": "File uploaded and parsed successfully",

                        "file_id": uploaded_file.id,
                        "filename": uploaded_file.original_filename,

                        "upload_status": uploaded_file.status,

                        "swift_message_id": swift_message.id,

                        "message_type": swift_message.message_type,

                        "transaction_ref": swift_message.transaction_ref,

                        "related_ref": swift_message.related_ref,

                        "isin": swift_message.isin,

                        "security_name": swift_message.security_name,

                        "quantity": (
                            str(swift_message.quantity)
                            if swift_message.quantity
                            else None
                        ),

                        "settlement_amount": (
                            str(swift_message.settlement_amount)
                            if swift_message.settlement_amount
                            else None
                        ),

                        "currency": swift_message.currency,

                        "settlement_status": swift_message.settlement_status,

                        "matching_status": swift_message.matching_status,

                        "reason_code": swift_message.reason_code,

                        "narrative_reason": swift_message.narrative_reason,

                        "settlement_direction": (
                            swift_message.settlement_direction
                        ),

                        "payment_type": swift_message.payment_type,

                        "sender_bic": swift_message.sender_bic,

                        "receiver_bic": swift_message.receiver_bic,

                        "delivering_agent": (
                            swift_message.delivering_agent
                        ),

                        "receiving_agent": (
                            swift_message.receiving_agent
                        ),

                        "place_of_settlement": (
                            swift_message.place_of_settlement
                        ),

                        "parsed_json": swift_message.parsed_json,
                    },

                    status=status.HTTP_201_CREATED
                )

            except Exception as error:

                uploaded_file.status = "failed"
                uploaded_file.save()

                return Response(
                    {
                        "message": "File uploaded but parsing failed",

                        "file_id": uploaded_file.id,

                        "filename": uploaded_file.original_filename,

                        "upload_status": uploaded_file.status,

                        "error": str(error),
                    },

                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class TradeListAPIView(APIView):

    def get(self, request):

        trades = Trade.objects.all().order_by(
            "trade_reference"
        )

        serializer = TradeSerializer(
            trades,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )