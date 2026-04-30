from __future__ import annotations

import abc
from dataclasses import dataclass
from typing import Any, Dict

FeatureDict = Dict[str, Any]


@dataclass
class InferenceResult:
    label: str
    score: float
    features: FeatureDict


class BaseModel(abc.ABC):
    """Abstract base class for all IDS ML models."""

    @abc.abstractmethod
    def load(self, model_path: str) -> None:
        """Load a serialized model or weights file."""
        raise NotImplementedError

    @abc.abstractmethod
    def predict(self, features: FeatureDict) -> InferenceResult:
        """Predict label and confidence from extracted features."""
        raise NotImplementedError

    @abc.abstractmethod
    def metadata(self) -> Dict[str, Any]:
        """Return model metadata for diagnostics."""
        raise NotImplementedError
