"""
Admin Operating System Repository Layer
======================================
Database CRUD, seed data initialization, and audit logging for Enterprise Admin Control Center.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.infrastructure.database import (
    DBAppSetting, DBAIEngineConfig, DBFeatureFlag, DBSubscriptionPlan,
    DBPromptTemplate, DBAuditLog, DBRolePermission, DBCMSContent,
    DBPaymentSetting, DBEmailSetting, DBUser, DBTransaction
)

class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def seed_defaults_if_empty(self):
        """Initializes default settings, AI engine configs, feature flags, plans, prompts, roles, and CMS content."""
        # 1. App Settings
        if not self.db.query(DBAppSetting).filter(DBAppSetting.key == "general_settings").first():
            self.db.add(DBAppSetting(
                key="general_settings",
                category="general",
                value_json={
                    "app_name": "Naija Career AI",
                    "logo_url": "/logo.svg",
                    "favicon_url": "/favicon.ico",
                    "primary_color": "#10B981",
                    "secondary_color": "#6366F1",
                    "footer_text": "© 2026 Naija Career AI. All rights reserved.",
                    "support_email": "support@naijacareer.ai",
                    "contact_phone": "+234 800 000 0000",
                    "maintenance_mode": False,
                    "registration_enabled": True,
                    "allow_guest_usage": False,
                    "email_verification_required": True
                }
            ))

        # 2. AI Engine Configs
        ai_providers_data = [
            {"provider_key": "gemini", "is_enabled": True, "priority_order": 1, "model_name": "gemini-2.5-flash", "temperature": 0.7, "top_p": 0.9, "max_tokens": 4096, "daily_token_budget": 1000000, "monthly_token_budget": 30000000, "health_status": "operational", "latency_ms": 110},
            {"provider_key": "groq", "is_enabled": True, "priority_order": 2, "model_name": "llama-3.3-70b-versatile", "temperature": 0.6, "top_p": 0.9, "max_tokens": 4096, "daily_token_budget": 1000000, "monthly_token_budget": 30000000, "health_status": "operational", "latency_ms": 85},
            {"provider_key": "openrouter", "is_enabled": True, "priority_order": 3, "model_name": "anthropic/claude-3.5-sonnet", "temperature": 0.7, "top_p": 0.9, "max_tokens": 4096, "daily_token_budget": 500000, "monthly_token_budget": 15000000, "health_status": "operational", "latency_ms": 210},
            {"provider_key": "vertex", "is_enabled": True, "priority_order": 4, "model_name": "text-bison@002", "temperature": 0.7, "top_p": 0.9, "max_tokens": 2048, "daily_token_budget": 500000, "monthly_token_budget": 15000000, "health_status": "operational", "latency_ms": 190},
            {"provider_key": "openai", "is_enabled": False, "priority_order": 5, "model_name": "gpt-4o", "temperature": 0.7, "top_p": 0.9, "max_tokens": 4096, "daily_token_budget": 500000, "monthly_token_budget": 15000000, "health_status": "operational", "latency_ms": 150},
            {"provider_key": "anthropic", "is_enabled": False, "priority_order": 6, "model_name": "claude-3-5-haiku-20241022", "temperature": 0.7, "top_p": 0.9, "max_tokens": 4096, "daily_token_budget": 500000, "monthly_token_budget": 15000000, "health_status": "operational", "latency_ms": 175}
        ]
        for p in ai_providers_data:
            if not self.db.query(DBAIEngineConfig).filter(DBAIEngineConfig.provider_key == p["provider_key"]).first():
                self.db.add(DBAIEngineConfig(**p))

        # 3. Feature Flags
        flags_data = [
            {"feature_key": "resume_analyzer", "name": "ATS Resume Analyzer & Scorer", "status": "enabled", "category": "core"},
            {"feature_key": "cover_letter_generator", "name": "Fact-Checked Cover Letter Engine", "status": "enabled", "category": "core"},
            {"feature_key": "job_match", "name": "Semantic Job Parser & Matcher", "status": "enabled", "category": "core"},
            {"feature_key": "interview_coach", "name": "AI STAR Interview Simulator", "status": "enabled", "category": "core"},
            {"feature_key": "nysc_hub", "name": "NYSC Graduate Trainee Hub", "status": "enabled", "category": "local"},
            {"feature_key": "nigeria_insights", "name": "Nigeria Industry & Salary Insights", "status": "enabled", "category": "local"},
            {"feature_key": "visa_assessment", "name": "Global Relocation & Visa Pathway Checker", "status": "beta", "category": "global"},
            {"feature_key": "realtime_streaming", "name": "Real-Time AI SSE Streaming", "status": "enabled", "category": "ai"}
        ]
        for f in flags_data:
            if not self.db.query(DBFeatureFlag).filter(DBFeatureFlag.feature_key == f["feature_key"]).first():
                self.db.add(DBFeatureFlag(**f))

        # 4. Subscription Plans
        plans_data = [
            {
                "plan_key": "free",
                "name": "Free Tier",
                "price_ngn": 0,
                "price_usd": 0,
                "limits_json": {"resume_analyses": 3, "cover_letters": 2, "job_matches": 5, "interview_practice": 1},
                "features_json": ["3 ATS Resume Scans / mo", "2 Cover Letters / mo", "5 Job Matches / mo", "1 Mock Interview / mo"]
            },
            {
                "plan_key": "starter",
                "name": "Starter Plan",
                "price_ngn": 2500,
                "price_usd": 5,
                "limits_json": {"resume_analyses": 20, "cover_letters": 15, "job_matches": 50, "interview_practice": 10},
                "features_json": ["20 ATS Resume Scans / mo", "15 Cover Letters / mo", "50 Job Matches / mo", "10 Mock Interviews / mo"]
            },
            {
                "plan_key": "professional",
                "name": "Professional Plan",
                "price_ngn": 5000,
                "price_usd": 10,
                "limits_json": {"resume_analyses": 100, "cover_letters": 75, "job_matches": 999999, "interview_practice": 50},
                "features_json": ["100 ATS Resume Scans / mo", "75 Cover Letters / mo", "Unlimited Job Matches", "50 Mock Interviews / mo", "Priority Queue"]
            },
            {
                "plan_key": "enterprise",
                "name": "Enterprise Pass",
                "price_ngn": 12000,
                "price_usd": 25,
                "limits_json": {"resume_analyses": 999999, "cover_letters": 999999, "job_matches": 999999, "interview_practice": 999999},
                "features_json": ["Unlimited Scans", "Unlimited Cover Letters", "Unlimited Job Matches", "Unlimited Mock Interviews", "VIP 1-on-1 Prompts"]
            }
        ]
        for plan in plans_data:
            if not self.db.query(DBSubscriptionPlan).filter(DBSubscriptionPlan.plan_key == plan["plan_key"]).first():
                self.db.add(DBSubscriptionPlan(**plan))

        # 5. Prompt Templates
        prompts_data = [
            {
                "prompt_key": "resume_ats",
                "title": "ATS Resume Scorer System Prompt",
                "system_prompt": "You are an elite Applicant Tracking System (ATS) auditor for top Nigerian and global employers (Banking, Fintech, FMCG, Oil & Gas). Analyze the resume objectively.",
                "user_prompt_template": "Evaluate candidate resume against job title: {{target_job_title}}. Return ATS score 0-100, keyword gaps, and formatting feedback."
            },
            {
                "prompt_key": "cover_letter",
                "title": "Fact-Checked Cover Letter Prompt",
                "system_prompt": "You are a professional executive resume writer. Generate a tailored 1-page cover letter bound strictly to candidate resume facts. Never invent or hallucinate metrics.",
                "user_prompt_template": "Write cover letter for {{company_name}} for role {{job_title}} using resume text: {{resume_text}}."
            },
            {
                "prompt_key": "interview_star",
                "title": "STAR Mock Interview Simulator Prompt",
                "system_prompt": "You are a Senior Talent Acquisition Lead conducting a mock interview. Generate 5 distinct questions (Technical, Behavioral, HR, Situational, STAR) with model answers and rubrics.",
                "user_prompt_template": "Generate interview questions for role {{job_role}} in industry {{industry}} based on resume: {{resume_text}}."
            }
        ]
        for p in prompts_data:
            if not self.db.query(DBPromptTemplate).filter(DBPromptTemplate.prompt_key == p["prompt_key"]).first():
                self.db.add(DBPromptTemplate(**p))

        # 6. Payment Settings
        payment_gateways = [
            {"gateway_key": "paystack", "name": "Paystack (NGN ₦)", "is_enabled": True, "currencies": ["NGN"], "public_key": "pk_test_mock_paystack", "secret_key": "sk_test_mock_paystack"},
            {"gateway_key": "stripe", "name": "Stripe (USD $)", "is_enabled": True, "currencies": ["USD"], "public_key": "pk_test_mock_stripe", "secret_key": "sk_test_mock_stripe"},
            {"gateway_key": "flutterwave", "name": "Flutterwave (Multi-Currency)", "is_enabled": False, "currencies": ["NGN", "USD", "GHS", "KES"], "public_key": "FLWPUBK_TEST_mock", "secret_key": "FLWSECK_TEST_mock"}
        ]
        for g in payment_gateways:
            if not self.db.query(DBPaymentSetting).filter(DBPaymentSetting.gateway_key == g["gateway_key"]).first():
                self.db.add(DBPaymentSetting(**g))

        # 7. Role Permissions
        roles_data = [
            {"role_key": "super_admin", "name": "Super Admin", "permissions_json": ["*"]},
            {"role_key": "admin", "name": "Administrator", "permissions_json": ["users:*", "ai:*", "prompts:*", "features:*", "settings:read"]},
            {"role_key": "support", "name": "Customer Support", "permissions_json": ["users:read", "users:reset_usage", "users:impersonate"]},
            {"role_key": "finance", "name": "Finance & Billing", "permissions_json": ["payments:*", "subscriptions:*", "analytics:read"]}
        ]
        for r in roles_data:
            if not self.db.query(DBRolePermission).filter(DBRolePermission.role_key == r["role_key"]).first():
                self.db.add(DBRolePermission(**r))

        self.db.commit()

    def log_audit(self, admin_email: str, action: str, resource_type: str, resource_id: Optional[str] = None, details: Optional[Dict[str, Any]] = None, ip: str = "127.0.0.1"):
        """Logs an admin action to the audit trail."""
        log = DBAuditLog(
            admin_email=admin_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details_json=details or {},
            ip_address=ip
        )
        self.db.add(log)
        self.db.commit()
