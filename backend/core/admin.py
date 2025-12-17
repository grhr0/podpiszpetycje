from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
import csv
import zipfile
import io
from .models import Signatory

@admin.register(Signatory)
class SignatoryAdmin(admin.ModelAdmin):
    list_display = ('masked_name', 'masked_pesel', 'address', 'is_verified', 'created_at', 'pdf_link')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('full_name', 'pesel')
    actions = ['export_as_csv', 'download_selected_pdfs']

    def masked_name(self, obj):
        # Full name is visible to admin, but maybe we want consistency?
        # Spec: "Imię i nazwisko, Adres, PESEL... domyślnie częściowo zamaskowane (tylko PESEL)"
        return obj.full_name
    masked_name.short_description = "Imię i nazwisko"

    def masked_pesel(self, obj):
        if not obj.pesel:
            return "-"
        return f"*******{obj.pesel[-4:]}"
    masked_pesel.short_description = "PESEL"

    def pdf_link(self, obj):
        if obj.signed_pdf:
            return format_html('<a href="{}" target="_blank">Pobierz</a>', obj.signed_pdf.url)
        return "-"
    pdf_link.short_description = "PDF"

    @admin.action(description='Eksportuj zaznaczone do CSV')
    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = ['full_name', 'address', 'pesel', 'is_verified', 'created_at']

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])

        return response

    @admin.action(description='Pobierz wybrane PDF (ZIP)')
    def download_selected_pdfs(self, request, queryset):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zip_file:
            for obj in queryset:
                if obj.signed_pdf:
                    filename = f"wykaz-poparcia-{obj.pesel}.pdf"
                    try:
                        zip_file.writestr(filename, obj.signed_pdf.read())
                    except Exception as e:
                        # Handle missing file
                        pass
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=podpisy.zip'
        return response

    # Simple Dashboard Metrics injection into ChangeList?
    def changelist_view(self, request, extra_context=None):
        total = Signatory.objects.filter(is_verified=True).count()
        progress = (total / 300) * 100
        extra_context = extra_context or {}
        extra_context['dashboard_stats'] = {
            'total': total,
            'progress': min(progress, 100),
            'goal': 300
        }
        return super().changelist_view(request, extra_context=extra_context)
