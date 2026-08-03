from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, EmailStr, Field

# Auth & Profile Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")
    full_name: str
    nysc_status: str = Field("none", description="One of: completed, exempted, serving, none")
    target_job_title: str = ""
    target_industry: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OAuthLoginRequest(BaseModel):
    provider: str = Field(..., description="google or github")
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    provider_id: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class VerifyEmailRequest(BaseModel):
    token: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    target_job_title: Optional[str] = None
    target_industry: Optional[str] = None
    nysc_status: Optional[str] = None
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None

class CheckoutSessionRequest(BaseModel):
    gateway: str = Field(..., description="paystack or stripe")
    plan_key: str = Field(..., description="starter, professional, or premium")
    callback_url: Optional[str] = Field(None, description="Frontend redirect URL post payment")

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenResponse(Token):
    pass

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    nysc_status: str
    target_job_title: str
    target_industry: str
    is_verified: bool = False
    provider: str = "email"
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    subscription_plan: str = "free"
    subscription_status: str = "active"
    subscription_expires_at: Optional[datetime] = None
    role: str = "user"
    created_at: datetime

    class Config:
        from_attributes = True

# Resume Schemas
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    original_text: str
    parsed_json: Dict[str, Any]
    tailored_text: Optional[str] = None
    ats_score: int
    ats_feedback: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class TailorResumeRequest(BaseModel):
    job_description: str
    tone: str = Field("Nigerian Corporate", description="Nigerian Corporate, Tech Startup, or International Remote")

# Cover Letter Schemas
class CoverLetterRequest(BaseModel):
    resume_id: int
    company_name: str
    job_title: str
    job_description: Optional[str] = None
    tone: str = Field("Professional", description="Professional, Confident, or Friendly")
    hiring_manager: Optional[str] = None

class CoverLetterResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    job_title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

# Enterprise Interview Simulator Schemas
class InterviewSetupRequest(BaseModel):
    interview_type: str = Field("Software Engineering", description="Interview mode: General HR, Behavioral, Technical, Software Engineering, Frontend, Backend, Python, React, AI Engineer, Data Analyst, Product Manager, UI/UX Designer, Customer Support, Sales, Graduate, NYSC, Internship, Remote Jobs, Custom")
    job_role: str = Field(..., description="Target Job Role")
    company: str = Field("", description="Target Company Name")
    difficulty: str = Field("mid", description="junior, mid, senior, or principal")
    duration_minutes: int = Field(20, description="10, 20, 30, or 45 minutes")
    interview_style: str = Field("professional", description="friendly, professional, strict, startup, corporate")
    voice_enabled: bool = Field(True, description="Enable live voice mode")
    language: str = Field("en", description="Primary spoken language")
    resume_text: Optional[str] = Field("", description="Raw resume text or parsed JSON text")
    job_description: Optional[str] = Field("", description="Job posting description")

class InterviewPrepProfileResponse(BaseModel):
    candidate_summary: str
    target_role: str
    company: str
    difficulty: str
    key_strengths: List[str]
    perceived_weaknesses: List[str]
    missing_skills: List[str]
    likely_questions: List[str]
    interview_strategy: str
    focus_areas: List[str]

class InterviewStartRequest(BaseModel):
    interview_type: str = "Software Engineering"
    job_role: str
    company: str = ""
    industry: str = ""
    difficulty: str = "mid"
    duration_minutes: int = 20
    interview_style: str = "professional"
    voice_enabled: bool = True
    language: str = "en"
    resume_text: Optional[str] = ""
    job_description: Optional[str] = ""

class InterviewStartResponse(BaseModel):
    session_id: str
    job_role: str
    company: str
    interview_type: str
    difficulty: str
    duration_minutes: int
    first_question: str
    question_category: str
    question_order: int
    prep_profile: Dict[str, Any]

class InterviewResponseRequest(BaseModel):
    user_answer: str
    elapsed_seconds: Optional[int] = 0

class InterviewResponseResponse(BaseModel):
    session_id: str
    session_status: str # active, paused, completed
    turn_score: int
    scores_detail: Dict[str, Any]
    feedback: str
    next_question: Optional[str] = None
    next_category: Optional[str] = None
    question_order: Optional[int] = None
    overall_feedback: Optional[str] = None
    overall_score: Optional[int] = None
    elapsed_seconds: int = 0
    remaining_seconds: int = 0

class SessionActionRequest(BaseModel):
    action: str = Field(..., description="pause, resume, restart, end")

class SessionActionResponse(BaseModel):
    session_id: str
    status: str
    message: str

class InterviewReportResponse(BaseModel):
    session_id: str
    job_role: str
    company: str
    interview_type: str
    difficulty: str
    overall_score: int
    hiring_recommendation: str
    likelihood_of_passing_percent: int
    category_scores: Dict[str, int]
    strengths: List[str]
    weaknesses: List[str]
    missed_opportunities: List[str]
    recommended_improvements: List[str]
    suggested_learning_resources: List[str]
    coach_advice: Dict[str, Any]
    transcript: List[Dict[str, Any]]

