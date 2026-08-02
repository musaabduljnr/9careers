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
    job_role = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    status = Column(String, default="active", index=True) # active, completed
    feedback_overall = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("DBUser", back_populates="interview_sessions")
    questions = relationship("DBInterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="DBInterviewQuestion.question_order")


class DBInterviewQuestion(Base):
    __tablename__ = "interview_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    ai_score = Column(Integer, nullable=True)
    question_order = Column(Integer, default=0)
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

class DBAppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String, primary_key=True, index=True)
    value_json = Column(JSON, nullable=False)
    category = Column(String, default="general", index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


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
        user_answer=db_q.user_answer,
        ai_feedback=db_q.ai_feedback,
        ai_score=db_q.ai_score,
        question_order=db_q.question_order,
        created_at=db_q.created_at
    )

def to_domain_interview_session(db_sess: DBInterviewSession) -> domain_models.InterviewSession:
    if not db_sess:
        return None
    return domain_models.InterviewSession(
        id=db_sess.id,
        user_id=db_sess.user_id,
        job_role=db_sess.job_role,
        industry=db_sess.industry,
        status=db_sess.status,
        feedback_overall=db_sess.feedback_overall,
        score=db_sess.score,
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


# Database dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
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
                subscription_status="active"
            )
            db.add(demo_user)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()
