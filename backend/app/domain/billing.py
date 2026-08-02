"""
Domain Billing & SaaS Subscription Specifications
==================================================
Defines subscription plans (Free, Starter, Professional, Premium), feature quota limits,
and usage check guards.
"""

from typing import Dict, Any, Optional

SUBSCRIPTION_PLANS: Dict[str, Dict[str, Any]] = {
    "free": {
        "key": "free",
        "name": "Free Tier",
        "description": "Essential features for trying out Naija Career AI",
        "price_ngn": 0,
        "price_usd": 0,
        "formatted_price_ngn": "₦0",
        "formatted_price_usd": "$0",
        "limits": {
            "resume_analyses": 3,
            "cover_letters": 2,
            "job_matches": 5,
            "interview_practice": 1
        },
        "features": [
            "3 ATS Resume Analyses / mo",
            "2 Fact-Checked Cover Letters / mo",
            "5 Semantic Job Matches / mo",
            "1 AI Mock Interview Practice / mo",
            "Standard Templates"
        ]
    },
    "starter": {
        "key": "starter",
        "name": "Starter Plan",
        "description": "Ideal for active job hunters in Nigeria",
        "price_ngn": 2500,
        "price_usd": 5,
        "formatted_price_ngn": "₦2,500 / mo",
        "formatted_price_usd": "$5 / mo",
        "limits": {
            "resume_analyses": 20,
            "cover_letters": 15,
            "job_matches": 50,
            "interview_practice": 10
        },
        "features": [
            "20 ATS Resume Analyses / mo",
            "15 Cover Letters / mo",
            "50 Semantic Job Matches / mo",
            "10 AI Mock Interview Practice / mo",
            "NYSC Graduate Hub Access",
            "Email & Support"
        ]
    },
    "professional": {
        "key": "professional",
        "name": "Professional Plan",
        "description": "Recommended for experienced professionals & career movers",
        "price_ngn": 5000,
        "price_usd": 10,
        "formatted_price_ngn": "₦5,000 / mo",
        "formatted_price_usd": "$10 / mo",
        "limits": {
            "resume_analyses": 100,
            "cover_letters": 75,
            "job_matches": 999999,
            "interview_practice": 50
        },
        "popular": True,
        "features": [
            "100 ATS Resume Analyses / mo",
            "75 Cover Letters / mo",
            "Unlimited Semantic Job Matches",
            "50 AI Mock Interview Sessions / mo",
            "Nigeria Career Insights Module",
            "Visa Pathway Assessment",
            "Priority AI Generation Queue"
        ]
    },
    "premium": {
        "key": "premium",
        "name": "Premium Pass",
        "description": "Unlimited access for high-velocity candidates & executives",
        "price_ngn": 12000,
        "price_usd": 25,
        "formatted_price_ngn": "₦12,000 / mo",
        "formatted_price_usd": "$25 / mo",
        "limits": {
            "resume_analyses": 999999,
            "cover_letters": 999999,
            "job_matches": 999999,
            "interview_practice": 999999
        },
        "features": [
            "Unlimited Resume Analyses",
            "Unlimited Cover Letters",
            "Unlimited Job Matches",
            "Unlimited AI Mock Interviews",
            "1-on-1 VIP Prompt Customization",
            "All 7 Nigeria Industry Insider Files",
            "Global Relocation & Visa Roadmap"
        ]
    }
}


def check_quota(user_plan: str, usage_metric: str, current_used: int) -> bool:
    """Check if the user is within their plan limit for a specific feature."""
    plan_info = SUBSCRIPTION_PLANS.get(user_plan, SUBSCRIPTION_PLANS["free"])
    limit = plan_info["limits"].get(usage_metric, 0)
    return current_used < limit
