import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from myapp.models import TrafficLog, Alert, AccessLog

class Command(BaseCommand):
    help = 'Seeds the database with highly realistic cybersecurity monitoring data matching specific labels'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing monitoring logs and alerts...')
        Alert.objects.all().delete()
        TrafficLog.objects.all().delete()
        AccessLog.objects.all().delete()

        # Ensure users exist for AccessLogs
        admin_user = User.objects.filter(username='admin').first()
        if not admin_user:
            admin_user = User.objects.create_superuser('admin', 'admin@soficlef.local', 'admin')
        
        bober_user = User.objects.filter(username='bober').first()
        if not bober_user:
            bober_user = User.objects.create_user('bober', 'bober@soficlef.local', 'password123')

        # Define threat templates matching the specific classes: Portscan, Sync flood, DDoS
        threat_templates = [
            {
                'title': 'Portscan Detected',
                'description': 'Sequential TCP scan on ports 1-1024. Active reconnaissance signature matched.',
                'severity': 'MEDIUM',
                'src_ip': '192.168.1.54',
                'dst_ip': '192.168.1.10',
                'src_port': 39182,
                'dst_port': 80,
                'protocol': '6',  # TCP
                'packet_size': 64,
                'tcp_flags': 'S',
                'confidence': 0.89,
                'predicted_label': 'Portscan'
            },
            {
                'title': 'Nmap Reconnaissance Scan',
                'description': 'Detected rapid sequential TCP SYN packets traversing multiple closed ports from a single source host.',
                'severity': 'MEDIUM',
                'src_ip': '45.227.254.12',
                'dst_ip': '192.168.1.102',
                'src_port': 58210,
                'dst_port': 22,
                'protocol': '6',
                'packet_size': 120,
                'tcp_flags': 'S',
                'confidence': 0.95,
                'predicted_label': 'Portscan'
            },
            {
                'title': 'Sync flood Attack',
                'description': 'High rate of TCP SYN packets on port 80 with no subsequent ACK. Web server backlog queue saturated.',
                'severity': 'CRITICAL',
                'src_ip': '198.51.100.77',
                'dst_ip': '192.168.1.100',
                'src_port': 61280,
                'dst_port': 80,
                'protocol': '6',
                'packet_size': 60,
                'tcp_flags': 'S',
                'confidence': 0.99,
                'predicted_label': 'Sync flood'
            },
            {
                'title': 'TCP SYN Flood Target',
                'description': 'Inbound half-open connection flood detected. Automatic SYN-cookie protection protocols activated.',
                'severity': 'CRITICAL',
                'src_ip': '185.190.140.112',
                'dst_ip': '192.168.1.100',
                'src_port': 49210,
                'dst_port': 443,
                'protocol': '6',
                'packet_size': 1420,
                'tcp_flags': 'PA',
                'confidence': 0.97,
                'predicted_label': 'Sync flood'
            },
            {
                'title': 'DDoS Attack Detected',
                'description': 'Distributed Denial of Service traffic spike detected. Volumetric packets saturating local network router buffer.',
                'severity': 'HIGH',
                'src_ip': '82.165.98.204',
                'dst_ip': '192.168.1.100',
                'src_port': 54320,
                'dst_port': 443,
                'protocol': '6',
                'packet_size': 980,
                'tcp_flags': 'PA',
                'confidence': 0.92,
                'predicted_label': 'DDoS'
            },
            {
                'title': 'DDoS Traffic Spike',
                'description': 'Volumetric bandwidth exhaustion attempt targeting public web server gateway from external host.',
                'severity': 'HIGH',
                'src_ip': '203.0.113.88',
                'dst_ip': '192.168.1.100',
                'src_port': 43210,
                'dst_port': 80,
                'protocol': '6',
                'packet_size': 320,
                'tcp_flags': 'PA',
                'confidence': 0.88,
                'predicted_label': 'DDoS'
            }
        ]

        # Common IP pools for normal traffic
        local_ips = ['192.168.1.10', '192.168.1.11', '192.168.1.15', '192.168.1.20', '192.168.1.50', '192.168.1.100', '192.168.1.102', '192.168.1.115', '192.168.1.120']
        remote_ips = ['142.250.190.46', '34.206.140.23', '104.244.42.1', '13.32.110.42', '1.1.1.1', '8.8.8.8', '52.223.19.124']
        protocols = [('6', 'TCP'), ('17', 'UDP'), ('1', 'ICMP')]

        self.stdout.write('Generating 250 realistic traffic and alert records matching detection classes...')
        now = timezone.now()

        # Seed traffic log database entries spread over the last 45 minutes
        logs = []
        for i in range(250):
            time_offset = random.randint(1, 2700) # up to 45 minutes ago
            log_time = now - timedelta(seconds=time_offset)
            
            # Determine if this entry will be an attack
            is_attack = random.random() < 0.15  # 15% attack traffic for richer screenshot representation
            
            if is_attack:
                template = random.choice(threat_templates)
                src_ip = template['src_ip']
                dst_ip = template['dst_ip']
                src_port = template['src_port']
                dst_port = template['dst_port']
                proto = template['protocol']
                flags = template['tcp_flags']
                p_size = template['packet_size']
                label = template['predicted_label']
                score = template['confidence']
            else:
                src_ip = random.choice(local_ips)
                dst_ip = random.choice(remote_ips)
                if random.random() < 0.3:
                    src_ip, dst_ip = dst_ip, src_ip
                
                proto_code, proto_name = random.choice(protocols)
                proto = proto_code
                
                if proto_code == '6':  # TCP
                    src_port = random.randint(32768, 65535)
                    dst_port = random.choice([80, 443, 8080])
                    flags = random.choice(['A', 'PA', 'FA'])
                elif proto_code == '17':  # UDP
                    src_port = random.randint(32768, 65535)
                    dst_port = random.choice([53, 123])
                    flags = ''
                else:  # ICMP
                    src_port = 0
                    dst_port = 0
                    flags = ''
                
                p_size = random.randint(64, 1500)
                label = 'NORMAL'
                score = random.uniform(0.01, 0.15)

            # Create TrafficLog object
            log = TrafficLog(
                src_ip=src_ip,
                dst_ip=dst_ip,
                src_port=src_port,
                dst_port=dst_port,
                protocol=proto,
                packet_size=p_size,
                tcp_flags=flags,
                duration=random.uniform(0.01, 1.5),
                packet_count=random.randint(1, 10),
                byte_count=p_size * random.randint(1, 10),
                bytes_per_packet=p_size,
                packets_per_sec=random.uniform(1.0, 50.0),
                syn_count=1 if 'S' in flags else 0,
                ack_count=1 if 'A' in flags else 0,
                fin_count=1 if 'F' in flags else 0,
                predicted_label=label,
                confidence_score=score,
                timestamp=log_time
            )
            logs.append(log)

        # Bulk save traffic logs
        TrafficLog.objects.bulk_create(logs)
        
        # Re-fetch logs to have database IDs for Alert ForeignKey
        saved_logs = list(TrafficLog.objects.all())

        # Generate Alert records linked to the attack logs
        alerts_seeded = 0
        used_log_ids = set()

        for i in range(20):
            # Select an attack traffic log (non-NORMAL label)
            attack_logs = [l for l in saved_logs if l.predicted_label != 'NORMAL' and l.id not in used_log_ids]
            if not attack_logs:
                break
            
            selected_log = random.choice(attack_logs)
            used_log_ids.add(selected_log.id)
            
            # Find a matching threat template for this label
            matching_templates = [t for t in threat_templates if t['predicted_label'] == selected_log.predicted_label]
            template = random.choice(matching_templates) if matching_templates else random.choice(threat_templates)
            
            is_resolved = random.random() < 0.25
            
            alert = Alert.objects.create(
                title=template['title'],
                description=template['description'],
                severity=template['severity'],
                source_ip=selected_log.src_ip,
                prediction_score=selected_log.confidence_score,
                traffic_log=selected_log,
                is_resolved=is_resolved
            )
            Alert.objects.filter(pk=alert.pk).update(timestamp=selected_log.timestamp)
            alerts_seeded += 1

        # Seed AccessLogs (authentication history)
        access_ips = ['192.168.1.12', '192.168.1.54', '192.168.1.15']
        users = [admin_user, bober_user]
        
        for i in range(12):
            log_time = now - timedelta(hours=i * 2 + random.randint(0, 60))
            user = random.choice(users)
            action = 'LOGIN' if random.random() < 0.7 else 'LOGOUT'
            ip = random.choice(access_ips)
            
            access_log = AccessLog.objects.create(
                user=user,
                action=action,
                ip_address=ip
            )
            AccessLog.objects.filter(pk=access_log.pk).update(timestamp=log_time)

        self.stdout.write(self.style.SUCCESS(
            f'Seeded successfully: {len(saved_logs)} TrafficLogs with exact labels, {alerts_seeded} Alerts, 12 AccessLogs.'
        ))
