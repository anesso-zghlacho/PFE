import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demo.settings")
django.setup()

from django.test import Client
from django.contrib.auth.models import User

client = Client()
client.login(username='admin', password='admin123')
response = client.get('/api/access-logs/')
print(response.status_code)
print(response.content.decode('utf-8'))
