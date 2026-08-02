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

# Interview Schemas
class InterviewStartRequest(BaseModel):
    job_role: str
    industry: str

class InterviewStartResponse(BaseModel):
    session_id: str
    job_role: str
    industry: str
    first_question: str
    question_order: int

class InterviewResponseRequest(BaseModel):
    user_answer: str

class InterviewResponseResponse(BaseModel):
    session_status: str
    feedback: str
    score: int
    next_question: Optional[str] = None
    question_order: Optional[int] = None
    overall_feedback: Optional[str] = None
    overall_score: Optional[int] = None

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
