"""
Enterprise Admin Data & Configuration Service
=============================================
Manages stateful runtime configurations for AI providers, fallback order,
feature flags, prompt templates, developer API keys, system logs, and platform analytics.
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta

# Default AI Provider Configuration
admin_ai_settings: Dict[str, Any] = {
    "active_provider": "gemini",
    "fallback_order": ["gemini", "groq", "openrouter", "vertex", "mock"],
    "rate_limiting": {
        "global_tpm": 100000,
        "global_rpm": 600,
        "user_daily_limit": 50,
        "enabled": True
    },
    "providers": {
        "gemini": {
            "name": "Google Gemini 2.5 Flash",
            "provider_key": "gemini",
            "status": "Healthy",
            "api_key_configured": True,
            "masked_key": "AIzaSy...X90k",
            "latency_p95_ms": 420,
            "success_rate": 99.8,
            "cost_per_1k_tokens": "$0.00015",
            "model_name": "gemini-2.5-flash",
            "temperature_default": 0.7,
            "max_output_tokens": 8192
        },
        "groq": {
            "name": "Groq Llama-3 70B",
            "provider_key": "groq",
            "status": "Healthy",
            "api_key_configured": True,
            "masked_key": "gsk_...882x",
            "latency_p95_ms": 180,
            "success_rate": 99.9,
            "cost_per_1k_tokens": "$0.00059",
            "model_name": "llama3-70b-8192",
            "temperature_default": 0.7,
            "max_output_tokens": 4096
        },
        "openrouter": {
            "name": "OpenRouter (Claude 3.5 Sonnet / GPT-4o)",
            "provider_key": "openrouter",
            "status": "Degraded",
            "api_key_configured": True,
            "masked_key": "sk-or-v1...9b2a",
            "latency_p95_ms": 1250,
            "success_rate": 97.4,
            "cost_per_1k_tokens": "$0.00300",
            "model_name": "anthropic/claude-3.5-sonnet",
            "temperature_default": 0.7,
            "max_output_tokens": 8192
        },
        "vertex": {
            "name": "Google Cloud Vertex AI (Gemini Pro)",
            "provider_key": "vertex",
            "status": "Healthy",
            "api_key_configured": True,
            "masked_key": "gcp-sa-...prod.json",
            "latency_p95_ms": 380,
            "success_rate": 99.9,
            "cost_per_1k_tokens": "$0.00125",
            "model_name": "gemini-1.5-pro",
            "temperature_default": 0.7,
            "max_output_tokens": 8192
        }
    }
}

# Feature Flags
admin_feature_flags: List[Dict[str, Any]] = [
    {
        "key": "ai_cover_letter_generator",
        "name": "AI Cover Letter Generator",
        "description": "Enables bespoke cover letter generation with facts verification",
        "enabled": True,
        "rollout_percentage": 100,
        "environment": "Production",
        "category": "Core Features"
    },
    {
        "key": "semantic_job_matcher",
        "name": "Semantic Job Match Engine",
        "description": "Cosine similarity embedding match vs simple keyword matching",
        "enabled": True,
        "rollout_percentage": 100,
        "environment": "Production",
        "category": "AI Features"
    },
    {
        "key": "interview_question_bank",
        "name": "Role-Specific Interview Question Bank",
        "description": "Generates 5 question types with model answers and 1-5 rubrics",
        "enabled": True,
        "rollout_percentage": 100,
        "environment": "Production",
        "category": "AI Features"
    },
    {
        "key": "nigeria_career_insights",
        "name": "Nigeria Career Insights Module",
        "description": "Provides industry salary data, skills demand & visa opportunities",
        "enabled": True,
        "rollout_percentage": 100,
        "environment": "Production",
        "category": "Insights"
    },
    {
        "key": "a4_print_templates",
        "name": "A4 Printable Resume Builder",
        "description": "Generates A4 standardized printable HTML/CSS templates",
        "enabled": True,
        "rollout_percentage": 100,
        "environment": "Production",
        "category": "UI Features"
    },
    {
        "key": "realtime_voice_mock_interview",
        "name": "Voice-Enabled Interactive Mock Interview",
        "description": "WebRTC real-time audio interview simulation",
        "enabled": False,
        "rollout_percentage": 20,
        "environment": "Beta",
        "category": "Experimental"
    }
]

# Prompt Templates
admin_prompt_templates: Dict[str, Any] = {
    "ats_resume_scorer": {
        "id": "ats_resume_scorer",
        "name": "ATS Resume Scorer & Analyzer",
        "description": "Calculates ATS match score (0-100), parses profile, detects weak bullets and NYSC status.",
        "temperature": 0.2,
        "max_tokens": 4000,
        "version": "v2.4",
        "system_instruction": (
            "You are an expert ATS scanner and career coach specializing in the Nigerian job market. "
            "Your job is to analyze the candidate's resume and calculate an ATS match score (0-100), parse resume sections, "
            "identify missing skills/keywords, and provide constructive optimization tips."
        )
    },
    "cover_letter_generator": {
        "id": "cover_letter_generator",
        "name": "Bespoke Cover Letter Generator",
        "description": "Generates a 1-page ATS-friendly cover letter bound strictly to resume facts.",
        "temperature": 0.5,
        "max_tokens": 3000,
        "version": "v1.8",
        "system_instruction": (
            "You are a premium career consultant. Write a bespoke, highly compelling, ATS-friendly cover letter under 400 words. "
            "NEVER hallucinate experience or degrees not present in the candidate's resume. Support British English spelling."
        )
    },
    "interview_question_generator": {
        "id": "interview_question_generator",
        "name": "Interview Question & Rubric Generator",
        "description": "Generates Technical, Behavioral, HR, Situational, and STAR questions with model answers and rubrics.",
        "temperature": 0.4,
        "max_tokens": 6000,
        "version": "v3.0",
        "system_instruction": (
            "You are a Senior Talent Acquisition Specialist. Generate personalized interview questions, model answers grounded "
            "strictly in the resume, STAR breakdowns, and 1-5 scoring rubrics."
        )
    },
    "resume_bullet_rewriter": {
        "id": "resume_bullet_rewriter",
        "name": "High-Impact Bullet Rewriter",
        "description": "Replaces passive voice with active verbs and introduces outcome metrics.",
        "temperature": 0.3,
        "max_tokens": 1500,
        "version": "v1.2",
        "system_instruction": (
            "You are an expert resume writer. Rewrite passive resume bullet points using strong active verbs, "
            "grammatical correctness, and outcome metrics."
        )
    }
}

# API Keys (Platform Developer & Internal Access)
admin_api_keys: List[Dict[str, Any]] = [
    {
        "id": "key_01",
        "name": "Mobile App Production Key",
        "key_prefix": "nci_live_8f3a...",
        "created_at": "2025-11-10T10:00:00Z",
        "last_used_at": "2026-08-02T04:12:00Z",
        "rate_limit_rpm": 120,
        "monthly_quota": 500000,
        "monthly_used": 142800,
        "status": "Active",
        "role": "Client Application"
    },
    {
        "id": "key_02",
        "name": "Jobberman Integration Webhook",
        "key_prefix": "nci_live_3b9c...",
        "created_at": "2026-01-15T14:30:00Z",
        "last_used_at": "2026-08-02T02:45:00Z",
        "rate_limit_rpm": 300,
        "monthly_quota": 1000000,
        "monthly_used": 684200,
        "status": "Active",
        "role": "Partner API"
    },
    {
        "id": "key_03",
        "name": "Staging Development Key",
        "key_prefix": "nci_test_92e1...",
        "created_at": "2026-04-01T09:00:00Z",
        "last_used_at": "2026-08-01T18:20:00Z",
        "rate_limit_rpm": 60,
        "monthly_quota": 100000,
        "monthly_used": 12400,
        "status": "Active",
        "role": "Development"
    }
]

# Admin Roles & Team Members
admin_roles_and_team: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "Musa Abubakar",
        "email": "musa.admin@naijacareer.ai",
        "role": "Super Admin",
        "permissions": ["All Access", "Provider Switch", "Billing", "User Ban"],
        "status": "Active",
        "last_login": "2026-08-02T04:30:00Z"
    },
    {
        "id": 2,
        "name": "Amina Bello",
        "email": "amina.aiops@naijacareer.ai",
        "role": "AI Ops / Prompt Engineer",
        "permissions": ["Prompt Templates", "Provider Settings", "System Logs"],
        "status": "Active",
        "last_login": "2026-08-01T16:45:00Z"
    },
    {
        "id": 3,
        "name": "Chidi Okonkwo",
        "email": "chidi.finance@naijacareer.ai",
        "role": "Financial Analyst",
        "permissions": ["Payments", "Subscriptions", "Token Usage Analytics"],
        "status": "Active",
        "last_login": "2026-07-31T11:20:00Z"
    }
]

# System Logs (Recent Activity Feed)
admin_system_logs: List[Dict[str, Any]] = [
    {
        "id": "log_101",
        "timestamp": "2026-08-02T04:28:12Z",
        "severity": "INFO",
        "module": "AI Provider",
        "message": "Provider failover triggered: Groq -> Gemini (Latency threshold 500ms met)"
    },
    {
        "id": "log_102",
        "timestamp": "2026-08-02T04:15:00Z",
        "severity": "INFO",
        "module": "Auth",
        "message": "User ID #1428 upgraded to Pro Plan (Paystack transaction #pay_928104)"
    },
    {
        "id": "log_103",
        "timestamp": "2026-08-02T03:50:44Z",
        "severity": "WARNING",
        "module": "Rate Limiting",
        "message": "User IP 102.89.22.14 hit daily limit (50 requests/day). Request throttled."
    },
    {
        "id": "log_104",
        "timestamp": "2026-08-02T02:10:19Z",
        "severity": "AUDIT",
        "module": "Admin Portal",
        "message": "Admin 'Musa Abubakar' updated system prompt for 'ats_resume_scorer' to v2.4"
    },
    {
        "id": "log_105",
        "timestamp": "2026-08-01T23:44:02Z",
        "severity": "ERROR",
        "module": "OpenRouter API",
        "message": "HTTP 502 Bad Gateway from openrouter.ai/api/v1/chat/completions"
    }
]

# Analytics Summary
def get_admin_analytics_summary() -> Dict[str, Any]:
    return {
        "mrr_ngn": 14_850_000,
        "mrr_usd": 9_900,
        "total_users": 18_420,
        "active_subscribers": 1_280,
        "monthly_generations": 142_800,
        "tokens_consumed_this_month": 48_500_000,
        "avg_latency_ms": 385,
        "system_uptime": "99.96%",
        "token_usage_by_provider": [
            {"provider": "Gemini 2.5 Flash", "tokens": 28_500_000, "percentage": 58.7, "cost": "$4,275"},
            {"provider": "Groq Llama-3", "tokens": 12_200_000, "percentage": 25.1, "cost": "$7,198"},
            {"provider": "OpenRouter", "tokens": 5_800_000, "percentage": 11.9, "cost": "$17,400"},
            {"provider": "Vertex AI", "tokens": 2_000_000, "percentage": 4.3, "cost": "$2,500"}
        ],
        "subscription_breakdown": [
            {"plan": "Free Tier", "users": 17_140, "percentage": 93.0},
            {"plan": "Pro Tier (₦5,000/mo)", "users": 980, "percentage": 5.3},
            {"plan": "Graduate Trainee Pass (₦12,000/yr)", "users": 240, "percentage": 1.3},
            {"plan": "Enterprise / Team", "users": 60, "percentage": 0.4}
        ],
        "recent_transactions": [
            {"id": "txn_8801", "user": "Emeka Nnamdi", "plan": "Pro Tier", "amount": "₦5,000", "gateway": "Paystack", "status": "Success", "date": "2026-08-02T04:15"},
            {"id": "txn_8802", "user": "Blessing Adebayo", "plan": "Graduate Trainee Pass", "amount": "₦12,000", "gateway": "Flutterwave", "status": "Success", "date": "2026-08-02T03:30"},
            {"id": "txn_8803", "user": "Tunde Bakare", "plan": "Pro Tier", "amount": "₦5,000", "gateway": "Paystack", "status": "Success", "date": "2026-08-02T01:10"},
            {"id": "txn_8804", "user": "Aisha Mohammed", "plan": "Pro Tier", "amount": "₦5,000", "gateway": "Paystack", "status": "Failed", "date": "2026-08-01T22:45"},
            {"id": "txn_8805", "user": "Oluwaseun Vance", "plan": "Enterprise Team", "amount": "₦150,000", "gateway": "Bank Transfer", "status": "Success", "date": "2026-08-01T18:20"}
        ]
    }
