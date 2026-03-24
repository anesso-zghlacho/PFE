from django.db import models
from django.contrib.auth.models import User

class TrafficLog(models.Model):
    PROTOCOL_CHOICES = [
        ('TCP', 'TCP'),
        ('UDP', 'UDP'),
        ('ICMP', 'ICMP'),
        ('HTTP', 'HTTP'),
        ('HTTPS', 'HTTPS'),
    ]
    
    source_ip = models.CharField(max_length=15)
    destination_ip = models.CharField(max_length=15)
    source_port = models.IntegerField()
    destination_port = models.IntegerField()
    protocol = models.CharField(max_length=10, choices=PROTOCOL_CHOICES)
    packet_size = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_suspicious = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.source_ip}:{self.source_port} -> {self.destination_ip}:{self.destination_port}"


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
