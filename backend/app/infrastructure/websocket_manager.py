import json
import logging
import asyncio
from typing import Dict, List, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class InterviewWebSocketManager:
    def __init__(self):
        # Map session_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Lock for connection safety
        self.lock = asyncio.Lock()

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            if session_id not in self.active_connections:
                self.active_connections[session_id] = set()
            self.active_connections[session_id].add(websocket)
        logger.info(f"[WebSocket] Connected client to session: {session_id}")

    async def disconnect(self, session_id: str, websocket: WebSocket):
        async with self.lock:
            if session_id in self.active_connections:
                self.active_connections[session_id].discard(websocket)
                if not self.active_connections[session_id]:
                    del self.active_connections[session_id]
        logger.info(f"[WebSocket] Disconnected client from session: {session_id}")

    async def send_json(self, session_id: str, data: Dict[str, Any]):
        async with self.lock:
            connections = list(self.active_connections.get(session_id, []))
        
        for websocket in connections:
            try:
                await websocket.send_json(data)
            except Exception as e:
                logger.warning(f"[WebSocket] Error sending json to session {session_id}: {e}")

    async def broadcast_text_chunk(self, session_id: str, chunk: str, turn_index: int):
        await self.send_json(session_id, {
            "type": "text_chunk",
            "chunk": chunk,
            "turn_index": turn_index
        })

    async def broadcast_event(self, session_id: str, event_type: str, payload: Dict[str, Any]):
        await self.send_json(session_id, {
            "type": event_type,
            "data": payload
        })

ws_manager = InterviewWebSocketManager()
