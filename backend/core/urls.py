from django.urls import path
from .views import GeneratePDFView
from .views_verify import VerifyUploadView

from .views_index import index

urlpatterns = [
    path('', index, name='index'),
    path('api/generate-pdf/', GeneratePDFView.as_view(), name='generate-pdf'),
    path('api/verify-pdf/', VerifyUploadView.as_view(), name='verify-pdf'),
]
