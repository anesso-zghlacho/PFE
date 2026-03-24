from rest_framework import serializers
from .models import TrafficLog, Alert, SimulationResult


class TrafficLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLog
        fields = [
            'id',
            'source_ip',
            'destination_ip',
            'source_port',
            'destination_port',
            'protocol',
            'packet_size',
            'timestamp',
            'is_suspicious',
        ]
        read_only_fields = ['id', 'timestamp']


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = [
            'id',
            'title',
            'description',
            'severity',
            'source_ip',
            'timestamp',
            'traffic_log',
            'is_resolved',
        ]
        read_only_fields = ['id', 'timestamp']


class SimulationResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationResult
        fields = [
            'id',
            'attack_type',
            'target_ip',
            'timestamp',
            'success',
            'details',
        ]
        read_only_fields = ['id', 'timestamp']
