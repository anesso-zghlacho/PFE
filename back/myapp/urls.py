from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'traffic', views.TrafficLogViewSet, basename='traffic')
router.register(r'alerts', views.AlertViewSet, basename='alert')
router.register(r'simulations', views.SimulationResultViewSet, basename='simulation')

urlpatterns = [
    path('', views.home, name='home'),
    path('api/', include(router.urls)),
]
