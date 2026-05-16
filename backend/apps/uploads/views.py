from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Trade
from .serializers import UploadedSwiftFileSerializer, TradeSerializer


class SwiftFileUploadAPIView(APIView):

    def post(self, request):
        serializer = UploadedSwiftFileSerializer(data=request.data)

        if serializer.is_valid():
            uploaded_file = serializer.save()

            return Response(
                {
                    "message": "File uploaded successfully",
                    "file_id": uploaded_file.id,
                    "filename": uploaded_file.original_filename,
                    "status": uploaded_file.status,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TradeListAPIView(APIView):

    def get(self, request):
        trades = Trade.objects.all().order_by("trade_reference")
        serializer = TradeSerializer(trades, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)