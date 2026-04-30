from __future__ import annotations

from typing import Any

from .model_wrappers import MockModel, SklearnModel, PyTorchModel, XGBoostModel
from .model_base import BaseModel


def create_model(model_type: str, **kwargs: Any) -> BaseModel:
    registry: dict[str, type[BaseModel]] = {
        'mock': MockModel,
        'sklearn': SklearnModel,
        'pytorch': PyTorchModel,
        'xgboost': XGBoostModel,
    }
    model_type = model_type.lower()
    if model_type not in registry:
        raise ValueError(f'Unsupported model type: {model_type}')
    return registry[model_type](**kwargs)
