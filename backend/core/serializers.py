from rest_framework import serializers
from .models import Signatory

class SignatorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Signatory
        fields = ['first_name', 'last_name', 'address', 'pesel'] # Assuming split in model or full_name
        # Wait, I defined 'full_name' in model, but client spec says 'Imię i nazwisko' as one field usually?
        # Spec says: "Imię i nazwisko" - one field.
        # My model has 'full_name'.
        fields = ['full_name', 'address', 'pesel']

    def validate_pesel(self, value):
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError("PESEL musi składać się z 11 cyfr.")
        
        # Checksum validation
        weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
        checksum_sum = sum(int(value[i]) * weights[i] for i in range(10))
        control_digit = (10 - (checksum_sum % 10)) % 10
        
        if control_digit != int(value[10]):
            raise serializers.ValidationError("Niepoprawny numer PESEL (błąd sumy kontrolnej).")
            
        return value

class PDFGenerationSerializer(serializers.Serializer):
    """
    Serializer purely for validating data for PDF generation.
    Does NOT check for database uniqueness, allowing re-generation for existing users.
    """
    full_name = serializers.CharField(max_length=255)
    address = serializers.CharField(max_length=512)
    pesel = serializers.CharField(max_length=11)

    def validate_pesel(self, value):
        # Reusing the logic is best, or import it. 
        # For simplicity and isolation, I'll copy the checksum logic here 
        # or we could make a shared validator function.
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError("PESEL musi składać się z 11 cyfr.")
        
        weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
        checksum_sum = sum(int(value[i]) * weights[i] for i in range(10))
        control_digit = (10 - (checksum_sum % 10)) % 10
        
        if control_digit != int(value[10]):
            raise serializers.ValidationError("Niepoprawny numer PESEL (błąd sumy kontrolnej).")
            
        return value
