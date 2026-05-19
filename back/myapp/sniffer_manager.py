import threading
import logging
from scapy.all import sniff, IP, TCP, UDP
from .processing.service import PacketAnalysisService
from .processing.model_factory import create_model

logger = logging.getLogger(__name__)

class SnifferManager:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SnifferManager, cls).__new__(cls)
                cls._instance._init_manager()
            return cls._instance

    def _init_manager(self):
        self._thread = None
        self._stop_event = threading.Event()
        self._is_running = False
        self._interface = None

    def start(self, interface=None):
        if self._is_running:
            return False, "Sniffer is already running"
        
        self._interface = interface
        self._stop_event.clear()
        
        # Initialize service
        try:
            model = create_model('mock')
            model.load('')
            self.service = PacketAnalysisService(model)
        except Exception as e:
            logger.error(f"Failed to initialize PacketAnalysisService: {e}")
            return False, str(e)

        self.batch_buffer = []
        self.batch_size = 50

        def process_packet(packet):
            if self._stop_event.is_set():
                return
            
            if not packet.haslayer(IP):
                return

            packet_dict = {
                'src_ip': packet[IP].src,
                'dst_ip': packet[IP].dst,
                'protocol': packet[IP].proto,
                'packet_size': len(packet),
                'timestamp': packet.time,
                'src_port': 0,
                'dst_port': 0,
                'tcp_flags': '',
            }

            if packet.haslayer(TCP):
                packet_dict['src_port'] = packet[TCP].sport
                packet_dict['dst_port'] = packet[TCP].dport
                packet_dict['tcp_flags'] = str(packet[TCP].flags)
            elif packet.haslayer(UDP):
                packet_dict['src_port'] = packet[UDP].sport
                packet_dict['dst_port'] = packet[UDP].dport

            self.batch_buffer.append(packet_dict)

            if len(self.batch_buffer) >= self.batch_size:
                try:
                    self.service.bulk_analyze_and_store(self.batch_buffer)
                    self.batch_buffer = []
                except Exception as e:
                    logger.error(f"Error in batch processing: {e}")
                    self.batch_buffer = []

        def run_sniff():
            logger.info(f"Starting background sniffer on {self._interface or 'default'}...")
            try:
                sniff(
                    iface=self._interface, 
                    prn=process_packet, 
                    stop_filter=lambda x: self._stop_event.is_set(), 
                    store=0,
                    promisc=True
                )
            except Exception as e:
                logger.error(f"Sniffer thread crashed: {e}")
            finally:
                self._is_running = False
                logger.info("Sniffer thread stopped.")

        self._thread = threading.Thread(target=run_sniff, daemon=True)
        self._thread.start()
        self._is_running = True
        return True, "Sniffer started"

    def stop(self):
        if not self._is_running:
            return False, "Sniffer is not running"
        
        self._stop_event.set()
        # We don't join the thread here to avoid blocking the request
        self._is_running = False
        return True, "Sniffer stop signal sent"

    def status(self):
        return {
            "is_running": self._is_running,
            "interface": self._interface
        }