# Job Analysis Schemas
class JobAnalysisRequest(BaseModel):
    job_title: str
    company: str
    job_description: str

class JobAnalysisUrlRequest(BaseModel):
    url: str

class JobAnalysisResponse(BaseModel):
    id: int
    user_id: int
    job_title: str
    company: str
    job_description: str
    skills_required: List[str]
    salary_benchmark: Optional[str]
    nysc_required: bool
    parsed_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True

class JobMatchRequest(BaseModel):
    resume_id: int
    job_id: int

class ImproveBulletRequest(BaseModel):
    bullet_point: str
    tone: str = "Professional"


# Interview Question Generator Schemas
class GenerateInterviewQuestionsRequest(BaseModel):
    resume_text: str
    job_description: str
    company_name: str
    job_title: str
    question_types: List[str] = Field(
        default=["Technical", "Behavioral", "HR", "Situational", "STAR"],
        description="List of question types to generate"
    )
    num_questions_per_type: int = Field(default=3, ge=1, le=10)


class ScoringRubric(BaseModel):
    score_1_2: str = Field(description="What a poor answer looks like (score 1-2/5)")
    score_3: str = Field(description="What an average answer looks like (score 3/5)")
    score_4_5: str = Field(description="What an excellent answer looks like (score 4-5/5)")
    key_criteria: List[str] = Field(description="Key evaluation criteria for scoring")


class InterviewQuestion(BaseModel):
    id: str
    question_type: str  # Technical, Behavioral, HR, Situational, STAR
    category: str       # e.g., "System Design", "Leadership", "Salary"
    difficulty: str     # Easy, Medium, Hard
    question: str
    why_asked: str
    model_answer: str
    star_breakdown: Optional[Dict[str, str]] = None  # For STAR & Behavioral: Situation/Task/Action/Result
    scoring_rubric: ScoringRubric
    follow_up_questions: List[str]
    keywords_to_include: List[str]


class GenerateInterviewQuestionsResponse(BaseModel):
    job_title: str
    company_name: str
    total_questions: int
    questions: List[InterviewQuestion]
    preparation_tips: List[str]
    company_research_notes: str


# --- ENTERPRISE AI JOB BOARD SCHEMAS ---

class JobMatchBreakdown(BaseModel):
    overall_match_score: int
    skill_match_score: int
    experience_match_score: int
    education_match_score: int
    keyword_match_score: int
    interview_likelihood_percent: int
    readiness_percent: int
    missing_skills: List[str]
    missing_keywords: List[str]
    match_reasons: List[str]
    learning_path: List[str]

class JobResponse(BaseModel):
    id: int
    title: str
    company_name: str
    company_logo: Optional[str] = None
    source_name: str
    location: str
    remote_status: str
    employment_type: str
    experience_level: str
    salary_formatted: str
    skills: List[str]
    tags: List[str]
    date_posted: str
    is_featured: bool = False
    is_urgent: bool = False
    visa_sponsorship: bool = False
    nysc_friendly: bool = False
    match: Optional[JobMatchBreakdown] = None

class CompanySummary(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    industry: str
    open_positions_count: int
    average_match_score: int

class JobFeedResponse(BaseModel):
    top_matches: List[JobResponse]
    recently_posted: List[JobResponse]
    remote_jobs: List[JobResponse]
    urgent_hiring: List[JobResponse]
    trending_companies: List[CompanySummary]
    total_jobs_count: int

class OneClickPrepResponse(BaseModel):
    job_id: int
    job_title: str
    company_name: str
    tailored_resume_text: str
    cover_letter_text: str
    estimated_ats_score: int
    expected_interview_questions: List[str]
    company_research_notes: str
    application_checklist: List[str]

class JobApplicationCreateRequest(BaseModel):
    job_id: int
    status: str = Field("applied", description="saved, applied, interview, assessment, offer, rejected, withdrawn")
    notes: Optional[str] = None

class JobApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    notes: Optional[str] = None
    applied_at: datetime
    updated_at: datetime

class JobBookmarkCreateRequest(BaseModel):
    job_id: int
    collection_name: str = Field("Favorites", description="Favorites, Dream Companies, Remote Opportunities, Urgent Applications")

class JobAlertCreateRequest(BaseModel):
    title: str
    role: Optional[str] = ""
    location: Optional[str] = ""
    remote_only: bool = False
    min_salary: Optional[int] = None
    frequency: str = "daily"

class NaturalLanguageSearchRequest(BaseModel):
    query: str = Field(..., description="e.g. React Developer Lagos, Python Remote, Graduate Trainee Abuja")
    remote_only: bool = False
    experience_level: Optional[str] = None
    nysc_friendly: bool = False
