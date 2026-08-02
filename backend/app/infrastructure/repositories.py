import uuid
from typing import List, Optional, Any
from sqlalchemy.orm import Session
from backend.app.domain.models import User, Resume, CoverLetter, InterviewSession, InterviewQuestion, JobAnalysis
from backend.app.domain.interfaces import (
    UserRepository, ResumeRepository, CoverLetterRepository, InterviewRepository, JobAnalysisRepository
)
from backend.app.infrastructure.database import (
    DBUser, DBResume, DBCoverLetter, DBInterviewSession, DBInterviewQuestion, DBJobAnalysis,
    to_domain_user, to_domain_resume, to_domain_cover_letter, to_domain_interview_session, to_domain_job_analysis,
    to_domain_interview_question
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
            job_role=session.job_role,
            industry=session.industry,
            status=session.status,
            feedback_overall=session.feedback_overall,
            score=session.score
        )
        self.db.add(db_sess)
        self.db.commit()
        
        # Add initial questions if any
        for q in session.questions:
            db_q = DBInterviewQuestion(
                session_id=session_id,
                question_text=q.question_text,
                user_answer=q.user_answer,
                ai_feedback=q.ai_feedback,
                ai_score=q.ai_score,
                question_order=q.question_order
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
        db_sess.feedback_overall = session.feedback_overall
        db_sess.score = session.score
        
        self.db.commit()
        self.db.refresh(db_sess)
        return to_domain_interview_session(db_sess)

    async def add_question(self, session_id: str, question: InterviewQuestion) -> InterviewQuestion:
        db_q = DBInterviewQuestion(
            session_id=session_id,
            question_text=question.question_text,
            user_answer=question.user_answer,
            ai_feedback=question.ai_feedback,
            ai_score=question.ai_score,
            question_order=question.question_order
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
