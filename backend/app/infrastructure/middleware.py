"""
Enterprise FastAPI Middleware Suite
==================================
Includes request correlation ID tracking, processing latency header injection,
IP rate limiting, and structured HTTP audit logging.
"""

import time
import uuid
import logging
from typing import Dict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# Simple In-Memory Rate Limiter (IP-based)
class RateLimiter:
    def __init__(self, requests_per_minute: int = 120):
        self.rpm = requests_per_minute
        self.clients: Dict[str, list] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        minute_ago = now - 60.0

        if client_ip not in self.clients:
            self.clients[client_ip] = [now]
            return True

        # Clean timestamps older than 60s
        self.clients[client_ip] = [t for t in self.clients[client_ip] if t > minute_ago]

        if len(self.clients[client_ip]) >= self.rpm:
            return False

        self.clients[client_ip].append(now)
        return True


rate_limiter = RateLimiter(requests_per_minute=200)


class RequestCorrelationMiddleware(BaseHTTPMiddleware):
    """Adds X-Request-ID and X-Process-Time headers to every request for tracing."""
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time * 1000:.2f}ms"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Enforces client IP rate limiting on public endpoints."""
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        if not rate_limiter.is_allowed(client_ip):
            logger.warning(f"[RateLimit] IP {client_ip} exceeded rate limit on {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "TooManyRequests",
                    "message": "Rate limit exceeded. Please slow down your requests.",
                    "retry_recommended": True
                }
            )

        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces OWASP recommended security headers for production protection."""
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response
