import pytest
from backend.app.domain.models import User, Resume, InterviewSession
from backend.app.application.use_cases import ScoreResumeUseCase, InterviewSimulatorUseCase, AnalyzeJobDescriptionUseCase
from backend.app.infrastructure.repositories import UserRepositoryImpl, ResumeRepositoryImpl, InterviewRepositoryImpl, JobAnalysisRepositoryImpl

@pytest.mark.asyncio
async def test_score_resume_use_case(db_session, mock_ai_provider):
    # 1. Create a user
    user_repo = UserRepositoryImpl(db_session)
    user = User(
        email="test_user@example.com",
        hashed_password="hashed_password",
        full_name="Musa Abubakar",
        nysc_status="completed",
        target_job_title="Software Engineer",
        target_industry="Tech"
    )
    saved_user = await user_repo.create(user)
    
    # 2. Run use case
    resume_repo = ResumeRepositoryImpl(db_session)
    use_case = ScoreResumeUseCase(mock_ai_provider, resume_repo)
    
    resume_text = "Musa Abubakar, B.Sc. Computer Science. Completed NYSC service at Government College Ibadan."
    resume = await use_case.execute(saved_user, resume_text, "musa_cv.pdf")
    
    assert resume.id is not None
    assert resume.user_id == saved_user.id
    assert resume.ats_score == 85
    assert resume.parsed_json["name"] == "Musa Abubakar"
    assert "React" in resume.ats_feedback["missing_skills"]
    assert resume.ats_feedback["structure_rating"] == "Excellent"


@pytest.mark.asyncio
async def test_interview_simulator_use_case(db_session, mock_ai_provider):
    # 1. Create a user
    user_repo = UserRepositoryImpl(db_session)
    user = User(
        email="interviewer_candidate@example.com",
        hashed_password="hashed_password",
        full_name="Precious Okafor",
        nysc_status="serving",
        target_job_title="Data Analyst",
        target_industry="Fintech"
    )
    saved_user = await user_repo.create(user)
    
    # 2. Start session
    interview_repo = InterviewRepositoryImpl(db_session)
    use_case = InterviewSimulatorUseCase(mock_ai_provider, interview_repo, user_repo)
    
    session = await use_case.start_session(saved_user.id, "Data Analyst", "Fintech")
    
    assert session.id is not None
    assert session.status == "active"
    assert len(session.questions) == 1
    assert session.questions[0].question_order == 1
    
    # 3. Respond to question
    result = await use_case.respond_to_question(session.id, "I worked on clean data modeling during my NYSC assignment.")
    
    assert result["session_status"] == "active"
    assert result["score"] == 80
    assert "STAR format" in result["feedback"]
    assert result["next_question"] is not None
    assert len(result["next_question"]) > 0


@pytest.mark.asyncio
async def test_semantic_job_match_use_case(db_session, mock_ai_provider):
    from backend.app.application.use_cases import SemanticJobMatchUseCase
    
    use_case = SemanticJobMatchUseCase(mock_ai_provider)
    
    resume_text = "Musa Abubakar, Software Engineer. Proficient in React, Node, and Postgres."
    resume_json = {
        "skills": ["React", "Node", "Postgres"],
        "experience": [{"role": "Software Engineer", "company": "Tech Corp", "achievements": ["Built React components"]}],
        "education": [{"degree": "B.Sc. Computer Science", "school": "University of Ibadan"}]
    }
    
    job_text = "Looking for a Software Engineer with React, PostgreSQL, and Node experience."
    job_json = {
        "skills_required": ["React", "PostgreSQL", "Node"],
        "responsibilities": ["Develop React frontends and Node APIs"],
        "education": "B.Sc. in Computer Science or equivalent",
        "keywords": ["React", "Node", "Postgres"]
    }
    
    match_result = await use_case.execute(resume_text, resume_json, job_text, job_json)
    
    assert match_result["overall_match_percentage"] is not None
    assert match_result["skills_match_score"] is not None
    assert match_result["likelihood_of_interview"] in ["High", "Medium", "Low"]
    assert len(match_result["missing_skills"]) > 0
    assert len(match_result["recommendations"]) > 0


@pytest.mark.asyncio
async def test_generate_cover_letter_use_case(db_session, mock_ai_provider):
    from backend.app.application.use_cases import GenerateCoverLetterUseCase, ScoreResumeUseCase
    from backend.app.infrastructure.repositories import CoverLetterRepositoryImpl, ResumeRepositoryImpl, UserRepositoryImpl
    
    # 1. Create User & Resume
    user_repo = UserRepositoryImpl(db_session)
    user = User(
        email="cv_writer@example.com",
        hashed_password="hashed_password",
        full_name="Chidi Okafor"
    )
    saved_user = await user_repo.create(user)
    
    resume_repo = ResumeRepositoryImpl(db_session)
    score_use_case = ScoreResumeUseCase(mock_ai_provider, resume_repo)
    resume = await score_use_case.execute(saved_user, "Chidi Okafor, Software Dev. 3 years exp.", "chidi_cv.pdf")
    
    # 2. Run use case
    cl_repo = CoverLetterRepositoryImpl(db_session)
    use_case = GenerateCoverLetterUseCase(mock_ai_provider, cl_repo, resume_repo)
    
    cl = await use_case.execute(
        user_id=saved_user.id,
        resume_id=resume.id,
        company_name="Access Bank",
        job_title="Software Developer",
        job_description="React and Node developers needed.",
        tone="Professional",
        hiring_manager="Mr. Chinedu"
    )
    
    assert cl.id is not None
    assert cl.company_name == "Access Bank"
    assert cl.job_title == "Software Developer"
    assert "Mocked" in cl.content or len(cl.content) > 0
