"""
Asynchronous Background Task Manager
====================================
Manages background non-blocking execution for heavy telemetry, document exports,
usage analytics logging, and notification dispatches.
"""

import asyncio
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

class BackgroundTaskManager:
    @staticmethod
    def run_task(func: Callable, *args: Any, **kwargs: Any):
        """Schedule a background task in the running event loop without blocking."""
        try:
            loop = asyncio.get_running_loop()
            if asyncio.iscoroutinefunction(func):
                task = loop.create_task(func(*args, **kwargs))
            else:
                task = loop.run_in_executor(None, func, *args, **kwargs)

            task.add_done_callback(BackgroundTaskManager._task_callback)
        except Exception as e:
            logger.error(f"[BackgroundTask] Failed to schedule task {func.__name__}: {e}")

    @staticmethod
    def _task_callback(task: asyncio.Task):
        try:
            task.result()
        except Exception as e:
            logger.error(f"[BackgroundTask Error] Background execution failed: {e}", exc_info=True)


background_task_manager = BackgroundTaskManager()
