from django.utils.decorators import decorator_from_middleware_with_args
from django.views.decorators.csrf import csrf_exempt


class DisableCsrfForAuthMiddleware:
    """Middleware to disable CSRF protection for authentication endpoints"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.exempt_paths = [
            '/api/auth/login/',
            '/api/auth/register/', 
            '/api/auth/logout/',
            '/api/auth/csrf/',
            '/api/sniffer/start/',
            '/api/sniffer/stop/',
        ]
    
    def __call__(self, request):
        # Check if the request path is in exempt paths
        if request.path in self.exempt_paths:
            # Mark the request to skip CSRF validation
            request._dont_enforce_csrf_checks = True
        
        response = self.get_response(request)
        return response
