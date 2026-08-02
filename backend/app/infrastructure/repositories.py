import uuid
from typing import List, Optional, Any
from sqlalchemy.orm import Session
from backend.app.domain.models import (
    User, Resume, CoverLetter, InterviewSession, InterviewQuestion, JobAnalysis,
    Job, Company, JobApplication, JobRecommendation, JobBookmark, JobAlert
)
from backend.app.domain.interfaces import (
    UserRepository, ResumeRepository, CoverLetterRepository, InterviewRepository, JobAnalysisRepository,
    JobRepository, CompanyRepository, JobApplicationRepository
)
from backend.app.infrastructure.database import (
    DBUser, DBResume, DBCoverLetter, DBInterviewSession, DBInterviewQuestion, DBJobAnalysis,
    DBJob, DBCompany, DBJobApplication, DBJobRecommendation, DBJobBookmark, DBJobAlert,
    to_domain_user, to_domain_resume, to_domain_cover_letter, to_domain_interview_session, to_domain_job_analysis,
    to_domain_interview_question, to_domain_job, to_domain_company, to_domain_job_application, to_domain_job_recommendation
)

class UserRepositoryImpl(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        db_user = self.db.query(DBUser).filter(DBUser.id == user_id).first()
        return to_domain_user(db_user)

    async def get_by_email(self, email: str) -> Optional[User]:
        db_user = self.db.query(DBUser).filter(DBUser.email == email).first()
        return to_domain_user(db_user)

    async def create(self, user: User) -> User:
        db_user = DBUser(
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            nysc_status=user.nysc_status,
            target_job_title=user.target_job_title,
            target_industry=user.target_industry,
            is_verified=user.is_verified,
            verification_token=user.verification_token,
            reset_token=user.reset_token,
            reset_token_expires_at=user.reset_token_expires_at,
            refresh_token=user.refresh_token,
            provider=user.provider,
            avatar_url=user.avatar_url,
            phone_number=user.phone_number,
            subscription_plan=user.subscription_plan,
            subscription_status=user.subscription_status,
            subscription_expires_at=user.subscription_expires_at
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return to_domain_user(db_user)

    async def update(self, user: User) -> User:
        db_user = self.db.query(DBUser).filter(DBUser.id == user.id).first()
        if not db_user:
            raise ValueError(f"User with ID {user.id} not found")
        
        db_user.email = user.email
        if user.hashed_password:
            db_user.hashed_password = user.hashed_password
        db_user.full_name = user.full_name
        db_user.nysc_status = user.nysc_status
        db_user.target_job_title = user.target_job_title
        db_user.target_industry = user.target_industry
        db_user.is_verified = user.is_verified
        db_user.verification_token = user.verification_token
        db_user.reset_token = user.reset_token
        db_user.reset_token_expires_at = user.reset_token_expires_at
        db_user.refresh_token = user.refresh_token
        db_user.provider = user.provider
        db_user.avatar_url = user.avatar_url
        db_user.phone_number = user.phone_number
        db_user.subscription_plan = user.subscription_plan
        db_user.subscription_status = user.subscription_status
        db_user.subscription_expires_at = user.subscription_expires_at
        
        self.db.commit()
        self.db.refresh(db_user)
        return to_domain_user(db_user)


class ResumeRepositoryImpl(ResumeRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, resume_id: int) -> Optional[Resume]:
        db_resume = self.db.query(DBResume).filter(DBResume.id == resume_id).first()
        return to_domain_resume(db_resume)

    async def get_latest_by_user(self, user_id: int) -> Optional[Resume]:
        db_resume = self.db.query(DBResume)\
            .filter(DBResume.user_id == user_id)\
            .order_by(DBResume.created_at.desc())\
            .first()
        return to_domain_resume(db_resume)

    async def create(self, resume: Resume) -> Resume:
        db_resume = DBResume(
            user_id=resume.user_id,
            file_name=resume.file_name,
            original_text=resume.original_text,
            parsed_json=resume.parsed_json,
            tailored_text=resume.tailored_text,
            ats_score=resume.ats_score,
            ats_feedback=resume.ats_feedback
        )
        self.db.add(db_resume)
        self.db.commit()
        self.db.refresh(db_resume)
        return to_domain_resume(db_resume)

    async def update(self, resume: Resume) -> Resume:
        db_resume = self.db.query(DBResume).filter(DBResume.id == resume.id).first()
        if not db_resume:
            raise ValueError(f"Resume with ID {resume.id} not found")
        
        db_resume.file_name = resume.file_name
        db_resume.original_text = resume.original_text
        db_resume.parsed_json = resume.parsed_json
        db_resume.tailored_text = resume.tailored_text
        db_resume.ats_score = resume.ats_score
        db_resume.ats_feedback = resume.ats_feedback
        
        self.db.commit()
        self.db.refresh(db_resume)
        return to_domain_resume(db_resume)


class CoverLetterRepositoryImpl(CoverLetterRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, cover_letter_id: int) -> Optional[CoverLetter]:
        db_cl = self.db.query(DBCoverLetter).filter(DBCoverLetter.id == cover_letter_id).first()
        return to_domain_cover_letter(db_cl)

    async def get_by_user(self, user_id: int) -> List[CoverLetter]:
        db_cls = self.db.query(DBCoverLetter).filter(DBCoverLetter.user_id == user_id).order_by(DBCoverLetter.created_at.desc()).all()
        return [to_domain_cover_letter(cl) for cl in db_cls]

    async def create(self, cover_letter: CoverLetter) -> CoverLetter:
        db_cl = DBCoverLetter(
            user_id=cover_letter.user_id,
            company_name=cover_letter.company_name,
            job_title=cover_letter.job_title,
            content=cover_letter.content
        )
        self.db.add(db_cl)
        self.db.commit()
        self.db.refresh(db_cl)
        return to_domain_cover_letter(db_cl)


class InterviewRepositoryImpl(InterviewRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_session_by_id(self, session_id: str) -> Optional[InterviewSession]:
        db_sess = self.db.query(DBInterviewSession).filter(DBInterviewSession.id == session_id).first()
        return to_domain_interview_session(db_sess)

    async def get_sessions_by_user(self, user_id: int) -> List[InterviewSession]:
        db_sesss = self.db.query(DBInterviewSession).filter(DBInterviewSession.user_id == user_id).order_by(DBInterviewSession.created_at.desc()).all()
        return [to_domain_interview_session(s) for s in db_sesss]

    async def create_session(self, session: InterviewSession) -> InterviewSession:
        session_id = session.id or str(uuid.uuid4())
        db_sess = DBInterviewSession(
            id=session_id,
            user_id=session.user_id,
            interview_type=session.interview_type,
            job_role=session.job_role,
            company=session.company,
            industry=session.industry,
            difficulty=session.difficulty,
            duration_minutes=session.duration_minutes,
            interview_style=session.interview_style,
            voice_enabled=session.voice_enabled,
            language=session.language,
            resume_text=session.resume_text,
            job_description=session.job_description,
            status=session.status,
            elapsed_seconds=session.elapsed_seconds,
            prep_profile=session.prep_profile,
            conversation_summary=session.conversation_summary,
            feedback_overall=session.feedback_overall,
            score=session.score,
            category_scores=session.category_scores,
            full_report=session.full_report,
            coach_advice=session.coach_advice
        )
        self.db.add(db_sess)
        self.db.commit()
        
        # Add initial questions if any
        for q in session.questions:
            db_q = DBInterviewQuestion(
                session_id=session_id,
                question_text=q.question_text,
                category=q.category,
                user_answer=q.user_answer,
                ai_feedback=q.ai_feedback,
                ai_score=q.ai_score,
                scores_detail=q.scores_detail,
                question_order=q.question_order,
                audio_url=q.audio_url,
                timestamp_formatted=q.timestamp_formatted
            )
            self.db.add(db_q)
        
        self.db.commit()
        self.db.refresh(db_sess)
        return to_domain_interview_session(db_sess)

    async def update_session(self, session: InterviewSession) -> InterviewSession:
        db_sess = self.db.query(DBInterviewSession).filter(DBInterviewSession.id == session.id).first()
        if not db_sess:
            raise ValueError(f"Interview session with ID {session.id} not found")
        
        db_sess.status = session.status
        db_sess.elapsed_seconds = session.elapsed_seconds
        db_sess.conversation_summary = session.conversation_summary
        db_sess.feedback_overall = session.feedback_overall
        db_sess.score = session.score
        db_sess.category_scores = session.category_scores
        db_sess.full_report = session.full_report
        db_sess.coach_advice = session.coach_advice
        
        self.db.commit()
        self.db.refresh(db_sess)
        return to_domain_interview_session(db_sess)

    async def add_question(self, session_id: str, question: InterviewQuestion) -> InterviewQuestion:
        db_q = DBInterviewQuestion(
            session_id=session_id,
            question_text=question.question_text,
            category=question.category,
            user_answer=question.user_answer,
            ai_feedback=question.ai_feedback,
            ai_score=question.ai_score,
            scores_detail=question.scores_detail,
            question_order=question.question_order,
            audio_url=question.audio_url,
            timestamp_formatted=question.timestamp_formatted
        )
        self.db.add(db_q)
        self.db.commit()
        self.db.refresh(db_q)
        return to_domain_interview_question(db_q)

    async def update_question(self, question: InterviewQuestion) -> InterviewQuestion:
        db_q = self.db.query(DBInterviewQuestion).filter(DBInterviewQuestion.id == question.id).first()
        if not db_q:
            raise ValueError(f"Interview question with ID {question.id} not found")
        
        db_q.user_answer = question.user_answer
        db_q.ai_feedback = question.ai_feedback
        db_q.ai_score = question.ai_score
        db_q.scores_detail = question.scores_detail
        db_q.audio_url = question.audio_url
        
        self.db.commit()
        self.db.refresh(db_q)
        return to_domain_interview_question(db_q)


class JobAnalysisRepositoryImpl(JobAnalysisRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, analysis_id: int) -> Optional[JobAnalysis]:
        db_ja = self.db.query(DBJobAnalysis).filter(DBJobAnalysis.id == analysis_id).first()
        return to_domain_job_analysis(db_ja)

    async def get_by_user(self, user_id: int) -> List[JobAnalysis]:
        db_jas = self.db.query(DBJobAnalysis).filter(DBJobAnalysis.user_id == user_id).order_by(DBJobAnalysis.created_at.desc()).all()
        return [to_domain_job_analysis(ja) for ja in db_jas]

    async def create(self, analysis: JobAnalysis) -> JobAnalysis:
        db_ja = DBJobAnalysis(
            user_id=analysis.user_id,
            job_title=analysis.job_title,
            company=analysis.company,
            job_description=analysis.job_description,
            skills_required=analysis.skills_required,
            salary_benchmark=analysis.salary_benchmark,
            nysc_required=analysis.nysc_required
        )
        self.db.add(db_ja)
        self.db.commit()
        self.db.refresh(db_ja)
        return to_domain_job_analysis(db_ja)


class JobRepositoryImpl(JobRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, job_id: int) -> Optional[Job]:
        db_j = self.db.query(DBJob).filter(DBJob.id == job_id).first()
        return to_domain_job(db_j)

    async def list_jobs(self, filters: dict = None, limit: int = 50, offset: int = 0) -> List[Job]:
        query = self.db.query(DBJob)
        if filters:
            if filters.get("role"):
                query = query.filter(DBJob.title.ilike(f"%{filters['role']}%"))
            if filters.get("remote_only"):
                query = query.filter(DBJob.remote_status == "Remote")
            if filters.get("experience_level"):
                query = query.filter(DBJob.experience_level == filters["experience_level"])
            if filters.get("industry"):
                query = query.filter(DBJob.industry == filters["industry"])
            if filters.get("location"):
                query = query.filter(DBJob.location.ilike(f"%{filters['location']}%"))
            if filters.get("nysc_friendly"):
                query = query.filter(DBJob.nysc_friendly == True)
            if filters.get("visa_sponsorship"):
                query = query.filter(DBJob.visa_sponsorship == True)

        db_jobs = query.order_by(DBJob.date_posted.desc()).offset(offset).limit(limit).all()
        return [to_domain_job(j) for j in db_jobs]

    async def create(self, job: Job) -> Job:
        existing = None
        if job.external_id:
            existing = self.db.query(DBJob).filter(DBJob.external_id == job.external_id).first()
        if not existing:
            existing = self.db.query(DBJob).filter(DBJob.title == job.title, DBJob.company_name == job.company_name).first()

        if existing:
            return to_domain_job(existing)

        db_j = DBJob(
            source_id=job.source_id,
            company_id=job.company_id,
            external_id=job.external_id,
            source_name=job.source_name,
            company_name=job.company_name,
            company_logo=job.company_logo,
            title=job.title,
            department=job.department,
            employment_type=job.employment_type,
            experience_level=job.experience_level,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            salary_formatted=job.salary_formatted,
            currency=job.currency,
            location=job.location,
            remote_status=job.remote_status,
            industry=job.industry,
            skills=job.skills,
            technologies=job.technologies,
            responsibilities=job.responsibilities,
            qualifications=job.qualifications,
            benefits=job.benefits,
            description=job.description,
            application_url=job.application_url,
            deadline=job.deadline,
            date_posted=job.date_posted,
            status=job.status,
            country=job.country,
            state=job.state,
            city=job.city,
            tags=job.tags,
            is_featured=job.is_featured,
            is_urgent=job.is_urgent,
            visa_sponsorship=job.visa_sponsorship,
            nysc_friendly=job.nysc_friendly
        )
        self.db.add(db_j)
        self.db.commit()
        self.db.refresh(db_j)
        return to_domain_job(db_j)

    async def update(self, job: Job) -> Job:
        db_j = self.db.query(DBJob).filter(DBJob.id == job.id).first()
        if not db_j:
            raise ValueError(f"Job with ID {job.id} not found")

        db_j.title = job.title
        db_j.status = job.status
        db_j.is_featured = job.is_featured
        db_j.is_urgent = job.is_urgent
        self.db.commit()
        self.db.refresh(db_j)
        return to_domain_job(db_j)


class CompanyRepositoryImpl(CompanyRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, company_id: int) -> Optional[Company]:
        db_c = self.db.query(DBCompany).filter(DBCompany.id == company_id).first()
        return to_domain_company(db_c)

    async def list_companies(self, limit: int = 50) -> List[Company]:
        db_cs = self.db.query(DBCompany).order_by(DBCompany.name.asc()).limit(limit).all()
        return [to_domain_company(c) for c in db_cs]

    async def create(self, company: Company) -> Company:
        existing = self.db.query(DBCompany).filter(DBCompany.name == company.name).first()
        if existing:
            return to_domain_company(existing)

        db_c = DBCompany(
            name=company.name,
            logo_url=company.logo_url,
            website=company.website,
            industry=company.industry,
            size=company.size,
            headquarters=company.headquarters,
            description=company.description,
            benefits=company.benefits,
            open_positions_count=company.open_positions_count,
            average_match_score=company.average_match_score
        )
        self.db.add(db_c)
        self.db.commit()
        self.db.refresh(db_c)
        return to_domain_company(db_c)


class JobApplicationRepositoryImpl(JobApplicationRepository):
    def __init__(self, db: Session):
        self.db = db

    async def get_user_applications(self, user_id: int) -> List[JobApplication]:
        db_apps = self.db.query(DBJobApplication).filter(DBJobApplication.user_id == user_id).order_by(DBJobApplication.updated_at.desc()).all()
        return [to_domain_job_application(a) for a in db_apps]

    async def create_or_update(self, application: JobApplication) -> JobApplication:
        existing = self.db.query(DBJobApplication).filter(
            DBJobApplication.user_id == application.user_id,
            DBJobApplication.job_id == application.job_id
        ).first()

        if existing:
            existing.status = application.status
            existing.notes = application.notes or existing.notes
            existing.tailored_resume_id = application.tailored_resume_id or existing.tailored_resume_id
            existing.tailored_cover_letter_id = application.tailored_cover_letter_id or existing.tailored_cover_letter_id
            self.db.commit()
            self.db.refresh(existing)
            return to_domain_job_application(existing)
        else:
            db_a = DBJobApplication(
                user_id=application.user_id,
                job_id=application.job_id,
                status=application.status,
                notes=application.notes,
                tailored_resume_id=application.tailored_resume_id,
                tailored_cover_letter_id=application.tailored_cover_letter_id
            )
            self.db.add(db_a)
            self.db.commit()
            self.db.refresh(db_a)
            return to_domain_job_application(db_a)
