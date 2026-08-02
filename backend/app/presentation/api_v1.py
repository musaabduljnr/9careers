from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Schemas
from backend.app.presentation import schemas
# Domain Models
from backend.app.domain.models import User, Resume, CoverLetter, InterviewSession, JobAnalysis
# Repositories
from backend.app.infrastructure.repositories import (
    UserRepositoryImpl, ResumeRepositoryImpl, CoverLetterRepositoryImpl,
    InterviewRepositoryImpl, JobAnalysisRepositoryImpl
)
# Services
from backend.app.infrastructure.ai_providers import AIProviderFactory
from backend.app.infrastructure.doc_parser import DocumentParserImpl
from backend.app.infrastructure.database import get_db
# Security
from backend.app.infrastructure.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    verify_token, generate_random_token, get_current_user
)
# Use Cases
from backend.app.application.use_cases import (
    ScoreResumeUseCase, TailorResumeUseCase, GenerateCoverLetterUseCase,
    InterviewSimulatorUseCase, AnalyzeJobDescriptionUseCase, SemanticJobMatchUseCase,
    GenerateInterviewQuestionsUseCase, ImproveBulletPointUseCase, GetPersonalizedRecommendationsUseCase
)

router = APIRouter(prefix="/api/v1")

# --- AUTH & PROFILE ENDPOINTS ---

@router.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"], summary="Register New Candidate Account")
async def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    existing_user = await user_repo.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    hashed = hash_password(user_in.password)
    verification_token = generate_random_token()
    
    user = User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name,
        nysc_status=user_in.nysc_status,
        target_job_title=user_in.target_job_title,
        target_industry=user_in.target_industry,
        is_verified=False,
        verification_token=verification_token,
        provider="email",
        subscription_plan="free",
        subscription_status="active"
    )
    
    created_user = await user_repo.create(user)
    return created_user


@router.post("/auth/token", response_model=schemas.TokenResponse, tags=["Authentication"], summary="Login & Issue OAuth2 JWT Access + Refresh Tokens")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    user = await user_repo.get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    
    user.refresh_token = refresh_token
    await user_repo.update(user)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "nysc_status": user.nysc_status,
            "target_job_title": user.target_job_title,
            "target_industry": user.target_industry,
            "is_verified": user.is_verified,
            "subscription_plan": user.subscription_plan,
            "avatar_url": user.avatar_url
        }
    }


@router.post("/auth/login-json", response_model=schemas.TokenResponse, tags=["Authentication"], summary="JSON Format Login")
async def login_json(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    user = await user_repo.get_by_email(login_in.email)
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    
    user.refresh_token = refresh_token
    await user_repo.update(user)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "nysc_status": user.nysc_status,
            "target_job_title": user.target_job_title,
            "target_industry": user.target_industry,
            "is_verified": user.is_verified,
            "subscription_plan": user.subscription_plan,
            "avatar_url": user.avatar_url
        }
    }


@router.post("/auth/oauth", response_model=schemas.TokenResponse, tags=["Authentication"], summary="Google & GitHub Social OAuth2 Sign-In")
async def oauth_login(req: schemas.OAuthLoginRequest, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    user = await user_repo.get_by_email(req.email)
    
    if not user:
        # Create new candidate account via Social Auth
        user = User(
            email=req.email,
            hashed_password=hash_password(generate_random_token()),
            full_name=req.full_name,
            nysc_status="none",
            provider=req.provider,
            avatar_url=req.avatar_url,
            is_verified=True,
            subscription_plan="free",
            subscription_status="active"
        )
        user = await user_repo.create(user)
    else:
        user.provider = req.provider
        if req.avatar_url:
            user.avatar_url = req.avatar_url
        user.is_verified = True
        await user_repo.update(user)

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    
    user.refresh_token = refresh_token
    await user_repo.update(user)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "nysc_status": user.nysc_status,
            "target_job_title": user.target_job_title,
            "target_industry": user.target_industry,
            "is_verified": user.is_verified,
            "subscription_plan": user.subscription_plan,
            "avatar_url": user.avatar_url,
            "provider": user.provider
        }
    }


