from __future__ import annotations

import time
import threading
from ipaddress import ip_address
from typing import Any, Dict, List, Tuple
import numpy as np

PacketDict = Dict[str, Any]
FeatureDict = Dict[str, Any]


class FlowTracker:
    """Tracks network flows bidirectionally and calculates real-time flow features."""

    def __init__(self, timeout_seconds: float = 120.0, active_timeout: float = 5.0) -> None:
        self.flows: Dict[Tuple, Dict[str, Any]] = {}
        self.lock = threading.Lock()
        self.timeout_seconds = timeout_seconds
        self.active_timeout = active_timeout

    def _get_flow_key(self, packet: PacketDict) -> Tuple[Tuple[str, int], Tuple[str, int], int]:
        src_ip = str(packet.get('src_ip', '0.0.0.0'))
        dst_ip = str(packet.get('dst_ip', '0.0.0.0'))
        src_port = int(packet.get('src_port', 0) or 0)
        dst_port = int(packet.get('dst_port', 0) or 0)
        protocol = int(packet.get('protocol', 0) or 0)

        # Sort the endpoints to make the flow bidirectional
        endpoint1 = (src_ip, src_port)
        endpoint2 = (dst_ip, dst_port)
        if endpoint1 > endpoint2:
            endpoint1, endpoint2 = endpoint2, endpoint1

        return (endpoint1, endpoint2, protocol)

    def update_and_get_flow(self, packet: PacketDict) -> Dict[str, Any]:
        key = self._get_flow_key(packet)
        current_time = float(packet.get('timestamp', time.time()))
        packet_size = int(packet.get('packet_size', packet.get('length', 0) or 0))
        tcp_flags = str(packet.get('tcp_flags', '')).upper()
        
        src_ip = str(packet.get('src_ip', '0.0.0.0'))
        src_port = int(packet.get('src_port', 0) or 0)

        with self.lock:
            # Clean up old flows to manage memory (simple eviction)
            self._cleanup_expired_flows(current_time)

            if key not in self.flows:
                # Initialize new bidirectional flow
                self.flows[key] = {
                    'fwd_ip': src_ip,
                    'fwd_port': src_port,
                    'first_packet_time': current_time,
                    'last_packet_time': current_time,
                    'fwd_packets': [current_time],
                    'bwd_packets': [],
                    'all_packet_times': [current_time],
                    'fwd_packet_sizes': [packet_size],
                    'bwd_packet_sizes': [],
                    'all_packet_sizes': [packet_size],
                    'tcp_flags': [tcp_flags],
                    'active_start': current_time,
                    'active_durations': [],
                    'idle_durations': [],
                    'fwd_psh_count': 1 if 'P' in tcp_flags and src_ip == src_ip and src_port == src_port else 0,
                    'bwd_psh_count': 0,
                    'fin_count': 1 if 'F' in tcp_flags else 0,
                    'syn_count': 1 if 'S' in tcp_flags else 0,
                    'rst_count': 1 if 'R' in tcp_flags else 0,
                    'psh_count': 1 if 'P' in tcp_flags else 0,
                    'ack_count': 1 if 'A' in tcp_flags else 0,
                    'urg_count': 1 if 'U' in tcp_flags else 0,
                }
                return self.flows[key]

            # Flow already exists - update it
            flow = self.flows[key]
            is_fwd = (src_ip == flow['fwd_ip'] and src_port == flow['fwd_port'])
            
            # Active and Idle periods calculation
            time_gap = current_time - flow['last_packet_time']
            if time_gap > self.active_timeout:
                # The flow was idle, close active period
                prev_active = flow['last_packet_time'] - flow['active_start']
                flow['active_durations'].append(max(0.0, prev_active))
                flow['idle_durations'].append(time_gap)
                flow['active_start'] = current_time
            
            # Update packet timestamps and sizes
            flow['last_packet_time'] = current_time
            flow['all_packet_times'].append(current_time)
            flow['all_packet_sizes'].append(packet_size)
            flow['tcp_flags'].append(tcp_flags)
            
            if is_fwd:
                flow['fwd_packets'].append(current_time)
                flow['fwd_packet_sizes'].append(packet_size)
                if 'P' in tcp_flags:
                    flow['fwd_psh_count'] += 1
            else:
                flow['bwd_packets'].append(current_time)
                flow['bwd_packet_sizes'].append(packet_size)
                if 'P' in tcp_flags:
                    flow['bwd_psh_count'] += 1

            # Update flag counts
            if 'F' in tcp_flags:
                flow['fin_count'] += 1
            if 'S' in tcp_flags:
                flow['syn_count'] += 1
            if 'R' in tcp_flags:
                flow['rst_count'] += 1
            if 'P' in tcp_flags:
                flow['psh_count'] += 1
            if 'A' in tcp_flags:
                flow['ack_count'] += 1
            if 'U' in tcp_flags:
                flow['urg_count'] += 1

            return flow

    def _cleanup_expired_flows(self, current_time: float) -> None:
        expired_keys = []
        for key, flow in self.flows.items():
            if current_time - flow['last_packet_time'] > self.timeout_seconds:
                expired_keys.append(key)
        for key in expired_keys:
            del self.flows[key]


# Global flow tracker instance
_flow_tracker = FlowTracker()


