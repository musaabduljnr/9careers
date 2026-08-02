from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class User:
    id: Optional[int] = None
    email: str = ""
    hashed_password: str = ""
    full_name: str = ""
    nysc_status: str = "none" # completed, exempted, serving, none
    target_job_title: str = ""
    target_industry: str = ""
    is_verified: bool = False
    verification_token: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires_at: Optional[datetime] = None
    refresh_token: Optional[str] = None
    provider: str = "email" # email, google, github
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    subscription_plan: str = "free" # free, pro, graduate_pass, enterprise
    subscription_status: str = "active" # active, trialing, cancelled, past_due
    subscription_expires_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class Resume:
    id: Optional[int] = None
    user_id: int = 0
    file_name: str = ""
    original_text: str = ""
    parsed_json: Dict[str, Any] = field(default_factory=dict)
    tailored_text: Optional[str] = None
    ats_score: int = 0
    ats_feedback: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class CoverLetter:
    id: Optional[int] = None
    user_id: int = 0
    company_name: str = ""
    job_title: str = ""
    content: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class InterviewQuestion:
    id: Optional[int] = None
    question_text: str = ""
    user_answer: Optional[str] = None
    ai_feedback: Optional[str] = None
    ai_score: Optional[int] = None
    question_order: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class InterviewSession:
    id: Optional[str] = None # Will use UUID strings
    user_id: int = 0
    job_role: str = ""
    industry: str = ""
    status: str = "active" # active, completed
    feedback_overall: Optional[str] = None
    score: Optional[int] = None
    questions: List[InterviewQuestion] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class JobAnalysis:
    id: Optional[int] = None
    user_id: int = 0
    job_title: str = ""
    company: str = ""
    job_description: str = ""
    skills_required: List[str] = field(default_factory=list)
    salary_benchmark: Optional[str] = None
    nysc_required: bool = False
    parsed_json: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
