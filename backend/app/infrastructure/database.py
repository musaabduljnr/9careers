import os
import json
from datetime import datetime
from typing import Generator
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from backend.app.infrastructure.config import settings
from backend.app.domain import models as domain_models

# Check if SQLite is being used to set specific arguments
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy ORM Models
class DBUser(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    nysc_status = Column(String, default="none")
    target_job_title = Column(String, default="")
    target_industry = Column(String, default="")
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    refresh_token = Column(String, nullable=True)
    provider = Column(String, default="email")
    avatar_url = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    subscription_plan = Column(String, default="free")
    subscription_status = Column(String, default="active")
    subscription_expires_at = Column(DateTime, nullable=True)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("DBResume", back_populates="user", cascade="all, delete-orphan")
    cover_letters = relationship("DBCoverLetter", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("DBInterviewSession", back_populates="user", cascade="all, delete-orphan")
    job_analyses = relationship("DBJobAnalysis", back_populates="user", cascade="all, delete-orphan")


class DBResume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String, nullable=False)
    original_text = Column(Text, nullable=False)
    parsed_json = Column(JSON, nullable=False, default=dict)
    tailored_text = Column(Text, nullable=True)
    ats_score = Column(Integer, default=0)
    ats_feedback = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("DBUser", back_populates="resumes")


class DBCoverLetter(Base):
    __tablename__ = "cover_letters"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("DBUser", back_populates="cover_letters")


class DBInterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(String, primary_key=True, index=True) # UUID string
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interview_type = Column(String, default="Software Engineering", index=True)
    job_role = Column(String, nullable=False)
    company = Column(String, default="")
    industry = Column(String, default="")
    difficulty = Column(String, default="mid")
    duration_minutes = Column(Integer, default=20)
    interview_style = Column(String, default="professional")
    voice_enabled = Column(Boolean, default=True)
    language = Column(String, default="en")
    resume_text = Column(Text, nullable=True)
    job_description = Column(Text, nullable=True)
    status = Column(String, default="active", index=True) # setup, active, paused, completed
    elapsed_seconds = Column(Integer, default=0)
    prep_profile = Column(JSON, nullable=False, default=dict)
    conversation_summary = Column(Text, nullable=True)
    feedback_overall = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    category_scores = Column(JSON, nullable=False, default=dict)
    full_report = Column(JSON, nullable=False, default=dict)
    coach_advice = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("DBUser", back_populates="interview_sessions")
    questions = relationship("DBInterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="DBInterviewQuestion.question_order")


class DBInterviewQuestion(Base):
    __tablename__ = "interview_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    category = Column(String, default="General")
    user_answer = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    ai_score = Column(Integer, nullable=True)
    scores_detail = Column(JSON, nullable=False, default=dict)
    question_order = Column(Integer, default=0)
    audio_url = Column(String, nullable=True)
    timestamp_formatted = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("DBInterviewSession", back_populates="questions")


class DBJobAnalysis(Base):
    __tablename__ = "job_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    skills_required = Column(JSON, nullable=False, default=list)
    salary_benchmark = Column(String, nullable=True)
    nysc_required = Column(Boolean, default=False)
    parsed_json = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("DBUser", back_populates="job_analyses")


# --- ENTERPRISE AI JOB BOARD ORM MODELS ---

class DBCompany(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    industry = Column(String, default="Technology", index=True)
    size = Column(String, default="50-200")
    headquarters = Column(String, default="Lagos, Nigeria")
    description = Column(Text, nullable=True)
    benefits = Column(JSON, nullable=False, default=list)
    open_positions_count = Column(Integer, default=0)
    average_match_score = Column(Integer, default=80)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    jobs = relationship("DBJob", back_populates="company_rel", cascade="all, delete-orphan")


class DBJobSource(Base):
    __tablename__ = "job_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    provider_type = Column(String, nullable=False) # remoteok, linkedin, jobberman, google_jobs, custom
    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, nullable=True)
    config_json = Column(JSON, nullable=False, default=dict)

    jobs = relationship("DBJob", back_populates="source_rel")


class DBJob(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("job_sources.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    external_id = Column(String, index=True, nullable=True)
    source_name = Column(String, default="Direct Posting", index=True)
    company_name = Column(String, nullable=False, index=True)
    company_logo = Column(String, nullable=True)
    title = Column(String, nullable=False, index=True)
    department = Column(String, default="Engineering")
    employment_type = Column(String, default="Full-time", index=True) # Full-time, Part-time, Contract, Internship
    experience_level = Column(String, default="Mid Level", index=True) # Entry Level, Mid Level, Senior, Executive
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_formatted = Column(String, default="")
    currency = Column(String, default="USD")
    location = Column(String, default="Remote", index=True)
    remote_status = Column(String, default="Remote", index=True) # Remote, Hybrid, Onsite
    industry = Column(String, default="Technology", index=True)
    skills = Column(JSON, nullable=False, default=list)
    technologies = Column(JSON, nullable=False, default=list)
    responsibilities = Column(JSON, nullable=False, default=list)
    qualifications = Column(JSON, nullable=False, default=list)
    benefits = Column(JSON, nullable=False, default=list)
    description = Column(Text, nullable=False)
    application_url = Column(String, nullable=False)
    deadline = Column(String, nullable=True)
    date_posted = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String, default="active", index=True) # active, expired, filled
    country = Column(String, default="Global")
    state = Column(String, default="")
    city = Column(String, default="")
    tags = Column(JSON, nullable=False, default=list)
    is_featured = Column(Boolean, default=False, index=True)
    is_urgent = Column(Boolean, default=False, index=True)
    visa_sponsorship = Column(Boolean, default=False)
    nysc_friendly = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    company_rel = relationship("DBCompany", back_populates="jobs")
    source_rel = relationship("DBJobSource", back_populates="jobs")
    recommendations = relationship("DBJobRecommendation", back_populates="job_rel", cascade="all, delete-orphan")
    applications = relationship("DBJobApplication", back_populates="job_rel", cascade="all, delete-orphan")
    bookmarks = relationship("DBJobBookmark", back_populates="job_rel", cascade="all, delete-orphan")


class DBJobRecommendation(Base):
    __tablename__ = "job_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_match_score = Column(Integer, default=85, index=True)
    skill_match_score = Column(Integer, default=90)
    experience_match_score = Column(Integer, default=80)
    education_match_score = Column(Integer, default=85)
    keyword_match_score = Column(Integer, default=85)
    interview_likelihood_percent = Column(Integer, default=85)
    readiness_percent = Column(Integer, default=88)
    missing_skills = Column(JSON, nullable=False, default=list)
    missing_keywords = Column(JSON, nullable=False, default=list)
    match_reasons = Column(JSON, nullable=False, default=list)
    learning_path = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    job_rel = relationship("DBJob", back_populates="recommendations")


class DBJobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, default="applied", index=True) # saved, applied, interview, assessment, offer, rejected, withdrawn
    notes = Column(Text, nullable=True)
    tailored_resume_id = Column(Integer, nullable=True)
    tailored_cover_letter_id = Column(Integer, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job_rel = relationship("DBJob", back_populates="applications")


class DBJobBookmark(Base):
    __tablename__ = "job_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    collection_name = Column(String, default="Favorites", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    job_rel = relationship("DBJob", back_populates="bookmarks")


class DBJobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    role = Column(String, default="")
    location = Column(String, default="")
    remote_only = Column(Boolean, default=False)
    min_salary = Column(Integer, nullable=True)
    frequency = Column(String, default="daily")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# --- DYNAMIC CONFIGURATION MANAGEMENT ORM MODELS ---

class DBAppSetting(Base):
    __tablename__ = "app_settings"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False, default="general") # ai_providers, prompts, feature_flags, payments, email, branding, system
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    encrypted_value = Column(Text, nullable=True)
    data_type = Column(String, default="string") # string, boolean, integer, float, json, list
    description = Column(String, nullable=True)
    is_encrypted = Column(Boolean, default=False)
    is_required = Column(Boolean, default=False)
    is_editable = Column(Boolean, default=True)
    default_value = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    updated_by = Column(String, default="system")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBSettingAuditLog(Base):
    __tablename__ = "setting_audit_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, index=True, nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    changed_by = Column(String, default="admin")
    ip_address = Column(String, default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class DBTransaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="NGN") # NGN or USD
    gateway = Column(String, nullable=False) # paystack or stripe
    plan_key = Column(String, nullable=False) # starter, professional, premium
    status = Column(String, default="pending", index=True) # success, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("DBUser")


# Enterprise Admin Operating System Models

class DBAIEngineConfig(Base):
    __tablename__ = "ai_engine_configs"

    provider_key = Column(String, primary_key=True, index=True) # gemini, groq, openrouter, vertex, openai, anthropic
    is_enabled = Column(Boolean, default=True)
    priority_order = Column(Integer, default=1)
    model_name = Column(String, nullable=False)
    temperature = Column(Float, default=0.7)
    top_p = Column(Float, default=0.9)
    max_tokens = Column(Integer, default=4096)
    embedding_model = Column(String, default="text-embedding-004")
    streaming_enabled = Column(Boolean, default=True)
    retry_count = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=30)
    daily_token_budget = Column(Integer, default=1000000)
    monthly_token_budget = Column(Integer, default=30000000)
    system_prompt_override = Column(Text, nullable=True)
    health_status = Column(String, default="operational") # operational, degraded, error
    latency_ms = Column(Integer, default=120)
    last_error = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBFeatureFlag(Base):
    __tablename__ = "feature_flags"

    feature_key = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="enabled") # enabled, hidden, beta, premium_only, free, maintenance
    category = Column(String, default="core")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBSubscriptionPlan(Base):
    __tablename__ = "subscription_plans_config"

    plan_key = Column(String, primary_key=True, index=True) # free, starter, professional, enterprise
    name = Column(String, nullable=False)
    price_ngn = Column(Integer, default=0)
    price_usd = Column(Integer, default=0)
    limits_json = Column(JSON, nullable=False)
    features_json = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBPromptTemplate(Base):
    __tablename__ = "prompt_templates"

    prompt_key = Column(String, primary_key=True, index=True) # resume_ats, cover_letter, interview_star, job_match
    title = Column(String, nullable=False)
    system_prompt = Column(Text, nullable=False)
    user_prompt_template = Column(Text, nullable=False)
    version = Column(Integer, default=1)
    history_json = Column(JSON, nullable=False, default=list) # [{version, system_prompt, user_prompt_template, updated_at, updated_by}]
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBAuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, nullable=True)
    admin_email = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False, index=True)
    resource_id = Column(String, nullable=True)
    details_json = Column(JSON, nullable=False, default=dict)
    ip_address = Column(String, default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class DBRolePermission(Base):
    __tablename__ = "role_permissions"

    role_key = Column(String, primary_key=True, index=True) # super_admin, admin, moderator, support, finance, marketing
    name = Column(String, nullable=False)
    permissions_json = Column(JSON, nullable=False, default=list) # ["users:read", "users:write", "ai:manage", ...]
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBOrganization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    billing_plan = Column(String, default="free")
    status = Column(String, default="active") # active, suspended, deactivated
    created_at = Column(DateTime, default=datetime.utcnow)


class DBOrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, default="member") # owner, admin, member
    created_at = Column(DateTime, default=datetime.utcnow)



