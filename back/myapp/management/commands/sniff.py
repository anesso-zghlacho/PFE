import sys
from django.core.management.base import BaseCommand
from myapp.processing.service import PacketAnalysisService
from myapp.processing.model_factory import create_model
from myapp.processing.extractor import extract_packet_features
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Starts real-time packet sniffing and IDS analysis'

    def add_arguments(self, parser):
        parser.add_argument('--interface', type=str, help='Network interface to sniff on', default=None)
        parser.add_argument('--count', type=int, help='Number of packets to sniff (0 for infinite)', default=0)

    def handle(self, *args, **options):
        try:
            from scapy.all import sniff, IP, TCP, UDP
        except ImportError:
            self.stderr.write(self.style.ERROR('Scapy is not installed. Run: pip install scapy'))
            return

        interface = options['interface']
        count = options['count']

        self.stdout.write(self.style.SUCCESS(f'Starting sniffer on {interface or "default interface"}...'))

        # Load hierarchical composite classifier if available, else fallback to mock
        import os
        models_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'processing', 'models')
        scaler_file = os.path.join(models_dir, 'network_scaler.pkl')

        if os.path.exists(scaler_file):
            try:
                model = create_model('hierarchical')
                model.load(models_dir)
                logger.info("CLI Sniffer loaded Hierarchical IDS Models.")
            except Exception as e:
                logger.error(f"Error loading Hierarchical IDS Models: {e}. Falling back to mock model.")
                model = create_model('mock')
                model.load('')
        else:
            model = create_model('mock')
            model.load('')
        service = PacketAnalysisService(model)

        def process_packet(packet):
            if not packet.haslayer(IP):
                return

            packet_dict = {
                'src_ip': packet[IP].src,
                'dst_ip': packet[IP].dst,
                'protocol': packet[IP].proto,
                'packet_size': len(packet),
                'timestamp': packet.time,
            }

            if packet.haslayer(TCP):
                packet_dict['src_port'] = packet[TCP].sport
                packet_dict['dst_port'] = packet[TCP].dport
                packet_dict['tcp_flags'] = str(packet[TCP].flags)
            elif packet.haslayer(UDP):
                packet_dict['src_port'] = packet[UDP].sport
                packet_dict['dst_port'] = packet[UDP].dport

            try:
                result, traffic_log, alert = service.analyze_and_store(packet_dict)
                
                status = f"[{result.label.upper()}]"
                if result.label == 'attack':
                    status = self.style.WARNING(status)
                
                self.stdout.write(f"{status} {packet_dict['src_ip']} -> {packet_dict['dst_ip']} ({packet_dict.get('protocol')})")
            except Exception as e:
                logger.error(f"Error processing packet: {e}")

        try:
            sniff(iface=interface, prn=process_packet, count=count, store=0)
        except PermissionError:
            self.stderr.write(self.style.ERROR('Permission denied. Try running with sudo.'))
        except KeyboardInterrupt:
            self.stdout.write(self.style.SUCCESS('Stopped sniffer.'))