def extract_packet_features(packet: PacketDict) -> FeatureDict:
    """Convert a raw packet dictionary into an ML-ready feature vector.

    This function updates the bidirectional flow tracker and computes both
    original basic attributes and flow-based statistics.
    """
    # 1. Update the flow tracking data
    flow = _flow_tracker.update_and_get_flow(packet)

    # 2. Extract base properties (backwards compatible fields)
    packet_size = int(packet.get('packet_size', packet.get('length', 0) or 0))
    protocol = int(packet.get('protocol', 0) or 0)
    src_port = int(packet.get('src_port', 0) or 0)
    dst_port = int(packet.get('dst_port', 0) or 0)
    tcp_flags = _normalize_tcp_flags(packet.get('tcp_flags', ''))
    timestamp = float(packet.get('timestamp', time.time()))

    # Calculate flow metrics
    flow_duration = flow['last_packet_time'] - flow['first_packet_time']
    # Avoid zero division for rates
    safe_duration = max(1e-6, flow_duration)

    total_bytes = sum(flow['all_packet_sizes'])
    total_packets = len(flow['all_packet_times'])
    
    flow_bytes_sec = float(total_bytes) / safe_duration
    flow_packets_sec = float(total_packets) / safe_duration

    # Flow Inter-Arrival Times (IAT)
    flow_iats = []
    if len(flow['all_packet_times']) > 1:
        flow_iats = np.diff(flow['all_packet_times'])
    flow_iat_mean = float(np.mean(flow_iats)) if len(flow_iats) > 0 else 0.0
    flow_iat_std = float(np.std(flow_iats)) if len(flow_iats) > 1 else 0.0

    # Fwd IAT Total
    fwd_iats = []
    if len(flow['fwd_packets']) > 1:
        fwd_iats = np.diff(flow['fwd_packets'])
    fwd_iat_total = float(np.sum(fwd_iats)) if len(fwd_iats) > 0 else 0.0

    # Bwd IAT Total
    bwd_iats = []
    if len(flow['bwd_packets']) > 1:
        bwd_iats = np.diff(flow['bwd_packets'])
    bwd_iat_total = float(np.sum(bwd_iats)) if len(bwd_iats) > 0 else 0.0

    # Active and Idle means
    # Include current active period since the last active boundary
    current_active = flow['last_packet_time'] - flow['active_start']
    active_list = flow['active_durations'] + [current_active]
    active_mean = float(np.mean(active_list)) if len(active_list) > 0 else 0.0
    idle_mean = float(np.mean(flow['idle_durations'])) if len(flow['idle_durations']) > 0 else 0.0

    # Packet Length metrics
    pkt_len_mean = float(np.mean(flow['all_packet_sizes']))
    pkt_len_std = float(np.std(flow['all_packet_sizes'])) if len(flow['all_packet_sizes']) > 1 else 0.0

    # Packet rates per direction
    fwd_packets_count = len(flow['fwd_packets'])
    bwd_packets_count = len(flow['bwd_packets'])
    fwd_packets_sec = float(fwd_packets_count) / safe_duration
    bwd_packets_sec = float(bwd_packets_count) / safe_duration

    # TCP Flow Time
    total_tcp_flow_time = flow_duration if protocol == 6 else 0.0

    features: FeatureDict = {
        # Base database logging fields
        'src_ip': str(packet.get('src_ip', '0.0.0.0')),
        'dst_ip': str(packet.get('dst_ip', '0.0.0.0')),
        'src_port': src_port,
        'dst_port': dst_port,
        'protocol': protocol,
        'packet_size': packet_size,
        'tcp_flags': tcp_flags,
        'timestamp': timestamp,
        'is_tcp': 1 if protocol == 6 else 0,
        'is_udp': 1 if protocol == 17 else 0,
        'is_icmp': 1 if protocol == 1 else 0,
        'src_ip_private': _is_private_ip(packet.get('src_ip', '0.0.0.0')),
        'dst_ip_private': _is_private_ip(packet.get('dst_ip', '0.0.0.0')),

        # Robust Scaler Columns
        'Flow Duration': flow_duration,
        'Flow Bytes/s': flow_bytes_sec,
        'Flow IAT Mean': flow_iat_mean,
        'Flow IAT Std': flow_iat_std,
        'Fwd IAT Total': fwd_iat_total,
        'Bwd IAT Total': bwd_iat_total,
        'Active Mean': active_mean,
        'Idle Mean': idle_mean,
        'Bwd Bulk Rate Avg': 0.0,
        'Fwd Bulk Rate Avg': 0.0,
        'Total TCP Flow Time': total_tcp_flow_time,

        # MinMaxScaler Columns
        'FIN Flag Count': flow['fin_count'],
        'SYN Flag Count': flow['syn_count'],
        'RST Flag Count': flow['rst_count'],
        'PSH Flag Count': flow['psh_count'],
        'ACK Flag Count': flow['ack_count'],
        'Fwd PSH Flags': flow['fwd_psh_count'],
        'Bwd PSH Flags': flow['bwd_psh_count'],
        'Total Fwd Packet': fwd_packets_count,
        'Total Bwd packets': bwd_packets_count,

        # StandardScaler Columns
        'Flow Packets/s': flow_packets_sec,
        'Fwd Packets/s': fwd_packets_sec,
        'Bwd Packets/s': bwd_packets_sec,
        'Packet Length Mean': pkt_len_mean,
        'Packet Length Std': pkt_len_std,

        # Drop Columns (placeholders to prevent errors in transformer if they are kept or referenced)
        'Fwd URG Flags': flow['urg_count'] if protocol == 6 else 0,
        'Bwd URG Flags': 0,
        'ICMP Code': int(packet.get('icmp_code', 0) or 0),
        'ICMP Type': int(packet.get('icmp_type', 0) or 0),
    }

    return features


def _normalize_tcp_flags(value: Any) -> str:
    if isinstance(value, str):
        return value.upper()
    if isinstance(value, (list, tuple, set)):
        return ','.join(sorted(str(item).upper() for item in value))
    if isinstance(value, int):
        return str(value)
    return ''


def _is_private_ip(ip: str) -> int:
    try:
        return 1 if ip_address(ip).is_private else 0
    except Exception:
        return 0
