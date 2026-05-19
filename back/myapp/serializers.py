from rest_framework import serializers
from .models import TrafficLog, Alert, AccessLog
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # First user to register becomes admin
        is_first_user = not User.objects.exists()
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            is_staff=is_first_user,
            is_superuser=is_first_user
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
            'packet_size',
            'tcp_flags',
            'duration',
            'packet_count',
            'byte_count',
            'bytes_per_packet',
            'packets_per_sec',
            'syn_count',
            'ack_count',
            'fin_count',
            'predicted_label',
            'confidence_score',
            'features',
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp', 'predicted_label', 'confidence_score', 'features']


class PacketInferenceSerializer(serializers.Serializer):
    src_ip = serializers.CharField(required=False, default='0.0.0.0')
    dst_ip = serializers.CharField(required=False, default='0.0.0.0')
    src_port = serializers.IntegerField(required=False, default=0)
    dst_port = serializers.IntegerField(required=False, default=0)
    protocol = serializers.IntegerField(required=False, default=0)
    packet_size = serializers.IntegerField(required=False, default=0)
    length = serializers.IntegerField(required=False, default=0)
    tcp_flags = serializers.CharField(required=False, allow_blank=True, default='')
    timestamp = serializers.FloatField(required=False)


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = [
            'id',
            'title',
            'description',
            'severity',
            'source_ip',
            'prediction_score',
            'timestamp',
            'traffic_log',
            'is_resolved',
        ]
        read_only_fields = ['id', 'timestamp']


class AccessLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AccessLog
        fields = ['id', 'username', 'action', 'ip_address', 'timestamp']
        read_only_fields = ['id', 'timestamp']
