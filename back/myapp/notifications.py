from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)

class NotificationService(ABC):
    @abstractmethod
    def notify(self, title: str, description: str, severity: str):
        pass

class ConsoleNotificationService(NotificationService):
    def notify(self, title: str, description: str, severity: str):
        print(f"\n[NOTIFICATION] {severity}: {title}")
        print(f"Details: {description}\n")
        logger.info(f"Notification sent: {title} ({severity})")

class SlackNotificationService(NotificationService):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    def notify(self, title: str, description: str, severity: str):
        # Placeholder for Slack implementation
        logger.info(f"Slack notification (placeholder) to {self.webhook_url}: {title}")
        pass

def get_notification_service():
    # In a real app, this could read from settings
    return ConsoleNotificationService()
