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


class RandomForestModel(BaseModel):
    """Base wrapper for all Scikit-Learn Random Forest classifiers."""

    def __init__(self, feature_order: list[str] | None = None) -> None:
        self.model = None
        self.loaded = False
        self.feature_order = feature_order or [
            'Flow Duration', 'Flow Bytes/s', 'Flow IAT Mean', 'Flow IAT Std',
            'Fwd IAT Total', 'Bwd IAT Total', 'Active Mean', 'Idle Mean',
            'Bwd Bulk Rate Avg', 'Fwd Bulk Rate Avg', 'Total TCP Flow Time',
            'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count',
            'PSH Flag Count', 'ACK Flag Count', 'Fwd PSH Flags', 'Bwd PSH Flags',
            'Total Fwd Packet', 'Total Bwd packets',
            'Flow Packets/s', 'Fwd Packets/s', 'Bwd Packets/s',
            'Packet Length Mean', 'Packet Length Std',
            'Fwd URG Flags', 'Bwd URG Flags', 'ICMP Code', 'ICMP Type'
        ]

    def load(self, model_path: str) -> None:
        try:
            import joblib
        except ImportError as exc:
            raise ImportError('joblib is required to load RandomForest models') from exc

        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Random Forest model file not found: {model_path}')

        self.model = joblib.load(model_path)
        self.loaded = True

    def predict(self, features: FeatureDict) -> InferenceResult:
        if not self.loaded or self.model is None:
            raise RuntimeError('Random Forest model is not loaded')

        vector = self._vectorize(features)
        prediction = int(self.model.predict(vector)[0])
        probabilities = self.model.predict_proba(vector)[0]
        score = float(probabilities[prediction])
        label = 'attack' if prediction == 1 else 'normal'
        return InferenceResult(label=label, score=score, features=features)

    def metadata(self) -> Dict[str, Any]:
        return {
            'name': 'RandomForestModel',
            'framework': 'scikit-learn',
            'type': 'sklearn_rf',
        }

    def _vectorize(self, features: FeatureDict) -> np.ndarray:
        values = [float(features.get(key, 0.0) or 0.0) for key in self.feature_order]
        return np.asarray([values], dtype=np.float32)


class BinaryAnomalyClassifierRF(RandomForestModel):
    def metadata(self) -> Dict[str, Any]:
        meta = super().metadata()
        meta.update({'name': 'BinaryAnomalyClassifierRF', 'role': 'tier_1_anomaly_detector'})
        return meta


class PortscanClassifierRF(RandomForestModel):
    def metadata(self) -> Dict[str, Any]:
        meta = super().metadata()
        meta.update({'name': 'PortscanClassifierRF', 'role': 'tier_2_portscan_detector'})
        return meta


class SynFloodClassifierRF(RandomForestModel):
    def metadata(self) -> Dict[str, Any]:
        meta = super().metadata()
        meta.update({'name': 'SynFloodClassifierRF', 'role': 'tier_2_synflood_detector'})
        return meta


class DDoSClassifierRF(RandomForestModel):
    def metadata(self) -> Dict[str, Any]:
        meta = super().metadata()
        meta.update({'name': 'DDoSClassifierRF', 'role': 'tier_2_ddos_detector'})
        return meta


class BotnetClassifierRF(RandomForestModel):
    def metadata(self) -> Dict[str, Any]:
        meta = super().metadata()
        meta.update({'name': 'BotnetClassifierRF', 'role': 'tier_2_botnet_detector'})
        return meta


