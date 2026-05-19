from __future__ import annotations

import os
from typing import Any, Dict

import numpy as np

from .model_base import BaseModel, FeatureDict, InferenceResult


class MockModel(BaseModel):
    def __init__(self) -> None:
        self.loaded = False

    def load(self, model_path: str) -> None:
        self.loaded = True

    def predict(self, features: FeatureDict) -> InferenceResult:
        if not self.loaded:
            raise RuntimeError('Model must be loaded before inference')

        packet_size = float(features.get('packet_size', 0))
        has_syn = 'S' in str(features.get('tcp_flags', '')).upper()
        score = min(1.0, 0.2 + packet_size / 1500.0 * 0.6 + (0.2 if has_syn else 0.0))
        label = 'attack' if score >= 0.7 else 'normal'
        return InferenceResult(label=label, score=round(score, 4), features=features)

    def metadata(self) -> Dict[str, Any]:
        return {
            'name': 'MockModel',
            'framework': 'mock',
            'type': 'mock',
            'description': 'Development placeholder model',
        }


class SklearnModel(BaseModel):
    def __init__(self, feature_order: list[str] | None = None) -> None:
        self.model = None
        self.loaded = False
        self.feature_order = feature_order or [
            'packet_size', 'protocol', 'src_port', 'dst_port',
            'is_tcp', 'is_udp', 'is_icmp', 'src_ip_private', 'dst_ip_private'
        ]

    def load(self, model_path: str) -> None:
        try:
            import pickle
        except ImportError as exc:
            raise ImportError('scikit-learn is required to load sklearn models') from exc

        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Model file not found: {model_path}')

        with open(model_path, 'rb') as handle:
            self.model = pickle.load(handle)
        self.loaded = True

    def predict(self, features: FeatureDict) -> InferenceResult:
        if not self.loaded or self.model is None:
            raise RuntimeError('Sklearn model is not loaded')

        vector = self._vectorize(features)
        prediction = int(self.model.predict(vector)[0])
        probabilities = self.model.predict_proba(vector)[0]
        score = float(probabilities[prediction])
        label = 'attack' if prediction == 1 else 'normal'
        return InferenceResult(label=label, score=score, features=features)

    def metadata(self) -> Dict[str, Any]:
        return {
            'name': 'SklearnModel',
            'framework': 'scikit-learn',
            'type': 'sklearn',
        }

    def _vectorize(self, features: FeatureDict) -> np.ndarray:
        values = [float(features.get(key, 0)) for key in self.feature_order]
        return np.asarray([values], dtype=np.float32)


class PyTorchModel(BaseModel):
    def __init__(self, feature_order: list[str] | None = None) -> None:
        self.model = None
        self.loaded = False
        self.feature_order = feature_order or [
            'packet_size', 'protocol', 'src_port', 'dst_port',
            'is_tcp', 'is_udp', 'is_icmp', 'src_ip_private', 'dst_ip_private'
        ]

    def load(self, model_path: str) -> None:
        try:
            import torch
        except ImportError as exc:
            raise ImportError('PyTorch is required to load PyTorch models') from exc

        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Model file not found: {model_path}')

        self.model = torch.load(model_path)
        self.model.eval()
        self.loaded = True

    def predict(self, features: FeatureDict) -> InferenceResult:
        if not self.loaded or self.model is None:
            raise RuntimeError('PyTorch model is not loaded')

        import torch
        vector = self._vectorize(features)
        with torch.no_grad():
            outputs = self.model(vector)
            probabilities = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            prediction = int(probabilities.argmax())
            score = float(probabilities[prediction])
        label = 'attack' if prediction == 1 else 'normal'
        return InferenceResult(label=label, score=score, features=features)

    def metadata(self) -> Dict[str, Any]:
        return {
            'name': 'PyTorchModel',
            'framework': 'PyTorch',
            'type': 'pytorch',
        }

    def _vectorize(self, features: FeatureDict):
        import torch
        values = [float(features.get(key, 0)) for key in self.feature_order]
        return torch.tensor([values], dtype=torch.float32)


class XGBoostModel(BaseModel):
    def __init__(self, feature_order: list[str] | None = None) -> None:
        self.model = None
        self.loaded = False
        self.feature_order = feature_order or [
            'packet_size', 'protocol', 'src_port', 'dst_port',
            'is_tcp', 'is_udp', 'is_icmp', 'src_ip_private', 'dst_ip_private'
        ]

    def load(self, model_path: str) -> None:
        try:
            import xgboost as xgb
        except ImportError as exc:
            raise ImportError('XGBoost is required to load xgboost models') from exc

        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Model file not found: {model_path}')

        self.model = xgb.Booster()
        self.model.load_model(model_path)
        self.loaded = True

    def predict(self, features: FeatureDict) -> InferenceResult:
        if not self.loaded or self.model is None:
            raise RuntimeError('XGBoost model is not loaded')

        import xgboost as xgb
        vector = xgb.DMatrix([self._vectorize(features)])
        prediction = float(self.model.predict(vector)[0])
        score = max(0.0, min(1.0, prediction))
        label = 'attack' if score >= 0.5 else 'normal'
        return InferenceResult(label=label, score=score, features=features)

    def metadata(self) -> Dict[str, Any]:
        return {
            'name': 'XGBoostModel',
            'framework': 'XGBoost',
            'type': 'xgboost',
        }

    def _vectorize(self, features: FeatureDict) -> list[float]:
        return [float(features.get(key, 0)) for key in self.feature_order]
