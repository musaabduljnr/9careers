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
    role: str = "user" # user, admin
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
    category: str = "General" # Introduction, Resume, Technical, Behavioral, STAR, Problem Solving, Culture Fit, Closing
    user_answer: Optional[str] = None
    ai_feedback: Optional[str] = None
    ai_score: Optional[int] = None
    scores_detail: Dict[str, Any] = field(default_factory=dict) # communication, technical, problem_solving, leadership, confidence, star_method, clarity, depth, relevance, professionalism
    question_order: int = 0
    audio_url: Optional[str] = None
    timestamp_formatted: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class InterviewPrepProfile:
    candidate_summary: str = ""
    target_role: str = ""
    company: str = ""
    difficulty: str = "mid"
    key_strengths: List[str] = field(default_factory=list)
    perceived_weaknesses: List[str] = field(default_factory=list)
    missing_skills: List[str] = field(default_factory=list)
    likely_questions: List[str] = field(default_factory=list)
    interview_strategy: str = ""
    focus_areas: List[str] = field(default_factory=list)

@dataclass
class InterviewSession:
    id: Optional[str] = None # Will use UUID strings
    user_id: int = 0
    interview_type: str = "Software Engineering"
    job_role: str = ""
    company: str = ""
    industry: str = ""
    difficulty: str = "mid" # junior, mid, senior, principal
    duration_minutes: int = 20 # 10, 20, 30, 45
    interview_style: str = "professional" # friendly, professional, strict, startup, corporate
    voice_enabled: bool = True
    language: str = "en"
    resume_text: str = ""
    job_description: str = ""
    status: str = "active" # setup, active, paused, completed
    elapsed_seconds: int = 0
    prep_profile: Dict[str, Any] = field(default_factory=dict)
    conversation_summary: str = ""
    feedback_overall: Optional[str] = None
    score: Optional[int] = None
    category_scores: Dict[str, int] = field(default_factory=dict)
    full_report: Dict[str, Any] = field(default_factory=dict)
    coach_advice: Dict[str, Any] = field(default_factory=dict)
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

@dataclass
class Company:
    id: Optional[int] = None
    name: str = ""
    logo_url: Optional[str] = None
    website: Optional[str] = None
    industry: str = ""
    size: str = "" # e.g. 50-200, 1000+
    headquarters: str = ""
    description: str = ""
    benefits: List[str] = field(default_factory=list)
    open_positions_count: int = 0
    average_match_score: int = 80
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class JobSource:
    id: Optional[int] = None
    name: str = "" # e.g. RemoteOK, LinkedIn, Jobberman
    slug: str = ""
    provider_type: str = "" # remoteok, linkedin, jobberman, google_jobs, custom
    is_active: bool = True
    last_synced_at: Optional[datetime] = None
    config_json: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Job:
    id: Optional[int] = None
    source_id: Optional[int] = None
    company_id: Optional[int] = None
    external_id: str = ""
    source_name: str = "Direct Posting"
    company_name: str = ""
    company_logo: Optional[str] = None
    title: str = ""
    department: str = ""
    employment_type: str = "Full-time" # Full-time, Part-time, Contract, Internship
    experience_level: str = "Mid Level" # Entry Level, Mid Level, Senior, Executive
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_formatted: str = ""
    currency: str = "USD" # USD, NGN, GBP, EUR
    location: str = ""
    remote_status: str = "Remote" # Remote, Hybrid, Onsite
    industry: str = ""
    skills: List[str] = field(default_factory=list)
    technologies: List[str] = field(default_factory=list)
    responsibilities: List[str] = field(default_factory=list)
    qualifications: List[str] = field(default_factory=list)
    benefits: List[str] = field(default_factory=list)
    description: str = ""
    application_url: str = ""
    deadline: Optional[str] = None
    date_posted: datetime = field(default_factory=datetime.utcnow)
    status: str = "active" # active, expired, filled
    country: str = ""
    state: str = ""
    city: str = ""
    tags: List[str] = field(default_factory=list)
    is_featured: bool = False
    is_urgent: bool = False
    visa_sponsorship: bool = False
    nysc_friendly: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class JobRecommendation:
    id: Optional[int] = None
    user_id: int = 0
    job_id: int = 0
    overall_match_score: int = 85
    skill_match_score: int = 90
    experience_match_score: int = 80
    education_match_score: int = 85
    keyword_match_score: int = 85
    interview_likelihood_percent: int = 85
    readiness_percent: int = 88
    missing_skills: List[str] = field(default_factory=list)
    missing_keywords: List[str] = field(default_factory=list)
    match_reasons: List[str] = field(default_factory=list)
    learning_path: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class JobApplication:
    id: Optional[int] = None
    user_id: int = 0
    job_id: int = 0
    status: str = "applied" # saved, applied, interview, assessment, offer, rejected, withdrawn
    notes: Optional[str] = None
    tailored_resume_id: Optional[int] = None
    tailored_cover_letter_id: Optional[int] = None
    applied_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class JobBookmark:
    id: Optional[int] = None
    user_id: int = 0
    job_id: int = 0
    collection_name: str = "Favorites" # Favorites, Dream Companies, Remote Opportunities, Urgent Applications
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class JobAlert:
    id: Optional[int] = None
    user_id: int = 0
    title: str = ""
    role: str = ""
    location: str = ""
    remote_only: bool = False
    min_salary: Optional[int] = None
    frequency: str = "daily" # daily, weekly, instant
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class AppSetting:
    id: Optional[int] = None
    category: str = "general" # ai_providers, prompts, feature_flags, payments, email, branding, system
    key: str = ""
    value: Any = ""
    encrypted_value: Optional[str] = None
    data_type: str = "string" # string, boolean, integer, float, json, list
    description: str = ""
    is_encrypted: bool = False
    is_required: bool = False
    is_editable: bool = True
    default_value: Any = ""
    version: int = 1
    updated_by: Optional[str] = "system"
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class SettingAuditLog:
    id: Optional[int] = None
    setting_key: str = ""
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_by: str = "admin"
    ip_address: Optional[str] = "127.0.0.1"
    created_at: datetime = field(default_factory=datetime.utcnow)
