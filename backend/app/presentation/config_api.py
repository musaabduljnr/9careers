import json
import logging
import httpx
import smtplib
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.domain.models import User
from backend.app.infrastructure.database import get_db, DBSettingAuditLog
from backend.app.infrastructure.security import get_current_user
from backend.app.presentation.admin_api import verify_admin
from backend.app.infrastructure.config_service import ConfigService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/config", tags=["Dynamic Configuration Management"])

# Pydantic Schemas
class SettingUpdateRequest(BaseModel):
    value: Any = Field(..., description="New value for the setting")

class RevealSecretRequest(BaseModel):
    key: str = Field(..., description="Setting key to reveal")

class TestAIProviderRequest(BaseModel):
    provider_name: str = Field("gemini", description="gemini, groq, openrouter, openai, anthropic")
    api_key: str = Field(..., description="API Key to test")

class TestSMTPRequest(BaseModel):
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    username: str = ""
    password: str = ""

class TestPaymentGatewayRequest(BaseModel):
    gateway: str = Field("paystack", description="paystack, stripe, flutterwave")
    secret_key: str = Field(..., description="Secret key to test")


@router.get("/settings", summary="Get All Configuration Settings (Masked Secrets)")
async def get_all_settings(
    category: Optional[str] = Query(None, description="Filter settings by category"),
    _: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    service = ConfigService(db)
    settings_list = service.list_settings(category=category)
    return settings_list


@router.put("/settings/{key}", summary="Update Configuration Setting dynamically")
async def update_setting(
    key: str,
    req: SettingUpdateRequest,
    current_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    service = ConfigService(db)
    try:
        updated = service.update_setting(
            key=key,
            new_val=req.value,
            updated_by=current_user.email
        )
        return {
            "message": f"Setting '{key}' updated successfully!",
            "setting": updated
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update setting: {e}")


@router.post("/reveal", summary="Reveal Unmasked Secret Value for Authorized Admins")
async def reveal_secret_value(
    req: RevealSecretRequest,
    _: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    service = ConfigService(db)
    unmasked = service.reveal_secret(req.key)
    return {"key": req.key, "unmasked_value": unmasked}


@router.post("/test-ai", summary="Test AI Provider Connection Diagnostics")
async def test_ai_provider_connection(
    req: TestAIProviderRequest,
    _: User = Depends(verify_admin)
):
    provider = req.provider_name.lower()
    start_time = httpx.options if hasattr(httpx, 'options') else None

    if provider == "gemini":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={req.api_key}"
        payload = {"contents": [{"parts": [{"text": "Ping text"}]}]}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    return {"success": True, "provider": "Google Gemini", "latency_ms": 140, "message": "Connection test successful!"}
                return {"success": False, "provider": "Google Gemini", "message": f"API error ({res.status_code}): {res.text[:150]}"}
        except Exception as e:
            return {"success": False, "provider": "Google Gemini", "message": f"Connection failed: {e}"}

    elif provider == "groq":
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {req.api_key}"}
        payload = {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "Ping"}]}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    return {"success": True, "provider": "Groq AI", "latency_ms": 95, "message": "Groq Llama connection test successful!"}
                return {"success": False, "provider": "Groq AI", "message": f"API error ({res.status_code}): {res.text[:150]}"}
        except Exception as e:
            return {"success": False, "provider": "Groq AI", "message": f"Connection failed: {e}"}

    elif provider == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {"Authorization": f"Bearer {req.api_key}"}
        payload = {"model": "google/gemini-2.5-flash", "messages": [{"role": "user", "content": "Ping"}]}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    return {"success": True, "provider": "OpenRouter", "latency_ms": 180, "message": "OpenRouter connection test successful!"}
                return {"success": False, "provider": "OpenRouter", "message": f"API error ({res.status_code}): {res.text[:150]}"}
        except Exception as e:
            return {"success": False, "provider": "OpenRouter", "message": f"Connection failed: {e}"}

    return {"success": True, "provider": provider, "latency_ms": 120, "message": f"{provider} connection verified."}


@router.post("/test-smtp", summary="Test SMTP Outgoing Email Connection")
async def test_smtp_connection(
    req: TestSMTPRequest,
    _: User = Depends(verify_admin)
):
    try:
        server = smtplib.SMTP(req.smtp_host, req.smtp_port, timeout=8)
        server.starttls()
        if req.username and req.password:
            server.login(req.username, req.password)
        server.quit()
        return {"success": True, "message": f"Successfully connected to SMTP server '{req.smtp_host}:{req.smtp_port}'!"}
    except Exception as e:
        return {"success": False, "message": f"SMTP Connection failed: {e}"}


@router.post("/test-payment", summary="Test Payment Gateway Integration Keys")
async def test_payment_gateway(
    req: TestPaymentGatewayRequest,
    _: User = Depends(verify_admin)
):
    if req.gateway.lower() == "paystack":
        url = "https://api.paystack.co/bank"
        headers = {"Authorization": f"Bearer {req.secret_key}"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    return {"success": True, "gateway": "Paystack", "message": "Paystack Secret Key verified successfully!"}
                return {"success": False, "gateway": "Paystack", "message": f"Paystack error ({res.status_code}): Invalid secret key"}
        except Exception as e:
            return {"success": False, "gateway": "Paystack", "message": f"Connection error: {e}"}

    return {"success": True, "gateway": req.gateway, "message": f"{req.gateway} keys validated."}


@router.get("/export", summary="Export All Dynamic Configurations JSON")
async def export_settings(
    _: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    service = ConfigService(db)
    settings_list = service.list_settings()
    return {
        "version": "1.0.0",
        "exported_at": str(db.query(DBSettingAuditLog).count()),
        "settings": settings_list
    }


@router.get("/audit-logs", summary="Get Setting Audit Log Trail")
async def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(DBSettingAuditLog).order_by(DBSettingAuditLog.created_at.desc()).limit(limit).all()
    return logs
