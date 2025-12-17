"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView, RedirectView
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    # Redirect root admin to admin/ with slash
    path('admin', RedirectView.as_view(url='/admin/', permanent=True)),
    path('', include('core.urls')),
]

# Serve media files manually (since we are on a simple monolith deployment without S3)
urlpatterns += [
    re_path(r'^signed_pdfs/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]

# Serve React index.html for any other route
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
