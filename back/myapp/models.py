from django.db import models
from django.contrib.auth.models import User

class TrafficLog(models.Model):
    src_ip = models.CharField(max_length=15)
    dst_ip = models.CharField(max_length=15)
    src_port = models.IntegerField()
    dst_port = models.IntegerField()
    protocol = models.CharField(max_length=10)
    duration = models.FloatField()
    packet_count = models.IntegerField()
    byte_count = models.IntegerField()
    bytes_per_packet = models.FloatField()
    packets_per_sec = models.FloatField()
    syn_count = models.IntegerField()
    ack_count = models.IntegerField()
    fin_count = models.IntegerField()
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
    source_ip = models.CharField(max_length=15)
    timestamp = models.DateTimeField(auto_now_add=True)
    traffic_log = models.ForeignKey(TrafficLog, on_delete=models.CASCADE, null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"[{self.severity}] {self.title}"


class SimulationResult(models.Model):
    attack_type = models.CharField(max_length=255)
    target_ip = models.CharField(max_length=15)
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    details = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.attack_type} on {self.target_ip}"
