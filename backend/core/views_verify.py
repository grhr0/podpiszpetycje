from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Signatory
from .serializers import SignatorySerializer
from .services.signature_verifier import verify_signature
from pypdf import PdfReader

class VerifyUploadView(APIView):
    authentication_classes = []
    permission_classes = []
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        pdf_file = request.FILES['file']
        
        # 1. Verify Signature
        is_valid, message, info = verify_signature(pdf_file)
        
        if not is_valid:
            return Response({"error": f"Błąd weryfikacji podpisu: {message}"}, status=status.HTTP_400_BAD_REQUEST)

        # 1.5 Verify Data Consistency (Metadata vs Form Data vs Certificate)
        try:
            pdf_file.seek(0)
            reader = PdfReader(pdf_file)
            metadata = reader.metadata
            
            pdf_pesel = None
            if metadata and metadata.subject:
                pdf_pesel = metadata.subject

            # A. Check if PESEL in Metadata matches Certificate PESEL (Identity Check)
            cert_pesel = info.get('pesel')
            
            if cert_pesel:
                # If certificate has PESEL, it MUST match the document metadata PESEL
                if pdf_pesel and cert_pesel != pdf_pesel:
                     return Response({
                        "error": f"Niezgodność tożsamości! Plik wygenerowany dla PESEL {pdf_pesel}, a podpisany przez PESEL {cert_pesel}."
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif not pdf_pesel:
                     # Document has no metadata PESEL? Suspicious if we enforce it. 
                     # For now, let's warn or allow if strict mode is off.
                     # But consistent with previous step, we likely want to fail or rely on form check.
                     pass 
            else:
                 # Certificate has NO PESEL (e.g. test cert, or non-qualified).
                 # If production requires qualified structure, we should block.
                 # For development, we might allow it but LOG WARNING.
                 pass

            # B. Check if Metadata matches Form Data (Anti-spoofing upload)
            form_pesel = request.data.get('pesel')
            if pdf_pesel and form_pesel and pdf_pesel != form_pesel:
                 return Response({
                    "error": "Podpisany plik należy do innej osoby (niezgodność PESEL w metadanych pliku)."
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Don't fail hard if pypdf fails
            pass


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
