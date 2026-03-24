from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import TrafficLog, Alert, SimulationResult
from .serializers import TrafficLogSerializer, AlertSerializer, SimulationResultSerializer

# Original Views for Authentication
def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'register.html', {'form': form})

@login_required
def home(request):
    return render(request, 'home.html')


# API ViewSets
class TrafficLogViewSet(viewsets.ModelViewSet):
    queryset = TrafficLog.objects.all()
    serializer_class = TrafficLogSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['source_ip', 'destination_ip', 'protocol']
    ordering_fields = ['timestamp', 'packet_size']
    ordering = ['-timestamp']
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def suspicious(self, request):
        """Get suspicious traffic logs"""
        suspicious_logs = TrafficLog.objects.filter(is_suspicious=True)
        serializer = self.get_serializer(suspicious_logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get traffic statistics"""
        total = TrafficLog.objects.count()
        suspicious = TrafficLog.objects.filter(is_suspicious=True).count()
        protocols = TrafficLog.objects.values_list('protocol', flat=True).distinct().count()
        
        return Response({
            'total_logs': total,
            'suspicious_logs': suspicious,
            'unique_protocols': protocols,
        })


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'severity', 'source_ip']
    ordering_fields = ['timestamp', 'severity']
    ordering = ['-timestamp']
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def unresolved(self, request):
        """Get unresolved alerts"""
        unresolved_alerts = Alert.objects.filter(is_resolved=False)
        serializer = self.get_serializer(unresolved_alerts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_severity(self, request):
        """Get alerts grouped by severity"""
        critical = Alert.objects.filter(severity='CRITICAL').count()
        high = Alert.objects.filter(severity='HIGH').count()
        medium = Alert.objects.filter(severity='MEDIUM').count()
        low = Alert.objects.filter(severity='LOW').count()
        
        return Response({
            'CRITICAL': critical,
            'HIGH': high,
            'MEDIUM': medium,
            'LOW': low,
        })

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an alert"""
        alert = self.get_object()
        alert.is_resolved = True
        alert.save()
        return Response({'status': 'Alert resolved'})


class SimulationResultViewSet(viewsets.ModelViewSet):
    queryset = SimulationResult.objects.all()
    serializer_class = SimulationResultSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['attack_type', 'target_ip']
    ordering_fields = ['timestamp', 'success']
    ordering = ['-timestamp']
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def launch_attack(self, request):
        """Launch a simulated attack"""
        attack_type = request.data.get('attack_type')
        target_ip = request.data.get('target_ip')
        
        # Create simulation result
        result = SimulationResult.objects.create(
            attack_type=attack_type,
            target_ip=target_ip,
            success=True,  # In real scenario, this would be based on actual attack simulation
            details='Simulated attack executed successfully'
        )
        
        # Create corresponding alert
        Alert.objects.create(
            title=f"Simulated {attack_type} Attack",
            description=f"Simulated {attack_type} attack on {target_ip}",
            severity='HIGH',
            source_ip='127.0.0.1'
        )
        
        serializer = self.get_serializer(result)
        return Response(serializer.data)