class HierarchicalIDSClassifier(BaseModel):
    """Composite classifier implementing two-tier hierarchical classification."""

    def __init__(self, models_dir: str | None = None) -> None:
        self.scaler = None
        self.binary_model = None
        self.synflood_model = None
        self.botnet_model = None
        self.ddos_model = None
        self.portscan_model = None
        self.loaded = False

        self.feature_columns = [
            'Flow Duration', 'Flow Bytes/s', 'Flow IAT Mean', 'Flow IAT Std',
            'Fwd IAT Total', 'Bwd IAT Total', 'Active Mean', 'Idle Mean',
            'Bwd Bulk Rate Avg', 'Fwd Bulk Rate Avg', 'Total TCP Flow Time',
            'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count',
            'PSH Flag Count', 'ACK Flag Count', 'Fwd PSH Flags', 'Bwd PSH Flags',
            'Total Fwd Packet', 'Total Bwd packets',
            'Flow Packets/s', 'Fwd Packets/s', 'Bwd Packets/s',
            'Packet Length Mean', 'Packet Length Std',
            'Fwd URG Flags', 'Bwd URG Flags', 'ICMP Code', 'ICMP Type'
        ]

        if models_dir:
            self.load(models_dir)

    def load(self, model_dir: str) -> None:
        try:
            import joblib
        except ImportError as exc:
            raise ImportError('joblib is required to load serialized model files') from exc

        scaler_path = os.path.join(model_dir, 'network_scaler.pkl')
        binary_path = os.path.join(model_dir, 'binary_anomaly_rf.pkl')
        synflood_path = os.path.join(model_dir, 'synflood_rf.pkl')
        botnet_path = os.path.join(model_dir, 'botnet_rf.pkl')
        ddos_path = os.path.join(model_dir, 'ddos_rf.pkl')
        portscan_path = os.path.join(model_dir, 'portscan_rf.pkl')

        # Load scaler
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
        self.scaler = joblib.load(scaler_path)

        # Load Tier 1 binary model
        if not os.path.exists(binary_path):
            raise FileNotFoundError(f"Binary anomaly detector not found: {binary_path}")
        self.binary_model = joblib.load(binary_path)

        # Load Tier 2 specialized models (gracefully fallback to None if missing)
        if os.path.exists(synflood_path):
            self.synflood_model = joblib.load(synflood_path)
        if os.path.exists(botnet_path):
            self.botnet_model = joblib.load(botnet_path)
        if os.path.exists(ddos_path):
            self.ddos_model = joblib.load(ddos_path)
        if os.path.exists(portscan_path):
            self.portscan_model = joblib.load(portscan_path)

        self.loaded = True

    def predict(self, features: FeatureDict) -> InferenceResult:
        if not self.loaded:
            raise RuntimeError('Hierarchical IDS Classifier must be loaded before predicting.')

        try:
            import pandas as pd
        except ImportError as exc:
            raise ImportError('pandas is required for feature vector formatting') from exc

        # 1. Represent features as a 1-row DataFrame matching training layout
        df = pd.DataFrame([features], columns=self.feature_columns)

        # 2. Preprocess features using the ColumnTransformer
        X_scaled = self.scaler.transform(df)

        # 3. Tier 1 classification: Anomaly vs Normal
        binary_pred = self.binary_model.predict(X_scaled)[0]
        binary_probs = self.binary_model.predict_proba(X_scaled)[0]
        anomaly_score = float(binary_probs[1]) if len(binary_probs) > 1 else float(binary_probs[0])

        if binary_pred == 0:
            return InferenceResult(label='normal', score=1.0 - anomaly_score, features=features)

        # 4. Tier 2: Route anomaly to subclass classifiers
        scores: Dict[str, float] = {}

        if self.synflood_model is not None:
            syn_probs = self.synflood_model.predict_proba(X_scaled)[0]
            scores['SYNC FLOOD'] = float(syn_probs[1]) if len(syn_probs) > 1 else float(syn_probs[0])

        if self.botnet_model is not None:
            bot_probs = self.botnet_model.predict_proba(X_scaled)[0]
            scores['BOTNET'] = float(bot_probs[1]) if len(bot_probs) > 1 else float(bot_probs[0])

        if self.ddos_model is not None:
            ddos_probs = self.ddos_model.predict_proba(X_scaled)[0]
            scores['DDOS'] = float(ddos_probs[1]) if len(ddos_probs) > 1 else float(ddos_probs[0])

        if self.portscan_model is not None:
            port_probs = self.portscan_model.predict_proba(X_scaled)[0]
            scores['PORTSCAN'] = float(port_probs[1]) if len(port_probs) > 1 else float(port_probs[0])

        if scores:
            best_label = max(scores, key=scores.get)
            best_score = scores[best_label]

            # If the highest probability is below 0.5, default to generic anomaly label
            if best_score < 0.5:
                return InferenceResult(label='attack', score=anomaly_score, features=features)
            else:
                return InferenceResult(label=best_label.lower(), score=best_score, features=features)
        else:
            return InferenceResult(label='attack', score=anomaly_score, features=features)

    def metadata(self) -> Dict[str, Any]:
        return {
            'name': 'HierarchicalIDSClassifier',
            'type': 'hierarchical_rf_composite',
            'loaded_submodels': {
                'binary_anomaly': self.binary_model is not None,
                'synflood': self.synflood_model is not None,
                'botnet': self.botnet_model is not None,
                'ddos': self.ddos_model is not None,
                'portscan': self.portscan_model is not None,
            }
        }
