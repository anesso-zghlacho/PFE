"""IDS feature extractor and model interface scaffold.

This module is intentionally focused on separating packet feature extraction
from inference. It defines a production-ready structure for:

- feature extraction logic
- strict input/output inference schema
- abstract model interface
- mock model for development
- a processor that wires extractor + model

The ML model implementation remains plug-and-play and can be extended later
with sklearn, PyTorch, XGBoost, or other frameworks.
"""

from __future__ import annotations

import abc
import time
from dataclasses import dataclass
from ipaddress import ip_address
from typing import Any, Dict, Iterable, Iterator

PacketDict = Dict[str, Any]
FeatureDict = Dict[str, Any]


@dataclass
class InferenceResult:
    """Standard inference output schema."""
    label: str  # "normal" or "attack"
    score: float
    features: FeatureDict


class FeatureExtractor(abc.ABC):
    """Abstract packet feature extractor."""

    @abc.abstractmethod
    def extract(self, packet: PacketDict) -> FeatureDict:
        """Extract features from a single packet."""
        pass

    def extract_batch(self, packets: Iterable[PacketDict]) -> Iterator[FeatureDict]:
        """Extract features from a stream or batch of packets."""
        for packet in packets:
            yield self.extract(packet)


class DefaultPacketExtractor(FeatureExtractor):
    """Default implementation for packet feature extraction."""

    def extract(self, packet: PacketDict) -> FeatureDict:
        start = time.perf_counter()

        features: FeatureDict = {
            'src_ip': packet.get('src_ip', '0.0.0.0'),
            'dst_ip': packet.get('dst_ip', '0.0.0.0'),
            'src_port': int(packet.get('src_port', 0)),
            'dst_port': int(packet.get('dst_port', 0)),
            'protocol': int(packet.get('protocol', 0)),
            'packet_length': int(packet.get('length', 0)),
            'timestamp': float(packet.get('timestamp', time.time())),
        }

        features['is_tcp'] = 1 if features['protocol'] == 6 else 0
        features['is_udp'] = 1 if features['protocol'] == 17 else 0
        features['is_icmp'] = 1 if features['protocol'] == 1 else 0

        features['src_port_class'] = _classify_port(features['src_port'])
        features['dst_port_class'] = _classify_port(features['dst_port'])

        features['src_ip_private'] = _is_private_ip(features['src_ip'])
        features['dst_ip_private'] = _is_private_ip(features['dst_ip'])

        # Low-latency extractor; keep operations minimal and deterministic.
        elapsed = time.perf_counter() - start
        features['extractor_latency_ms'] = elapsed * 1000.0
        return features


def _classify_port(port: int) -> str:
    if port == 0:
        return 'unknown'
    if port < 1024:
        return 'well_known'
    if port < 49152:
        return 'registered'
    return 'dynamic'


def _is_private_ip(ip: str) -> int:
    try:
        return 1 if ip_address(ip).is_private else 0
    except ValueError:
        return 0


class ModelInterface(abc.ABC):
    """Abstract model interface for plug-and-play ML backends."""

    @abc.abstractmethod
    def load(self, model_path: str) -> None:
        """Load model weights or serialized object."""
        pass

    @abc.abstractmethod
    def infer(self, features: FeatureDict) -> InferenceResult:
        """Infer a label and score from extracted features."""
        pass

    @abc.abstractmethod
    def metadata(self) -> Dict[str, Any]:
        """Return model metadata."""
        pass


class MockModel(ModelInterface):
    """Development mock model with deterministic behavior."""

    def __init__(self) -> None:
        self.loaded = False

    def load(self, model_path: str) -> None:
        self.loaded = True

    def infer(self, features: FeatureDict) -> InferenceResult:
        if not self.loaded:
            raise RuntimeError('Model not loaded')

        score = 0.1 + 0.8 * min(1.0, features.get('packet_length', 0) / 1500.0)
        label = 'attack' if score > 0.7 else 'normal'
        return InferenceResult(label=label, score=score, features=features)

    def metadata(self) -> Dict[str, Any]:
        return {
            'name': 'MockModel',
            'framework': 'none',
            'type': 'mock',
            'description': 'Development placeholder model',
        }


class ModelFactory:
    """Factory for plug-and-play models."""

    @staticmethod
    def create(model_type: str) -> ModelInterface:
        registry = {
            'mock': MockModel,
            # future extensions:
            # 'sklearn': SklearnModel,
            # 'pytorch': PytorchModel,
            # 'xgboost': XGBoostModel,
        }
        if model_type not in registry:
            raise ValueError(f'Unknown model type: {model_type}')
        return registry[model_type]()


class IDSEngine:
    """Combines packet extraction with model inference."""

    def __init__(self, extractor: FeatureExtractor, model: ModelInterface) -> None:
        self.extractor = extractor
        self.model = model

    def process_packet(self, packet: PacketDict) -> InferenceResult:
        features = self.extractor.extract(packet)
        return self.model.infer(features)

    def process_stream(self, packets: Iterable[PacketDict]) -> Iterator[InferenceResult]:
        for packet in packets:
            yield self.process_packet(packet)


def example_usage() -> None:
    extractor = DefaultPacketExtractor()
    model = ModelFactory.create('mock')
    model.load('mock-path')

    engine = IDSEngine(extractor, model)

    packet = {
        'src_ip': '192.168.1.10',
        'dst_ip': '10.0.0.5',
        'src_port': 12345,
        'dst_port': 80,
        'protocol': 6,
        'length': 900,
        'timestamp': time.time(),
    }

    result = engine.process_packet(packet)
    print(result)


if __name__ == '__main__':
    example_usage()
