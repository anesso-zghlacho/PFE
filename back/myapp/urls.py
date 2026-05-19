from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'traffic', views.TrafficLogViewSet, basename='traffic')
router.register(r'alerts', views.AlertViewSet, basename='alert')
router.register(r'access-logs', views.AccessLogViewSet, basename='access-logs')

urlpatterns = [
    path('', include(router.urls)),
    path('packets/ingest/', views.api_packet_ingest, name='api_packet_ingest'),
    path('auth/csrf/', views.get_csrf_token, name='csrf_token'),
    path('auth/setup-status/', views.api_setup_status, name='api_setup_status'),
    path('auth/register/', views.api_register, name='api_register'),
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/logout/', views.api_logout, name='api_logout'),
    path('auth/user/', views.api_user, name='api_user'),
    path('sniffer/start/', views.api_sniffer_start, name='sniffer_start'),
    path('sniffer/stop/', views.api_sniffer_stop, name='sniffer_stop'),
    path('sniffer/status/', views.api_sniffer_status, name='sniffer_status'),
]
