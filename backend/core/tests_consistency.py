import io
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from core.services.pdf_generator import generate_signature_pdf

class DataConsistencyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.generate_url = '/api/generate-pdf/'
        self.verify_url = '/api/verify-pdf/' # Adjust if needed
        self.data_a = {
            "full_name": "User A",
            "address": "Address A",
            "pesel": "44051401359" # Valid
        }
        self.data_b = {
            "full_name": "User B",
            "address": "Address B",
            "pesel": "90010100000" # Another valid one needed? Or just dummy.
        }

    def test_metadata_injection(self):
        """Test that generated PDF has correct metadata."""
        buffer = generate_signature_pdf(self.data_a)
        from pypdf import PdfReader
        reader = PdfReader(buffer)
        self.assertEqual(reader.metadata.subject, self.data_a['pesel'])

    def test_verify_mismatch(self):
        """Test upload where form PESEL differs from PDF metadata PESEL."""
        # 1. Generate PDF for User A
        pdf_buffer = generate_signature_pdf(self.data_a)
        pdf_buffer.seek(0)
        
        # 2. Upload with User B's PESEL (but User A's file)
        # Note: In real world, this file would need a valid signature to pass verify_signature.
        # But we are mocking verify_signature usually, OR we need to sign it.
        # If verify_signature fails first, we won't reach metadata check.
        # So we must Mock verify_signature to return True for this test.
        
        from unittest.mock import patch
        with patch('core.views_verify.verify_signature') as mock_verify:
            mock_verify.return_value = (True, "Valid", {})
            
            data = self.data_b.copy() # User B data
            file_data = {'file': pdf_buffer}
            
            # Reset buffer usually handled by requests
            pdf_buffer.seek(0)
            
            response = self.client.post(self.verify_url, {**data, 'file': pdf_buffer}, format='multipart')
            
            # Should fail due to metadata mismatch
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("niezgodność PESEL", str(response.data))

    def test_verify_match(self):
        """Test upload where form PESEL matches PDF metadata PESEL."""
        pdf_buffer = generate_signature_pdf(self.data_a)
        pdf_buffer.seek(0)
        
        from unittest.mock import patch
        with patch('core.views_verify.verify_signature') as mock_verify:
            mock_verify.return_value = (True, "Valid", {})
            
            data = self.data_a.copy()
            pdf_buffer.seek(0)
            
            response = self.client.post(self.verify_url, {**data, 'file': pdf_buffer}, format='multipart')
            
            # Should succeed (created)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