class DBCMSContent(Base):
    __tablename__ = "cms_content"

    slug = Column(String, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True) # faq, terms, privacy, announcement, blog
    title = Column(String, nullable=False)
    content_json = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBPaymentSetting(Base):
    __tablename__ = "payment_settings"

    gateway_key = Column(String, primary_key=True, index=True) # paystack, stripe, flutterwave
    name = Column(String, nullable=False)
    is_enabled = Column(Boolean, default=True)
    public_key = Column(String, nullable=True)
    secret_key = Column(String, nullable=True)
    webhook_secret = Column(String, nullable=True)
    currencies = Column(JSON, nullable=False, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DBEmailSetting(Base):
    __tablename__ = "email_settings"

    provider_key = Column(String, primary_key=True, index=True) # smtp, resend, sendgrid, mailgun
    is_enabled = Column(Boolean, default=True)
    smtp_host = Column(String, nullable=True)
    smtp_port = Column(Integer, default=587)
    smtp_user = Column(String, nullable=True)
    smtp_pass = Column(String, nullable=True)
    sender_email = Column(String, default="noreply@naijacareer.ai")
    templates_json = Column(JSON, nullable=False, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Mapping Helpers (DB ORM Model <--> Domain Model)
def to_domain_user(db_user: DBUser) -> domain_models.User:
    if not db_user:
        return None
    return domain_models.User(
        id=db_user.id,
        email=db_user.email,
        hashed_password=db_user.hashed_password,
        full_name=db_user.full_name,
        nysc_status=db_user.nysc_status or "none",
        target_job_title=db_user.target_job_title or "",
        target_industry=db_user.target_industry or "",
        is_verified=getattr(db_user, 'is_verified', False),
        verification_token=getattr(db_user, 'verification_token', None),
        reset_token=getattr(db_user, 'reset_token', None),
        reset_token_expires_at=getattr(db_user, 'reset_token_expires_at', None),
        refresh_token=getattr(db_user, 'refresh_token', None),
        provider=getattr(db_user, 'provider', 'email'),
        avatar_url=getattr(db_user, 'avatar_url', None),
        phone_number=getattr(db_user, 'phone_number', None),
        subscription_plan=getattr(db_user, 'subscription_plan', 'free'),
        subscription_status=getattr(db_user, 'subscription_status', 'active'),
        subscription_expires_at=getattr(db_user, 'subscription_expires_at', None),
        role=getattr(db_user, 'role', 'admin' if getattr(db_user, 'email', '') == 'admin@naijacareer.ai' else 'user'),
        created_at=db_user.created_at
    )

def to_domain_resume(db_resume: DBResume) -> domain_models.Resume:
    if not db_resume:
        return None
    return domain_models.Resume(
        id=db_resume.id,
        user_id=db_resume.user_id,
        file_name=db_resume.file_name,
        original_text=db_resume.original_text,
        parsed_json=db_resume.parsed_json if isinstance(db_resume.parsed_json, dict) else json.loads(db_resume.parsed_json or "{}"),
        tailored_text=db_resume.tailored_text,
        ats_score=db_resume.ats_score,
        ats_feedback=db_resume.ats_feedback if isinstance(db_resume.ats_feedback, dict) else json.loads(db_resume.ats_feedback or "{}"),
        created_at=db_resume.created_at
    )

def to_domain_cover_letter(db_cl: DBCoverLetter) -> domain_models.CoverLetter:
    if not db_cl:
        return None
    return domain_models.CoverLetter(
        id=db_cl.id,
        user_id=db_cl.user_id,
        company_name=db_cl.company_name,
        job_title=db_cl.job_title,
        content=db_cl.content,
        created_at=db_cl.created_at
    )

def to_domain_interview_question(db_q: DBInterviewQuestion) -> domain_models.InterviewQuestion:
    if not db_q:
        return None
    return domain_models.InterviewQuestion(
        id=db_q.id,
        question_text=db_q.question_text,
        category=getattr(db_q, 'category', 'General') or 'General',
        user_answer=db_q.user_answer,
        ai_feedback=db_q.ai_feedback,
        ai_score=db_q.ai_score,
        scores_detail=getattr(db_q, 'scores_detail', {}) or {},
        question_order=db_q.question_order,
        audio_url=getattr(db_q, 'audio_url', None),
        timestamp_formatted=getattr(db_q, 'timestamp_formatted', '') or '',
        created_at=db_q.created_at
    )

def to_domain_interview_session(db_sess: DBInterviewSession) -> domain_models.InterviewSession:
    if not db_sess:
        return None
    return domain_models.InterviewSession(
        id=db_sess.id,
        user_id=db_sess.user_id,
        interview_type=getattr(db_sess, 'interview_type', 'Software Engineering') or 'Software Engineering',
        job_role=db_sess.job_role,
        company=getattr(db_sess, 'company', '') or '',
        industry=db_sess.industry or '',
        difficulty=getattr(db_sess, 'difficulty', 'mid') or 'mid',
        duration_minutes=getattr(db_sess, 'duration_minutes', 20) or 20,
        interview_style=getattr(db_sess, 'interview_style', 'professional') or 'professional',
        voice_enabled=getattr(db_sess, 'voice_enabled', True),
        language=getattr(db_sess, 'language', 'en') or 'en',
        resume_text=getattr(db_sess, 'resume_text', '') or '',
        job_description=getattr(db_sess, 'job_description', '') or '',
        status=db_sess.status,
        elapsed_seconds=getattr(db_sess, 'elapsed_seconds', 0) or 0,
        prep_profile=getattr(db_sess, 'prep_profile', {}) or {},
        conversation_summary=getattr(db_sess, 'conversation_summary', '') or '',
        feedback_overall=db_sess.feedback_overall,
        score=db_sess.score,
        category_scores=getattr(db_sess, 'category_scores', {}) or {},
        full_report=getattr(db_sess, 'full_report', {}) or {},
        coach_advice=getattr(db_sess, 'coach_advice', {}) or {},
        questions=[to_domain_interview_question(q) for q in db_sess.questions],
        created_at=db_sess.created_at
    )

def to_domain_job_analysis(db_ja: DBJobAnalysis) -> domain_models.JobAnalysis:
    if not db_ja:
        return None
    return domain_models.JobAnalysis(
        id=db_ja.id,
        user_id=db_ja.user_id,
        job_title=db_ja.job_title,
        company=db_ja.company,
        job_description=db_ja.job_description,
        skills_required=db_ja.skills_required if isinstance(db_ja.skills_required, list) else json.loads(db_ja.skills_required or "[]"),
        salary_benchmark=db_ja.salary_benchmark,
        nysc_required=db_ja.nysc_required,
        parsed_json=db_ja.parsed_json if isinstance(db_ja.parsed_json, dict) else json.loads(db_ja.parsed_json or "{}"),
        created_at=db_ja.created_at
    )

def to_domain_company(db_c: DBCompany) -> domain_models.Company:
    if not db_c:
        return None
    return domain_models.Company(
        id=db_c.id,
        name=db_c.name,
        logo_url=db_c.logo_url,
        website=db_c.website,
        industry=db_c.industry,
        size=db_c.size,
        headquarters=db_c.headquarters,
        description=db_c.description or "",
        benefits=db_c.benefits if isinstance(db_c.benefits, list) else [],
        open_positions_count=db_c.open_positions_count or 0,
        average_match_score=db_c.average_match_score or 80,
        created_at=db_c.created_at
    )

def to_domain_job(db_j: DBJob) -> domain_models.Job:
    if not db_j:
        return None
    return domain_models.Job(
        id=db_j.id,
        source_id=db_j.source_id,
        company_id=db_j.company_id,
        external_id=db_j.external_id or "",
        source_name=db_j.source_name or "Direct Posting",
        company_name=db_j.company_name,
        company_logo=db_j.company_logo,
        title=db_j.title,
        department=db_j.department or "Engineering",
        employment_type=db_j.employment_type or "Full-time",
        experience_level=db_j.experience_level or "Mid Level",
        salary_min=db_j.salary_min,
        salary_max=db_j.salary_max,
        salary_formatted=db_j.salary_formatted or "",
        currency=db_j.currency or "USD",
        location=db_j.location or "Remote",
        remote_status=db_j.remote_status or "Remote",
        industry=db_j.industry or "Technology",
        skills=db_j.skills if isinstance(db_j.skills, list) else [],
        technologies=db_j.technologies if isinstance(db_j.technologies, list) else [],
        responsibilities=db_j.responsibilities if isinstance(db_j.responsibilities, list) else [],
        qualifications=db_j.qualifications if isinstance(db_j.qualifications, list) else [],
        benefits=db_j.benefits if isinstance(db_j.benefits, list) else [],
        description=db_j.description or "",
        application_url=db_j.application_url or "",
        deadline=db_j.deadline,
        date_posted=db_j.date_posted or db_j.created_at,
        status=db_j.status or "active",
        country=db_j.country or "Global",
        state=db_j.state or "",
        city=db_j.city or "",
        tags=db_j.tags if isinstance(db_j.tags, list) else [],
        is_featured=db_j.is_featured or False,
        is_urgent=db_j.is_urgent or False,
        visa_sponsorship=db_j.visa_sponsorship or False,
        nysc_friendly=db_j.nysc_friendly or False,
        created_at=db_j.created_at
    )

def to_domain_job_recommendation(db_r: DBJobRecommendation) -> domain_models.JobRecommendation:
    if not db_r:
        return None
    return domain_models.JobRecommendation(
        id=db_r.id,
        user_id=db_r.user_id,
        job_id=db_r.job_id,
        overall_match_score=db_r.overall_match_score or 85,
        skill_match_score=db_r.skill_match_score or 90,
        experience_match_score=db_r.experience_match_score or 80,
        education_match_score=db_r.education_match_score or 85,
        keyword_match_score=db_r.keyword_match_score or 85,
        interview_likelihood_percent=db_r.interview_likelihood_percent or 85,
        readiness_percent=db_r.readiness_percent or 88,
        missing_skills=db_r.missing_skills if isinstance(db_r.missing_skills, list) else [],
        missing_keywords=db_r.missing_keywords if isinstance(db_r.missing_keywords, list) else [],
        match_reasons=db_r.match_reasons if isinstance(db_r.match_reasons, list) else [],
        learning_path=db_r.learning_path if isinstance(db_r.learning_path, list) else [],
        created_at=db_r.created_at
    )

def to_domain_job_application(db_a: DBJobApplication) -> domain_models.JobApplication:
    if not db_a:
        return None
    return domain_models.JobApplication(
        id=db_a.id,
        user_id=db_a.user_id,
        job_id=db_a.job_id,
        status=db_a.status or "applied",
        notes=db_a.notes,
        tailored_resume_id=db_a.tailored_resume_id,
        tailored_cover_letter_id=db_a.tailored_cover_letter_id,
        applied_at=db_a.applied_at or db_a.updated_at,
        updated_at=db_a.updated_at
    )

def to_domain_app_setting(db_s: DBAppSetting) -> domain_models.AppSetting:
    if not db_s:
        return None
    return domain_models.AppSetting(
        id=db_s.id,
        category=db_s.category,
        key=db_s.key,
        value=db_s.value,
        encrypted_value=db_s.encrypted_value,
        data_type=db_s.data_type,
        description=db_s.description or "",
        is_encrypted=db_s.is_encrypted,
        is_required=db_s.is_required,
        is_editable=db_s.is_editable,
        default_value=db_s.default_value or "",
        version=db_s.version,
        updated_by=db_s.updated_by,
        created_at=db_s.created_at,
        updated_at=db_s.updated_at
    )

def to_domain_audit_log(db_l: DBSettingAuditLog) -> domain_models.SettingAuditLog:
    if not db_l:
        return None
    return domain_models.SettingAuditLog(
        id=db_l.id,
        setting_key=db_l.setting_key,
        old_value=db_l.old_value,
        new_value=db_l.new_value,
        changed_by=db_l.changed_by,
        ip_address=db_l.ip_address,
        created_at=db_l.created_at
    )


# Database dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Schema check for legacy app_settings table
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if inspector.has_table("app_settings"):
            cols = [c["name"] for c in inspector.get_columns("app_settings")]
            if "id" not in cols:
                DBAppSetting.__table__.drop(bind=engine, checkfirst=True)

        if inspector.has_table("users"):
            user_cols = [c["name"] for c in inspector.get_columns("users")]
            if "role" not in user_cols:
                with engine.connect() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
                    conn.commit()
    except Exception as e:
        print(f"Migration check info: {e}")

    Base.metadata.create_all(bind=engine)

    # Seed default demo candidate user if no users exist
    from backend.app.infrastructure.security import hash_password
    db = SessionLocal()
    try:
        existing = db.query(DBUser).filter(DBUser.email == "candidate@example.com").first()
        if not existing:
            demo_user = DBUser(
                email="candidate@example.com",
                hashed_password=hash_password("password123"),
                full_name="Musa Abubakar",
                nysc_status="completed",
                target_job_title="Software Engineer",
                target_industry="Fintech",
                is_verified=True,
                provider="email",
                subscription_plan="professional",
                subscription_status="active",
                role="user"
            )
            db.add(demo_user)
            db.commit()

        existing_admin = db.query(DBUser).filter(DBUser.email == "admin@naijacareer.ai").first()
        if not existing_admin:
            admin_user = DBUser(
                email="admin@naijacareer.ai",
                hashed_password=hash_password("AdminSecret123!"),
                full_name="System Admin",
                nysc_status="completed",
                is_verified=True,
                provider="email",
                subscription_plan="enterprise",
                subscription_status="active",
                role="admin"
            )
            db.add(admin_user)
            db.commit()
        elif getattr(existing_admin, 'role', 'user') != "admin":
            existing_admin.role = "admin"
            db.commit()

        # Seed default Dynamic Configuration Settings
        seed_default_settings(db)
    except Exception as e:
        db.rollback()
        print(f"Error initializing DB: {e}")
    finally:
        db.close()


def seed_default_settings(db: Session):
    """Seed initial default settings into app_settings table if empty."""
    from backend.app.infrastructure.encryption import encryption_service

    if db.query(DBAppSetting).count() > 0:
        return

    defaults = [
        # 1. AI Providers Category
        {
            "category": "ai_providers",
            "key": "ai.provider_priority",
            "value": '["gemini", "groq", "openrouter", "openai", "anthropic", "vertex"]',
            "data_type": "json",
            "description": "Provider fallback priority order",
            "is_encrypted": False,
            "default_value": '["gemini", "groq", "openrouter"]'
        },
        {
            "category": "ai_providers",
            "key": "ai.gemini.enabled",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable Google Gemini 2.5 Flash provider",
            "is_encrypted": False,
            "default_value": "true"
        },
        {
            "category": "ai_providers",
            "key": "ai.gemini.api_key",
            "value": "",
            "encrypted_value": encryption_service.encrypt(os.getenv("GEMINI_API_KEY", "")),
            "data_type": "string",
            "description": "Google Gemini API Key",
            "is_encrypted": True,
            "is_required": True
        },
        {
            "category": "ai_providers",
            "key": "ai.gemini.model",
            "value": "gemini-2.5-flash",
            "data_type": "string",
            "description": "Gemini model name",
            "is_encrypted": False,
            "default_value": "gemini-2.5-flash"
        },
        {
            "category": "ai_providers",
            "key": "ai.groq.enabled",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable Groq provider",
            "is_encrypted": False
        },
        {
            "category": "ai_providers",
            "key": "ai.groq.api_key",
            "value": "",
            "encrypted_value": encryption_service.encrypt(os.getenv("GROQ_API_KEY", "")),
            "data_type": "string",
            "description": "Groq API Key",
            "is_encrypted": True
        },
        {
            "category": "ai_providers",
            "key": "ai.openrouter.enabled",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable OpenRouter provider",
            "is_encrypted": False
        },
        {
            "category": "ai_providers",
            "key": "ai.openrouter.api_key",
            "value": "",
            "encrypted_value": encryption_service.encrypt(os.getenv("OPENROUTER_API_KEY", "")),
            "data_type": "string",
            "description": "OpenRouter API Key",
            "is_encrypted": True
        },

        # 2. Prompts Category
        {
            "category": "prompts",
            "key": "prompts.resume_analyzer",
            "value": "You are a World-Class ATS Resume Optimizer and Senior Tech Recruiter. Analyze the candidate resume.",
            "data_type": "string",
            "description": "System prompt for ATS Resume Analyzer",
            "is_encrypted": False
        },
        {
            "category": "prompts",
            "key": "prompts.interview_recruiter",
            "value": "You are an Executive Recruiter conducting a live career interview. Ask one sharp question at a time.",
            "data_type": "string",
            "description": "System prompt for Recruiter Persona in Mock Interviews",
            "is_encrypted": False
        },

        # 3. Feature Flags Category
        {
            "category": "feature_flags",
            "key": "features.interview_simulator",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable Live AI Mock Interview Simulator",
            "is_encrypted": False
        },
        {
            "category": "feature_flags",
            "key": "features.voice_interviews",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable Web Speech STT/TTS Live Voice Mode",
            "is_encrypted": False
        },
        {
            "category": "feature_flags",
            "key": "features.job_board",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable Intelligent AI Job Board & 1-Click Prep",
            "is_encrypted": False
        },
        {
            "category": "feature_flags",
            "key": "features.nysc_hub",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable NYSC Graduate Hub module",
            "is_encrypted": False
        },
        {
            "category": "feature_flags",
            "key": "features.maintenance_mode",
            "value": "false",
            "data_type": "boolean",
            "description": "Put application in Maintenance Mode",
            "is_encrypted": False
        },

        # 4. Payments Category
        {
            "category": "payments",
            "key": "payments.paystack.enabled",
            "value": "true",
            "data_type": "boolean",
            "description": "Enable Paystack payment gateway",
            "is_encrypted": False
        },
        {
            "category": "payments",
            "key": "payments.paystack.public_key",
            "value": "pk_test_paystack_public_key_demo",
            "data_type": "string",
            "description": "Paystack Public Key",
            "is_encrypted": False
        },
        {
            "category": "payments",
            "key": "payments.paystack.secret_key",
            "value": "",
            "encrypted_value": encryption_service.encrypt("sk_test_paystack_secret_key_demo"),
            "data_type": "string",
            "description": "Paystack Secret Key",
            "is_encrypted": True
        },

        # 5. Email (SMTP) Category
        {
            "category": "email",
            "key": "email.smtp_host",
            "value": "smtp.gmail.com",
            "data_type": "string",
            "description": "SMTP Outgoing Host",
            "is_encrypted": False
        },
        {
            "category": "email",
            "key": "email.smtp_port",
            "value": "587",
            "data_type": "integer",
            "description": "SMTP Port",
            "is_encrypted": False
        },

        # 6. General Branding Category
        {
            "category": "branding",
            "key": "general.app_name",
            "value": "Naija Career AI",
            "data_type": "string",
            "description": "Enterprise Platform Display Name",
            "is_encrypted": False
        },
        {
            "category": "branding",
            "key": "general.support_email",
            "value": "support@9careers.ng",
            "data_type": "string",
            "description": "Customer Support Email Address",
            "is_encrypted": False
        }
    ]

    for item in defaults:
        db_s = DBAppSetting(
            category=item["category"],
            key=item["key"],
            value=item["value"],
            encrypted_value=item.get("encrypted_value"),
            data_type=item["data_type"],
            description=item.get("description", ""),
            is_encrypted=item.get("is_encrypted", False),
            is_required=item.get("is_required", False),
            default_value=item.get("default_value", item["value"])
        )
        db.add(db_s)
    db.commit()
