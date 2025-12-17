from django.db import models
from django.core.exceptions import ValidationError

class Signatory(models.Model):
    full_name = models.CharField(max_length=255, verbose_name="Imię i nazwisko")
    address = models.CharField(max_length=512, verbose_name="Adres zamieszkania")
    pesel = models.CharField(max_length=11, verbose_name="Numer PESEL", unique=True)
    is_verified = models.BooleanField(default=False, verbose_name="Podpis zweryfikowany")
    
    # We store the signed PDF if verified
    # Limit upload to trusted users/automated process
    signed_pdf = models.FileField(upload_to='signed_pdfs/', blank=True, null=True, verbose_name="Podpisany plik PDF")
    
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        # Basic model-level validation (logic will be duplicated in Serializer for Step 1)
        if len(self.pesel) != 11 or not self.pesel.isdigit():
             raise ValidationError("PESEL must be 11 digits.")
        
    def __str__(self):
        # Mask PESEL for privacy in admin lists by default
        return f"{self.full_name} (***{self.pesel[-4:]})"

    class Meta:
        verbose_name = "Sygnatariusz"
        verbose_name_plural = "Sygnatariusze"
        ordering = ['-created_at']
