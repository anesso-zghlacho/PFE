import threading
import logging
import queue
import time
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
        self._consumer_thread = None
        self._stop_event = threading.Event()
        self._is_running = False
        self._interface = None
        self.packet_queue = queue.Queue()

    def start(self, interface=None):
        if self._is_running:
            return False, "Sniffer is already running"
        
        self._interface = interface
        self._stop_event.clear()
        self.packet_queue = queue.Queue()
        
        # Initialize service
        try:
            import os
            models_dir = os.path.join(os.path.dirname(__file__), 'processing', 'models')
            scaler_file = os.path.join(models_dir, 'network_scaler.pkl')
            
            if os.path.exists(scaler_file):
                model = create_model('hierarchical')
                model.load(models_dir)
                logger.info("Sniffer successfully loaded Hierarchical IDS Models.")
            else:
                model = create_model('mock')
                model.load('')
            self.service = PacketAnalysisService(model)
        except Exception as e:
            logger.error(f"Failed to initialize PacketAnalysisService: {e}")
            return False, str(e)

        # Producer Callback (Runs on Scapy thread, pushes to queue)
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

            self.packet_queue.put(packet_dict)

        # Consumer Loop (Runs on separate thread, writes to DB in batches)
        def consumer_worker():
            logger.info("Sniffer consumer thread started.")
            batch = []
            batch_size = 50
            
            while not self._stop_event.is_set() or not self.packet_queue.empty():
                try:
                    # Retrieve packet with a timeout to check self._stop_event periodically
                    packet_dict = self.packet_queue.get(timeout=0.5)
                    batch.append(packet_dict)
                    
                    if len(batch) >= batch_size:
                        try:
                            self.service.bulk_analyze_and_store(batch)
                        except Exception as e:
                            logger.error(f"Error in consumer batch processing: {e}")
                        batch = []
                    
                    self.packet_queue.task_done()
                except queue.Empty:
                    # Flush any partially filled batch if the queue is empty
                    if batch:
                        try:
                            self.service.bulk_analyze_and_store(batch)
                        except Exception as e:
                            logger.error(f"Error in consumer batch flush: {e}")
                        batch = []
            
            # Final flush of any remaining items
            if batch:
                try:
                    self.service.bulk_analyze_and_store(batch)
                except Exception as e:
                    logger.error(f"Error in consumer final batch flush: {e}")
            logger.info("Sniffer consumer thread stopped.")

        def run_sniff():
            logger.info(f"Starting background sniffer on {self._interface or 'default'}...")
            try:
                sniff(
                    iface=self._interface, 
                    prn=process_packet, 
                    stop_filter=lambda x: self._stop_event.is_set(), 
                    store=0,
                    promisc=True,
                    filter="ip or ipv6",
                    timeout=2.0  # Allow Scapy loop to check stop_filter every 2 seconds
                )
            except Exception as e:
                logger.error(f"Sniffer thread crashed: {e}")
            finally:
                self._is_running = False
                logger.info("Sniffer thread stopped.")

        # Start consumer and sniffer threads
        self._consumer_thread = threading.Thread(target=consumer_worker, daemon=True)
        self._consumer_thread.start()

        self._thread = threading.Thread(target=run_sniff, daemon=True)
        self._thread.start()
        self._is_running = True
        return True, "Sniffer started"

    def stop(self):
        if not self._is_running:
            return False, "Sniffer is not running"
        
        self._stop_event.set()
        self._is_running = False
        return True, "Sniffer stop signal sent"

    def status(self):
        return {
            "is_running": self._is_running,
            "interface": self._interface
        }
