import pytest
from backend.app.domain.models import User, Job, Company, JobApplication
from backend.app.infrastructure.repositories import (
    UserRepositoryImpl, ResumeRepositoryImpl, JobRepositoryImpl, CompanyRepositoryImpl, JobApplicationRepositoryImpl
)
from backend.app.infrastructure.job_providers import RemoteOKProvider, LinkedInJobsProvider, JobbermanProvider
from backend.app.application.job_board_use_cases import (
    IngestJobsUseCase, ComputeJobMatchesUseCase, GetPersonalizedJobFeedUseCase, PrepareOneClickApplicationUseCase
)

@pytest.mark.asyncio
async def test_job_providers_ingestion():
    provider = RemoteOKProvider()
    jobs = await provider.fetch_jobs(limit=5)
    assert len(jobs) > 0
    assert jobs[0].title != ""
    assert jobs[0].company_name != ""

@pytest.mark.asyncio
async def test_job_board_repository_and_feed(db_session, mock_ai_provider):
    # 1. Create User
    user_repo = UserRepositoryImpl(db_session)
    user = User(
        email="jobseeker@example.com",
        hashed_password="hashed_pass",
        full_name="Fatima Bello",
        target_job_title="Software Engineer",
        target_industry="Technology"
    )
    saved_user = await user_repo.create(user)

    # 2. Ingest Jobs into DB
    job_repo = JobRepositoryImpl(db_session)
    company_repo = CompanyRepositoryImpl(db_session)
    ingest_uc = IngestJobsUseCase(job_repo, company_repo)

    jobs = await ingest_uc.execute(provider_types=["remoteok", "linkedin"])
    assert len(jobs) > 0

    # 3. Personal Feed
    resume_repo = ResumeRepositoryImpl(db_session)
    feed_uc = GetPersonalizedJobFeedUseCase(job_repo, company_repo, user_repo, resume_repo, mock_ai_provider)
    feed = await feed_uc.execute(saved_user)

    assert "top_matches" in feed
    assert len(feed["top_matches"]) > 0
    assert feed["top_matches"][0]["match"]["overall_match_score"] >= 50

@pytest.mark.asyncio
async def test_one_click_prep_package(db_session, mock_ai_provider):
    user_repo = UserRepositoryImpl(db_session)
    user = User(
        email="applicant@example.com",
        hashed_password="hashed_pass",
        full_name="Emeka Nnamdi"
    )
    saved_user = await user_repo.create(user)

    job_repo = JobRepositoryImpl(db_session)
    job = Job(
        title="Full Stack Engineer",
        company_name="Stripe",
        location="Remote",
        skills=["Python", "React", "FastAPI"],
        description="Build payment tools."
    )
    saved_job = await job_repo.create(job)

    resume_repo = ResumeRepositoryImpl(db_session)
    prep_uc = PrepareOneClickApplicationUseCase(mock_ai_provider, resume_repo)
    package = await prep_uc.execute(saved_user, saved_job)

    assert package["job_title"] == "Full Stack Engineer"
    assert "Tailored Application" in package["tailored_resume_text"]
    assert "Stripe" in package["cover_letter_text"]
    assert len(package["expected_interview_questions"]) > 0

@pytest.mark.asyncio
async def test_application_kanban_tracking(db_session):
    app_repo = JobApplicationRepositoryImpl(db_session)
    app = JobApplication(
        user_id=1,
        job_id=10,
        status="applied",
        notes="Applied via website"
    )
    saved_app = await app_repo.create_or_update(app)

    assert saved_app.status == "applied"

    # Update status to interview
    saved_app.status = "interview"
    updated_app = await app_repo.create_or_update(saved_app)

    assert updated_app.status == "interview"
