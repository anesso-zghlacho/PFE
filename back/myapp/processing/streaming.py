from __future__ import annotations

import abc
from typing import Any, Dict


class EventPublisher(abc.ABC):
    """Abstract publisher for real-time IDS event streaming."""

    @abc.abstractmethod
    def publish(self, topic: str, payload: Dict[str, Any]) -> None:
        raise NotImplementedError


class RedisPublisher(EventPublisher):
    def __init__(self, redis_client: Any) -> None:
        self.redis = redis_client

    def publish(self, topic: str, payload: Dict[str, Any]) -> None:
        self.redis.publish(topic, payload)


class KafkaPublisher(EventPublisher):
    def __init__(self, kafka_producer: Any) -> None:
        self.producer = kafka_producer

    def publish(self, topic: str, payload: Dict[str, Any]) -> None:
        self.producer.send(topic, payload)
