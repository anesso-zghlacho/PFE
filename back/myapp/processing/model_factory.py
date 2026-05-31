from __future__ import annotations

from typing import Any

from .model_wrappers import (
    MockModel, 
    RandomForestModel,
    BinaryAnomalyClassifierRF,
    PortscanClassifierRF,
    SynFloodClassifierRF,
    DDoSClassifierRF,
    BotnetClassifierRF,
    HierarchicalIDSClassifier
)
from .model_base import BaseModel


def create_model(model_type: str, **kwargs: Any) -> BaseModel:
    registry: dict[str, type[BaseModel]] = {
        'mock': MockModel,
        'hierarchical': HierarchicalIDSClassifier,
        'sklearn_rf': RandomForestModel,
        'binary_anomaly_rf': BinaryAnomalyClassifierRF,
        'portscan_rf': PortscanClassifierRF,
        'synflood_rf': SynFloodClassifierRF,
        'ddos_rf': DDoSClassifierRF,
        'botnet_rf': BotnetClassifierRF,
    }
    model_type = model_type.lower()
    if model_type not in registry:
        raise ValueError(f'Unsupported model type: {model_type}')
    return registry[model_type](**kwargs)
