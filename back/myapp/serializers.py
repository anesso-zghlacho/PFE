from rest_framework import serializers
from .models import TrafficLog, Alert, SimulationResult
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


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
