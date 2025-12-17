from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.http import FileResponse
from .serializers import SignatorySerializer, PDFGenerationSerializer
from .services.pdf_generator import generate_signature_pdf

class GeneratePDFView(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        serializer = PDFGenerationSerializer(data=request.data)
        if serializer.is_valid():
            # Generate PDF in memory
            pdf_buffer = generate_signature_pdf(serializer.validated_data)
            
            # Create filename
            filename = f"wykaz-poparcia-{serializer.validated_data['pesel']}.pdf"
            
            return FileResponse(
                pdf_buffer, 
                as_attachment=True, 
                filename=filename,
                content_type='application/pdf'
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
