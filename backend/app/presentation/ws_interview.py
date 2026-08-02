import json
import logging
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from backend.app.infrastructure.database import get_db
from backend.app.infrastructure.repositories import (
    UserRepositoryImpl, InterviewRepositoryImpl
)
from backend.app.infrastructure.ai_providers import AIProviderFactory
from backend.app.application.use_cases import InterviewSimulatorUseCase
from backend.app.infrastructure.websocket_manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/api/v1/interviews/ws/{session_id}")
async def websocket_interview_endpoint(websocket: WebSocket, session_id: str, db: Session = Depends(get_db)):
    await ws_manager.connect(session_id, websocket)
    
    ai_provider = AIProviderFactory.get_provider()
    interview_repo = InterviewRepositoryImpl(db)
    user_repo = UserRepositoryImpl(db)
    simulator = InterviewSimulatorUseCase(ai_provider, interview_repo, user_repo)

    try:
        # Fetch current session state upon connection
        session = await interview_repo.get_session_by_id(session_id)
        if session:
            await websocket.send_json({
                "type": "session_init",
                "data": {
                    "session_id": session.id,
                    "status": session.status,
                    "job_role": session.job_role,
                    "company": session.company,
                    "interview_type": session.interview_type,
                    "elapsed_seconds": session.elapsed_seconds,
                    "questions_count": len(session.questions),
                    "current_question": session.questions[-1].question_text if session.questions else None,
                    "current_category": session.questions[-1].category if session.questions else None
                }
            })

        while True:
            # Wait for incoming client events
            raw_msg = await websocket.receive_text()
            try:
                msg = json.loads(raw_msg)
            except Exception:
                await websocket.send_json({"type": "error", "message": "Invalid JSON format"})
                continue

            event_type = msg.get("type")
            payload = msg.get("payload", {})

            if event_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif event_type == "submit_answer":
                user_answer = payload.get("user_answer", "").strip()
                elapsed = payload.get("elapsed_seconds", 0)

                if not user_answer:
                    await websocket.send_json({"type": "error", "message": "Answer cannot be empty"})
                    continue

                # Notify client that server is processing candidate answer
                await websocket.send_json({"type": "processing_turn", "message": "Evaluating response and generating follow-up..."})

                try:
                    turn_res = await simulator.respond_to_question(
                        session_id=session_id,
                        user_answer=user_answer,
                        elapsed_seconds=elapsed
                    )

                    await ws_manager.broadcast_event(session_id, "turn_completed", turn_res)
                except Exception as e:
                    logger.error(f"[WS] Error processing turn: {e}", exc_info=True)
                    await websocket.send_json({"type": "error", "message": str(e)})

            elif event_type == "action":
                action_name = payload.get("action")
                current_sess = await interview_repo.get_session_by_id(session_id)
                if current_sess:
                    if action_name == "pause":
                        current_sess.status = "paused"
                    elif action_name == "resume":
                        current_sess.status = "active"
                    elif action_name == "end":
                        current_sess.status = "completed"
                        # Generate final report if ending early
                        from backend.app.application.interview_engine import ReportEngine
                        report_eng = ReportEngine(ai_provider)
                        full_rep = await report_eng.generate_report(current_sess)
                        current_sess.full_report = full_rep
                        current_sess.coach_advice = full_rep.get("coach_advice", {})
                        current_sess.score = full_rep.get("overall_score", 75)
                    
                    await interview_repo.update_session(current_sess)
                    await ws_manager.broadcast_event(session_id, "status_changed", {
                        "session_id": session_id,
                        "status": current_sess.status,
                        "full_report": current_sess.full_report if current_sess.status == "completed" else None
                    })

    except WebSocketDisconnect:
        await ws_manager.disconnect(session_id, websocket)
    except Exception as e:
        logger.error(f"[WS Error] Connection error for session {session_id}: {e}", exc_info=True)
        await ws_manager.disconnect(session_id, websocket)