@router.post("/auth/refresh", response_model=schemas.TokenResponse, tags=["Authentication"], summary="Exchange Refresh Token for Access Token")
async def refresh_access_token(req: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_token(req.refresh_token, expected_type="refresh")
    email = payload.get("sub")
    
    user_repo = UserRepositoryImpl(db)
    user = await user_repo.get_by_email(email)
    if not user or user.refresh_token != req.refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    new_access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    
    user.refresh_token = new_refresh_token
    await user_repo.update(user)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "nysc_status": user.nysc_status,
            "target_job_title": user.target_job_title,
            "target_industry": user.target_industry,
            "is_verified": user.is_verified,
            "subscription_plan": user.subscription_plan,
            "avatar_url": user.avatar_url
        }
    }


@router.post("/auth/verify-email", tags=["Authentication"], summary="Verify Candidate Email Address")
async def verify_email(req: schemas.VerifyEmailRequest, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    from backend.app.infrastructure.database import DBUser, to_domain_user
    db_user = db.query(DBUser).filter(DBUser.verification_token == req.token).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")
        
    user = to_domain_user(db_user)
    user.is_verified = True
    user.verification_token = None
    await user_repo.update(user)
    
    return {"message": "Email verified successfully"}


@router.post("/auth/forgot-password", tags=["Authentication"], summary="Request Password Reset Token")
async def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    user = await user_repo.get_by_email(req.email)
    if not user:
        return {"message": "If an account exists with this email, a reset token has been issued."}
        
    reset_token = generate_random_token()
    user.reset_token = reset_token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
    await user_repo.update(user)
    
    return {"message": "Password reset token generated successfully", "reset_token": reset_token}


@router.post("/auth/reset-password", tags=["Authentication"], summary="Reset Password with Verification Token")
async def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    from backend.app.infrastructure.database import DBUser, to_domain_user
    db_user = db.query(DBUser).filter(DBUser.reset_token == req.token).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
        
    user = to_domain_user(db_user)
    if user.reset_token_expires_at and user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")
        
    user.hashed_password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    await user_repo.update(user)
    
    return {"message": "Password updated successfully. Please log in with your new password."}


@router.post("/auth/logout", tags=["Authentication"], summary="Logout & Revoke Active Session Tokens")
async def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    current_user.refresh_token = None
    await user_repo.update(current_user)
    return {"message": "Logged out successfully"}


@router.get("/auth/me", response_model=schemas.UserResponse, tags=["Authentication"], summary="Get Current Authenticated Candidate Profile")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/auth/profile", response_model=schemas.UserResponse, tags=["Authentication"], summary="Get Candidate Profile & Subscription Status")
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/auth/profile", response_model=schemas.UserResponse, tags=["Authentication"], summary="Update Candidate Profile & Career Target Preferences")
async def update_profile(
    req: schemas.ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_repo = UserRepositoryImpl(db)
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.target_job_title is not None:
        current_user.target_job_title = req.target_job_title
    if req.target_industry is not None:
        current_user.target_industry = req.target_industry
    if req.nysc_status is not None:
        current_user.nysc_status = req.nysc_status
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    if req.phone_number is not None:
        current_user.phone_number = req.phone_number
        
    updated_user = await user_repo.update(current_user)
    return updated_user


@router.put("/auth/me", response_model=schemas.UserResponse)
async def update_user_profile(profile_update: schemas.UserRegister, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_repo = UserRepositoryImpl(db)
    
    # Check if changing email to an already existing one
    if profile_update.email != current_user.email:
        existing = await user_repo.get_by_email(profile_update.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
    
    current_user.email = profile_update.email
    current_user.full_name = profile_update.full_name
    current_user.nysc_status = profile_update.nysc_status
    current_user.target_job_title = profile_update.target_job_title
    current_user.target_industry = profile_update.target_industry
    
    if profile_update.password:
        current_user.hashed_password = hash_password(profile_update.password)
        
    updated = await user_repo.update(current_user)
    return updated


# --- RESUME ENDPOINTS ---

@router.post("/resumes/upload", response_model=schemas.ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF and DOCX are allowed."
        )

    # Enforce 10MB file size limit
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit. Please upload a smaller file."
        )

    parser = DocumentParserImpl()
    try:
        if ext == "pdf":
            resume_text = parser.parse_pdf(file_bytes)
        else:
            resume_text = parser.parse_docx(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to extract meaningful text. Please ensure the file is not empty or image-only."
        )

    ai_provider = AIProviderFactory.get_provider()
    resume_repo = ResumeRepositoryImpl(db)
    use_case = ScoreResumeUseCase(ai_provider, resume_repo)
    
    try:
        scored_resume = await use_case.execute(current_user, resume_text, file.filename)
        return scored_resume
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error parsing/extracting resume details: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI extraction failed: {str(e)}. Please retry or upload a clearer document."
        )


@router.post("/resumes/{resume_id}/tailor", response_model=schemas.ResumeResponse)
async def tailor_resume(
    resume_id: int,
    req: schemas.TailorResumeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_repo = ResumeRepositoryImpl(db)
    resume = await resume_repo.get_by_id(resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    ai_provider = AIProviderFactory.get_provider()
    use_case = TailorResumeUseCase(ai_provider, resume_repo)
    
    tailored_resume = await use_case.execute(resume_id, req.job_description, req.tone)
    return tailored_resume


@router.get("/resumes/latest", response_model=schemas.ResumeResponse)
async def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_repo = ResumeRepositoryImpl(db)
    resume = await resume_repo.get_latest_by_user(current_user.id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume uploaded yet")
    return resume


@router.get("/resumes", response_model=List[schemas.ResumeResponse])
async def get_all_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_repo = ResumeRepositoryImpl(db)
    resumes = await resume_repo.get_by_user(current_user.id)
    return resumes


# --- COVER LETTER ENDPOINTS ---

@router.post("/cover-letters", response_model=schemas.CoverLetterResponse)
async def generate_cover_letter(
    req: schemas.CoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_provider = AIProviderFactory.get_provider()
    cl_repo = CoverLetterRepositoryImpl(db)
    resume_repo = ResumeRepositoryImpl(db)
    use_case = GenerateCoverLetterUseCase(ai_provider, cl_repo, resume_repo)
    
    cl = await use_case.execute(
        user_id=current_user.id,
        resume_id=req.resume_id,
        company_name=req.company_name,
        job_title=req.job_title,
        job_description=req.job_description,
        tone=req.tone,
        hiring_manager=req.hiring_manager
    )
    return cl


@router.get("/cover-letters", response_model=List[schemas.CoverLetterResponse])
async def get_cover_letters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cl_repo = CoverLetterRepositoryImpl(db)
    cls = await cl_repo.get_by_user(current_user.id)
    return cls


# --- INTERVIEW ENDPOINTS ---

@router.post("/interviews/start", response_model=schemas.InterviewStartResponse)
async def start_interview(
    req: schemas.InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_provider = AIProviderFactory.get_provider()
    interview_repo = InterviewRepositoryImpl(db)
    user_repo = UserRepositoryImpl(db)
    use_case = InterviewSimulatorUseCase(ai_provider, interview_repo, user_repo)
    
    session = await use_case.start_session(
        user_id=current_user.id,
        job_role=req.job_role,
        industry=req.industry
    )
    
    first_q = session.questions[0]
    return {
        "session_id": session.id,
        "job_role": session.job_role,
        "industry": session.industry,
        "first_question": first_q.question_text,
        "question_order": first_q.question_order
    }


@router.post("/interviews/sessions/{session_id}/respond", response_model=schemas.InterviewResponseResponse)
async def respond_to_question(
    session_id: str,
    req: schemas.InterviewResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_provider = AIProviderFactory.get_provider()
    interview_repo = InterviewRepositoryImpl(db)
    user_repo = UserRepositoryImpl(db)
    use_case = InterviewSimulatorUseCase(ai_provider, interview_repo, user_repo)
    
    result = await use_case.respond_to_question(session_id, req.user_answer)
    return result


@router.get("/interviews/sessions", response_model=List[Dict[str, Any]])
async def get_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview_repo = InterviewRepositoryImpl(db)
    sessions = await interview_repo.get_sessions_by_user(current_user.id)
    return [
        {
            "id": s.id,
            "job_role": s.job_role,
            "industry": s.industry,
            "status": s.status,
            "score": s.score,
            "created_at": s.created_at
        } for s in sessions
    ]


@router.get("/interviews/sessions/{session_id}")
async def get_interview_session_details(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview_repo = InterviewRepositoryImpl(db)
    session = await interview_repo.get_session_by_id(session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
    
    return session


# Helper to extract text from URL
async def fetch_job_text_from_url(url: str) -> str:
    import httpx
    import re
    import html as py_html
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            res = await client.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}, timeout=10.0)
            res.raise_for_status()
            html_content = res.text
            # Basic tag stripping and cleaning
            html_clean = re.sub(r"<(script|style|head|nav|footer|header)\b[^>]*>([\s\S]*?)<\/\1>", "", html_content, flags=re.IGNORECASE)
            html_clean = re.sub(r"<\/(div|p|h1|h2|h3|h4|h5|h6|li|tr)>\s*", "\n", html_clean, flags=re.IGNORECASE)
            text = re.sub(r"<[^>]+>", " ", html_clean)
            text = re.sub(r"\s+", " ", text).strip()
            text = py_html.unescape(text)
            return text
        except Exception as e:
            raise ValueError(f"Failed to fetch job page content: {str(e)}")


# --- JOB ANALYSIS ENDPOINTS ---

@router.post("/jobs/analyze", response_model=schemas.JobAnalysisResponse)
async def analyze_job_description(
    req: schemas.JobAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_provider = AIProviderFactory.get_provider()
    job_repo = JobAnalysisRepositoryImpl(db)
    use_case = AnalyzeJobDescriptionUseCase(ai_provider, job_repo)
    
    analysis = await use_case.execute(
        user_id=current_user.id,
        job_title=req.job_title,
        company=req.company,
        job_description=req.job_description
    )
    return analysis


@router.post("/jobs/analyze-url", response_model=schemas.JobAnalysisResponse)
async def analyze_job_url(
    req: schemas.JobAnalysisUrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        job_text = await fetch_job_text_from_url(req.url)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not job_text or len(job_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to extract meaningful job text from the URL. Please copy and paste instead."
        )

    ai_provider = AIProviderFactory.get_provider()
    job_repo = JobAnalysisRepositoryImpl(db)
    use_case = AnalyzeJobDescriptionUseCase(ai_provider, job_repo)
    
    analysis = await use_case.execute(
        user_id=current_user.id,
        job_title="Fetched URL Position",
        company="Fetched Company",
        job_description=f"Source: {req.url}\n\n{job_text}"
    )
    return analysis


@router.post("/jobs/analyze-file", response_model=schemas.JobAnalysisResponse)
async def analyze_job_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Only PDF and DOCX files are allowed."
        )

    # 10MB limit
    MAX_FILE_SIZE = 10 * 1024 * 1024
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds 10MB limit."
        )

    parser = DocumentParserImpl()
    try:
        if ext == "pdf":
            job_text = parser.parse_pdf(file_bytes)
        else:
            job_text = parser.parse_docx(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not job_text or len(job_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract text from document."
        )

    ai_provider = AIProviderFactory.get_provider()
    job_repo = JobAnalysisRepositoryImpl(db)
    use_case = AnalyzeJobDescriptionUseCase(ai_provider, job_repo)
    
    analysis = await use_case.execute(
        user_id=current_user.id,
        job_title="Uploaded Document Position",
        company="Uploaded Document Company",
        job_description=job_text
    )
    return analysis


@router.get("/jobs/analyses", response_model=List[schemas.JobAnalysisResponse])
async def get_job_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_repo = JobAnalysisRepositoryImpl(db)
    analyses = await job_repo.get_by_user(current_user.id)
    return analyses


@router.post("/jobs/match")
async def match_resume_to_job(
    req: schemas.JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_repo = ResumeRepositoryImpl(db)
    job_repo = JobAnalysisRepositoryImpl(db)
    
    resume = await resume_repo.get_by_id(req.resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        
    job = await job_repo.get_by_id(req.job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job Analysis not found")
        
    ai_provider = AIProviderFactory.get_provider()
    use_case = SemanticJobMatchUseCase(ai_provider)
    
    match_result = await use_case.execute(
        resume_text=resume.original_text,
        resume_parsed_json=resume.parsed_json,
        job_description_text=job.job_description,
        job_parsed_json=job.parsed_json or {
            "required_skills": job.skills_required,
            "salary": job.salary_benchmark,
            "nysc_required": job.nysc_required
        }
    )
    return match_result


@router.post("/resumes/improve-bullet")
async def improve_bullet_point(
    req: schemas.ImproveBulletRequest,
    current_user: User = Depends(get_current_user)
):
    ai_provider = AIProviderFactory.get_provider()
    use_case = ImproveBulletPointUseCase(ai_provider)
    result = await use_case.execute(bullet_point=req.bullet_point, tone=req.tone)
    return result


# --- INTERVIEW QUESTION GENERATOR ---

@router.post("/interviews/generate-questions")
async def generate_interview_questions(
    req: schemas.GenerateInterviewQuestionsRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a personalised, role-specific interview question bank.

    Given the candidate's resume text, the job description, company name, and
    requested question types, the AI returns a rich question bank with:
    - The question (Technical / Behavioral / HR / Situational / STAR)
    - Why the interviewer asks it
    - A model answer grounded ONLY in resume facts (no hallucination)
    - STAR breakdown (for Behavioral/STAR types)
    - A 5-point scoring rubric with benchmarks for 1-2, 3, and 4-5 scores
    - Follow-up questions
    - Keywords to include in the answer
    - Company research notes and general preparation tips
    """
    import json
    import logging
    logger = logging.getLogger(__name__)

    if not req.resume_text or len(req.resume_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is too short. Please provide a detailed resume."
        )
    if not req.job_description or len(req.job_description.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too short. Please provide a detailed job description."
        )

    valid_types = {"Technical", "Behavioral", "HR", "Situational", "STAR"}
    invalid_types = [t for t in req.question_types if t not in valid_types]
    if invalid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question types: {invalid_types}. Valid options: {list(valid_types)}"
        )

    ai_provider = AIProviderFactory.get_provider()
    use_case = GenerateInterviewQuestionsUseCase(ai_provider)

    try:
        result = await use_case.execute(
            resume_text=req.resume_text,
            job_description=req.job_description,
            company_name=req.company_name,
            job_title=req.job_title,
            question_types=req.question_types,
            num_per_type=req.num_questions_per_type,
        )
        return result
    except Exception as e:
        logger.error(f"Interview question generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question generation failed: {str(e)}"
        )


# --- NIGERIA CAREER INSIGHTS ---

from backend.app.infrastructure.nigeria_insights_data import (
    get_all_industries, get_industry_detail, get_visa_opportunities
)
import json as _json


@router.get("/insights/industries")
async def list_industries(_: User = Depends(get_current_user)):
    """Return summary cards for all 7 industries — used to render the industry picker."""
    return get_all_industries()


@router.get("/insights/industries/{industry_id}")
async def get_industry(industry_id: str, _: User = Depends(get_current_user)):
    """Return full curated data for a single industry."""
    data = get_industry_detail(industry_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Industry '{industry_id}' not found")
    return data


@router.get("/insights/visa-opportunities")
async def list_visa_opportunities(_: User = Depends(get_current_user)):
    """Return all visa-friendly roles across every industry — for the Global Opportunities panel."""
    return get_visa_opportunities()


@router.post("/insights/personalized-recommendations")
async def get_personalized_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI-powered personalized career recommendations using Dependency Injection."""
    ai_provider = AIProviderFactory.get_provider()
    resume_repo = ResumeRepositoryImpl(db)
    use_case = GetPersonalizedRecommendationsUseCase(ai_provider, resume_repo)
    return await use_case.execute(current_user)


# --- ENTERPRISE ADMIN DASHBOARD ENDPOINTS ---

from backend.app.infrastructure.admin_data import (
    admin_ai_settings, admin_feature_flags, admin_prompt_templates,
    admin_api_keys, admin_roles_and_team, admin_system_logs,
    get_admin_analytics_summary
)
from pydantic import BaseModel


class SwitchProviderRequest(BaseModel):
    provider_key: str


class FallbackOrderRequest(BaseModel):
    fallback_order: List[str]


class ConfigureProviderRequest(BaseModel):
    provider_key: str
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    max_output_tokens: Optional[int] = None
    temperature_default: Optional[float] = None


class ToggleFeatureFlagRequest(BaseModel):
    key: str
    enabled: bool
    rollout_percentage: Optional[int] = None


class UpdatePromptTemplateRequest(BaseModel):
    id: str
    system_instruction: str
    temperature: float
    max_tokens: int


class CreateApiKeyRequest(BaseModel):
    name: str
    role: str
    rate_limit_rpm: int
    monthly_quota: int


@router.get("/admin/dashboard-summary")
async def get_admin_dashboard_summary(_: User = Depends(get_current_user)):
    """Return consolidated analytics for admin dashboard overview."""
    return {
        "analytics": get_admin_analytics_summary(),
        "ai_settings": admin_ai_settings,
        "active_feature_flags_count": sum(1 for f in admin_feature_flags if f["enabled"]),
        "total_feature_flags_count": len(admin_feature_flags),
        "api_keys_count": len(admin_api_keys),
        "logs_count": len(admin_system_logs)
    }


@router.get("/admin/providers")
async def get_ai_providers_config(_: User = Depends(get_current_user)):
    """Return current provider settings, latency, rate limits & fallback order."""
    return admin_ai_settings


@router.post("/admin/providers/switch")
async def switch_primary_provider(req: SwitchProviderRequest, _: User = Depends(get_current_user)):
    """Switch primary AI provider dynamically."""
    if req.provider_key not in admin_ai_settings["providers"] and req.provider_key != "mock":
        raise HTTPException(status_code=400, detail=f"Invalid provider key: {req.provider_key}")
    
    admin_ai_settings["active_provider"] = req.provider_key
    admin_system_logs.insert(0, {
        "id": f"log_{len(admin_system_logs) + 100}",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": "AUDIT",
        "module": "AI Provider Config",
        "message": f"Primary AI Provider switched to '{req.provider_key}' by Admin"
    })
    return {"message": f"Primary provider switched to {req.provider_key}", "active_provider": req.provider_key}


@router.post("/admin/providers/fallback-order")
async def update_fallback_order(req: FallbackOrderRequest, _: User = Depends(get_current_user)):
    """Update AI provider fallback chain order."""
    admin_ai_settings["fallback_order"] = req.fallback_order
    admin_system_logs.insert(0, {
        "id": f"log_{len(admin_system_logs) + 100}",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": "AUDIT",
        "module": "AI Provider Config",
        "message": f"Fallback chain order updated to {req.fallback_order}"
    })
    return {"message": "Fallback order updated", "fallback_order": req.fallback_order}


@router.post("/admin/providers/configure")
async def configure_provider(req: ConfigureProviderRequest, _: User = Depends(get_current_user)):
    """Configure API keys and parameters for a provider."""
    provider = admin_ai_settings["providers"].get(req.provider_key)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    if req.api_key:
        provider["api_key_configured"] = True
        provider["masked_key"] = f"{req.api_key[:6]}...{req.api_key[-4:]}"
    if req.model_name:
        provider["model_name"] = req.model_name
    if req.max_output_tokens:
        provider["max_output_tokens"] = req.max_output_tokens
    if req.temperature_default is not None:
        provider["temperature_default"] = req.temperature_default
        
    return {"message": f"Provider '{req.provider_key}' configured successfully", "provider": provider}


@router.get("/admin/feature-flags")
async def get_feature_flags(_: User = Depends(get_current_user)):
    """Get all feature flags."""
    return admin_feature_flags


@router.post("/admin/feature-flags/toggle")
async def toggle_feature_flag(req: ToggleFeatureFlagRequest, _: User = Depends(get_current_user)):
    """Enable or disable a feature flag."""
    for flag in admin_feature_flags:
        if flag["key"] == req.key:
            flag["enabled"] = req.enabled
            if req.rollout_percentage is not None:
                flag["rollout_percentage"] = req.rollout_percentage
            
            admin_system_logs.insert(0, {
                "id": f"log_{len(admin_system_logs) + 100}",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
                "severity": "AUDIT",
                "module": "Feature Flags",
                "message": f"Feature flag '{flag['name']}' set to enabled={req.enabled}"
            })
            return {"message": f"Feature flag '{flag['name']}' updated", "flag": flag}
            
    raise HTTPException(status_code=404, detail="Feature flag not found")


@router.get("/admin/prompt-templates")
async def get_prompt_templates(_: User = Depends(get_current_user)):
    """Get all system prompt templates."""
    return admin_prompt_templates


@router.post("/admin/prompt-templates/update")
async def update_prompt_template(req: UpdatePromptTemplateRequest, _: User = Depends(get_current_user)):
    """Update system instructions and parameters for a prompt template."""
    tmpl = admin_prompt_templates.get(req.id)
    if not tmpl:
        raise HTTPException(status_code=404, detail="Prompt template not found")
        
    tmpl["system_instruction"] = req.system_instruction
    tmpl["temperature"] = req.temperature
    tmpl["max_tokens"] = req.max_tokens
    
    # Bump sub-version
    v_parts = tmpl["version"].replace("v", "").split(".")
    tmpl["version"] = f"v{v_parts[0]}.{int(v_parts[1]) + 1}"
    
    admin_system_logs.insert(0, {
        "id": f"log_{len(admin_system_logs) + 100}",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": "AUDIT",
        "module": "Prompt Engineering",
        "message": f"Prompt template '{tmpl['name']}' updated to version {tmpl['version']}"
    })
    return {"message": "Prompt template updated", "template": tmpl}


@router.get("/admin/api-keys")
async def get_api_keys(_: User = Depends(get_current_user)):
    """Get developer API keys."""
    return admin_api_keys


@router.post("/admin/api-keys/create")
async def create_api_key(req: CreateApiKeyRequest, _: User = Depends(get_current_user)):
    """Create a new developer API key."""
    import secrets
    raw_key = f"nci_live_{secrets.token_hex(16)}"
    key_obj = {
        "id": f"key_{len(admin_api_keys) + 1:02d}",
        "name": req.name,
        "key_prefix": f"{raw_key[:12]}...",
        "created_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "last_used_at": "Never",
        "rate_limit_rpm": req.rate_limit_rpm,
        "monthly_quota": req.monthly_quota,
        "monthly_used": 0,
        "status": "Active",
        "role": req.role
    }
    admin_api_keys.append(key_obj)
    return {"message": "API Key created", "raw_key": raw_key, "key_info": key_obj}


@router.delete("/admin/api-keys/{key_id}")
async def revoke_api_key(key_id: str, _: User = Depends(get_current_user)):
    """Revoke/Delete an API key."""
    global admin_api_keys
    admin_api_keys = [k for k in admin_api_keys if k["id"] != key_id]
    return {"message": f"API Key {key_id} revoked"}


@router.get("/admin/system-logs")
async def get_system_logs(_: User = Depends(get_current_user)):
    """Get recent system logs."""
    return admin_system_logs


@router.get("/admin/team-roles")
async def get_team_roles(_: User = Depends(get_current_user)):
    """Get admin team members & assigned roles."""
    return admin_roles_and_team


# --- SAAS SUBSCRIPTIONS & MULTI-GATEWAY PAYMENTS ---

from backend.app.domain.billing import SUBSCRIPTION_PLANS, check_quota
from backend.app.infrastructure.payment_gateways import paystack_service, stripe_service
from backend.app.infrastructure.database import DBTransaction, DBResume, DBCoverLetter, DBInterviewSession, DBJobAnalysis


@router.get("/subscriptions/plans", tags=["SaaS Subscriptions"], summary="Get All Subscription Plans & Pricing (NGN & USD)")
async def get_subscription_plans():
    """Returns Free, Starter, Professional, and Premium plans with NGN (Paystack) & USD (Stripe) pricing."""
    return SUBSCRIPTION_PLANS


@router.get("/subscriptions/my-usage", tags=["SaaS Subscriptions"], summary="Get Current Candidate Feature Usage & Quotas")
async def get_my_usage(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get candidate's feature usage meters vs plan quota limits."""
    user_plan = current_user.subscription_plan or "free"
    plan_info = SUBSCRIPTION_PLANS.get(user_plan, SUBSCRIPTION_PLANS["free"])

    # Count real usage from database
    resume_count = db.query(DBResume).filter(DBResume.user_id == current_user.id).count()
    cover_letter_count = db.query(DBCoverLetter).filter(DBCoverLetter.user_id == current_user.id).count()
    job_match_count = db.query(DBJobAnalysis).filter(DBJobAnalysis.user_id == current_user.id).count()
    interview_count = db.query(DBInterviewSession).filter(DBInterviewSession.user_id == current_user.id).count()

    limits = plan_info["limits"]
    return {
        "user_id": current_user.id,
        "subscription_plan": user_plan,
        "plan_name": plan_info["name"],
        "subscription_status": current_user.subscription_status or "active",
        "usage": {
            "resume_analyses": {
                "used": resume_count,
                "limit": limits["resume_analyses"],
                "remaining": max(0, limits["resume_analyses"] - resume_count)
            },
            "cover_letters": {
                "used": cover_letter_count,
                "limit": limits["cover_letters"],
                "remaining": max(0, limits["cover_letters"] - cover_letter_count)
            },
            "job_matches": {
                "used": job_match_count,
                "limit": limits["job_matches"],
                "remaining": max(0, limits["job_matches"] - job_match_count)
            },
            "interview_practice": {
                "used": interview_count,
                "limit": limits["interview_practice"],
                "remaining": max(0, limits["interview_practice"] - interview_count)
            }
        }
    }


@router.post("/payments/initialize-checkout", tags=["SaaS Subscriptions"], summary="Initialize Paystack (NGN) or Stripe (USD) Checkout Session")
async def initialize_checkout(
    req: schemas.CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initialize payment checkout via Paystack (for Nigerian NGN payments) or Stripe (for International USD payments)."""
    if req.plan_key not in ["starter", "professional", "premium"]:
        raise HTTPException(status_code=400, detail="Invalid subscription plan")

    callback = req.callback_url or "http://localhost:3000/dashboard?payment=success"
    reference = f"txn_{req.gateway}_{req.plan_key}_{current_user.id}_{int(time.time())}"

    if req.gateway == "paystack":
        res = await paystack_service.initialize_transaction(
            email=current_user.email,
            plan_key=req.plan_key,
            callback_url=callback
        )
        # Record pending transaction
        plan = SUBSCRIPTION_PLANS[req.plan_key]
        db_txn = DBTransaction(
            user_id=current_user.id,
            reference=res.get("data", {}).get("reference", reference),
            amount=plan["price_ngn"],
            currency="NGN",
            gateway="paystack",
            plan_key=req.plan_key,
            status="pending"
        )
        db.add(db_txn)
        db.commit()

        return {
            "gateway": "paystack",
            "checkout_url": res["data"]["authorization_url"],
            "reference": res["data"]["reference"]
        }

    elif req.gateway == "stripe":
        res = await stripe_service.create_checkout_session(
            email=current_user.email,
            plan_key=req.plan_key,
            success_url=f"{callback}&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url="http://localhost:3000/dashboard?payment=cancelled"
        )
        plan = SUBSCRIPTION_PLANS[req.plan_key]
        db_txn = DBTransaction(
            user_id=current_user.id,
            reference=res.get("id", reference),
            amount=plan["price_usd"],
            currency="USD",
            gateway="stripe",
            plan_key=req.plan_key,
            status="pending"
        )
        db.add(db_txn)
        db.commit()

        return {
            "gateway": "stripe",
            "checkout_url": res["url"],
            "session_id": res.get("id", reference)
        }

    else:
        raise HTTPException(status_code=400, detail="Unsupported payment gateway. Choose 'paystack' or 'stripe'.")


@router.post("/webhooks/paystack", tags=["SaaS Subscriptions"], summary="Paystack Webhook Handler (HMAC SHA512 Verified)")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """Verifies Paystack webhook signature and upgrades user subscription upon successful charge."""
    raw_body = await request.body()
    signature = request.headers.get("x-paystack-signature", "")

    if not paystack_service.verify_webhook_signature(raw_body, signature):
        raise HTTPException(status_code=400, detail="Invalid Paystack HMAC signature")

    event_data = _json.loads(raw_body.decode("utf-8") or "{}")
    event_type = event_data.get("event")

    if event_type == "charge.success":
        data = event_data.get("data", {})
        customer_email = data.get("customer", {}).get("email")
        plan_key = data.get("metadata", {}).get("plan_key", "professional")
        reference = data.get("reference")

        user_repo = UserRepositoryImpl(db)
        user = await user_repo.get_by_email(customer_email)
        if user:
            user.subscription_plan = plan_key
            user.subscription_status = "active"
            await user_repo.update(user)

            # Update transaction status
            txn = db.query(DBTransaction).filter(DBTransaction.reference == reference).first()
            if txn:
                txn.status = "success"
                db.commit()

    return {"status": "success"}


@router.post("/webhooks/stripe", tags=["SaaS Subscriptions"], summary="Stripe Webhook Handler (Signature Verified)")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Verifies Stripe webhook signature and upgrades user subscription upon checkout completed."""
    raw_body = await request.body()
    signature = request.headers.get("stripe-signature", "")

    if not stripe_service.verify_webhook_signature(raw_body, signature):
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    event_data = _json.loads(raw_body.decode("utf-8") or "{}")
    event_type = event_data.get("type")

    if event_type == "checkout.session.completed":
        session = event_data.get("data", {}).get("object", {})
        customer_email = session.get("customer_email")
        plan_key = session.get("metadata", {}).get("plan_key", "professional")
        session_id = session.get("id")

        user_repo = UserRepositoryImpl(db)
        user = await user_repo.get_by_email(customer_email)
        if user:
            user.subscription_plan = plan_key
            user.subscription_status = "active"
            await user_repo.update(user)

            txn = db.query(DBTransaction).filter(DBTransaction.reference == session_id).first()
            if txn:
                txn.status = "success"
                db.commit()

    return {"status": "success"}

