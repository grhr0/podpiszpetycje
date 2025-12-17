from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Signatory
from .serializers import SignatorySerializer
from .services.signature_verifier import verify_signature

class VerifyUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        pdf_file = request.FILES['file']
        
        # 1. Verify Signature
        is_valid, message, info = verify_signature(pdf_file)
        
        if not is_valid:
            # For prototype/dev, we might want a bypass or mock if no signed PDF is available
            return Response({"error": f"Błąd weryfikacji podpisu: {message}"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. If valid (or if we trust the upload for now), save data.
        # Problem: We need the Form Data (Name, Address, PESEL) to save the Signatory.
        
        # Check if signatory exists
        pesel = request.data.get('pesel')
        signatory = None
        
        try:
            signatory = Signatory.objects.get(pesel=pesel)
            # Update existing
            serializer = SignatorySerializer(signatory, data=request.data, partial=True)
        except Signatory.DoesNotExist:
            # Create new
            serializer = SignatorySerializer(data=request.data)

        if serializer.is_valid():
            # Reset file pointer after reading in verify_signature
            pdf_file.seek(0)
            # Save
            signatory = serializer.save(is_verified=True, signed_pdf=pdf_file)
            return Response({
                "status": "success", 
                "message": "Podpis zweryfikowany pomyślnie.",
                "id": signatory.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
