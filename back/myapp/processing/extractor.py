from __future__ import annotations

import time
from ipaddress import ip_address
from typing import Any, Dict

PacketDict = Dict[str, Any]
FeatureDict = Dict[str, Any]


def extract_packet_features(packet: PacketDict) -> FeatureDict:
    """Convert a raw packet dictionary into an ML-ready feature vector.

    This function is intentionally pure: no database access, no inference,
    and no side effects.
    """
    packet_size = int(packet.get('packet_size', packet.get('length', 0) or 0))
    protocol = int(packet.get('protocol', 0) or 0)
    src_port = int(packet.get('src_port', 0) or 0)
    dst_port = int(packet.get('dst_port', 0) or 0)
    tcp_flags = _normalize_tcp_flags(packet.get('tcp_flags', ''))
    timestamp = float(packet.get('timestamp', time.time()))

    features: FeatureDict = {
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
    }

    return features


def _normalize_tcp_flags(value: Any) -> str:
    if isinstance(value, str):
        return value.upper()
    if isinstance(value, (list, tuple, set)):
        return ','.join(sorted(str(item).upper() for item in value))
    if isinstance(value, int):
        # preserve numeric representation if provided as integer
        return str(value)
    return ''


def _is_private_ip(ip: str) -> int:
    try:
        return 1 if ip_address(ip).is_private else 0
    except Exception:
        return 0
