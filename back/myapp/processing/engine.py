from __future__ import annotations

from typing import Iterable, Iterator

from .extractor import extract_packet_features
from .model_base import BaseModel, InferenceResult


class InferenceEngine:
    """Core component that wires feature extraction to ML inference."""

    def __init__(self, model: BaseModel) -> None:
        self.model = model

    def analyze_packet(self, packet: dict) -> InferenceResult:
        features = extract_packet_features(packet)
        return self.model.predict(features)

    def analyze_stream(self, packets: Iterable[dict]) -> Iterator[InferenceResult]:
        for packet in packets:
            yield self.analyze_packet(packet)
