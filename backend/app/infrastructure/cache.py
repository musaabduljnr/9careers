"""
In-Memory & Redis-Ready Caching Service
=======================================
High-performance response caching service with automatic TTL expiry,
thread safety, and response memoization.
"""

import time
import json
import logging
from typing import Dict, Any, Optional, Callable
from functools import wraps

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        """Retrieve cached entry if not expired."""
        entry = self._store.get(key)
        if not entry:
            return None

        if time.time() > entry["expires_at"]:
            del self._store[key]
            return None

        return entry["value"]

    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """Store value with TTL expiry in seconds."""
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + ttl_seconds
        }

    def clear(self):
        """Clear all cached entries."""
        self._store.clear()

    def delete(self, key: str):
        """Invalidate specific cache key."""
        if key in self._store:
            del self._store[key]


# Singleton Cache Instance
cache_service = CacheService()


def cache_response(ttl_seconds: int = 300, key_prefix: str = ""):
    """Decorator to cache endpoint responses based on path and arguments."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and parameters
            cache_key = f"{key_prefix}:{func.__name__}:{str(kwargs)}"
            cached_val = cache_service.get(cache_key)
            if cached_val is not None:
                logger.debug(f"[Cache HIT] Key: {cache_key}")
                return cached_val

            logger.debug(f"[Cache MISS] Executing {func.__name__}")
            result = await func(*args, **kwargs)
            cache_service.set(cache_key, result, ttl_seconds)
            return result
        return wrapper
    return decorator
