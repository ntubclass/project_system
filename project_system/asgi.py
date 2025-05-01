# asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from task_manager import routing  # Assuming you have a 'chat' app and routing defined there

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_system.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handles HTTP requests (traditional Django views)
    "websocket": AuthMiddlewareStack(  # Handles WebSocket connections with authentication
        URLRouter(
            routing.websocket_urlpatterns  # Define your WebSocket URL patterns in routing.py
        )
    ),
})
