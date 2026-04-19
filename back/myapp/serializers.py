from rest_framework import serializers
from .models import TrafficLog, Alert
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
            'src_ip',
            'dst_ip',
            'src_port',
            'dst_port',
            'protocol',
            'duration',
            'packet_count',
            'byte_count',
            'bytes_per_packet',
            'packets_per_sec',
            'syn_count',
            'ack_count',
            'fin_count',
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp']


class TrafficLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLog
        fields = [
            'id',
            'src_ip',
            'dst_ip',
            'src_port',
            'dst_port',
            'protocol',
            'duration',
            'packet_count',
            'byte_count',
            'bytes_per_packet',
            'packets_per_sec',
            'syn_count',
            'ack_count',
            'fin_count',
            'timestamp',
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
