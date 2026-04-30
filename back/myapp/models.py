from django.db import models
from django.contrib.auth.models import User

class TrafficLog(models.Model):
    src_ip = models.CharField(max_length=45)
    dst_ip = models.CharField(max_length=45)
    src_port = models.IntegerField()
    dst_port = models.IntegerField()
    protocol = models.CharField(max_length=10)
    packet_size = models.IntegerField(default=0)
    tcp_flags = models.CharField(max_length=64, blank=True)
    duration = models.FloatField(default=0.0)
    packet_count = models.IntegerField(default=1)
    byte_count = models.IntegerField(default=0)
    bytes_per_packet = models.FloatField(default=0.0)
    packets_per_sec = models.FloatField(default=0.0)
    syn_count = models.IntegerField(default=0)
    ack_count = models.IntegerField(default=0)
    fin_count = models.IntegerField(default=0)
    predicted_label = models.CharField(max_length=10, default='normal')
    confidence_score = models.FloatField(default=0.0)
    features = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(default=models.functions.Now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.src_ip}:{self.src_port} -> {self.dst_ip}:{self.dst_port}"


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    source_ip = models.CharField(max_length=45)
    prediction_score = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)
    traffic_log = models.ForeignKey(TrafficLog, on_delete=models.CASCADE, null=True, blank=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.severity}] {self.title}"
