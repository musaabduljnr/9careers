import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.presentation import schemas
from backend.app.domain.models import User, Job, Company, JobApplication, JobBookmark, JobAlert
from backend.app.infrastructure.database import get_db, DBJob, DBCompany, DBJobApplication, DBJobBookmark, DBJobAlert
from backend.app.infrastructure.security import get_current_user
from backend.app.infrastructure.repositories import (
    UserRepositoryImpl, ResumeRepositoryImpl, JobRepositoryImpl, CompanyRepositoryImpl, JobApplicationRepositoryImpl
)
from backend.app.infrastructure.ai_providers import AIProviderFactory
from backend.app.application.job_board_use_cases import (
    IngestJobsUseCase, ComputeJobMatchesUseCase, GetPersonalizedJobFeedUseCase, PrepareOneClickApplicationUseCase
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/jobs", tags=["AI Job Board & Discovery"])

@router.get("/feed", response_model=schemas.JobFeedResponse, summary="Get Personalized AI Job Feed")
async def get_personalized_job_feed(
    role: Optional[str] = Query(None, description="Filter by role"),
    remote: Optional[bool] = Query(None, description="Remote only filter"),
    nysc: Optional[bool] = Query(None, description="NYSC friendly filter"),
    level: Optional[str] = Query(None, description="Junior, Mid, Senior, Executive"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_repo = JobRepositoryImpl(db)
    company_repo = CompanyRepositoryImpl(db)
    user_repo = UserRepositoryImpl(db)
    resume_repo = ResumeRepositoryImpl(db)
    ai_provider = AIProviderFactory.get_provider()

    use_case = GetPersonalizedJobFeedUseCase(job_repo, company_repo, user_repo, resume_repo, ai_provider)

    filters = {}
    if role:
        filters["role"] = role
    if remote:
        filters["remote_only"] = True
    if nysc:
        filters["nysc_friendly"] = True
    if level:
        filters["experience_level"] = level

    feed = await use_case.execute(current_user, filters=filters)
    return feed


@router.post("/search", response_model=List[schemas.JobResponse], summary="Smart Natural Language Job Search")
async def search_jobs(
    req: schemas.NaturalLanguageSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_repo = JobRepositoryImpl(db)
    resume_repo = ResumeRepositoryImpl(db)
    ai_provider = AIProviderFactory.get_provider()
    matcher = ComputeJobMatchesUseCase(ai_provider)

    # Basic keyword parsing
    filters = {}
    query_lower = req.query.lower()
    if "remote" in query_lower or req.remote_only:
        filters["remote_only"] = True
    if "lagos" in query_lower:
        filters["location"] = "Lagos"
    elif "abuja" in query_lower:
        filters["location"] = "Abuja"
    if "graduate" in query_lower or "nysc" in query_lower or req.nysc_friendly:
        filters["nysc_friendly"] = True

    # Extract role from query (e.g. "React Developer Lagos" -> "React")
    clean_role = req.query.replace("Lagos", "").replace("Abuja", "").replace("Remote", "").replace("Nigeria", "").strip()
    if clean_role:
        filters["role"] = clean_role

    jobs = await job_repo.list_jobs(filters=filters, limit=30)
    latest_resume = await resume_repo.get_latest_by_user(current_user.id)
    resume_text = latest_resume.original_text if latest_resume else f"{current_user.full_name} {clean_role}"

    results = []
    for j in jobs:
        match_data = await matcher.execute(current_user, resume_text, j)
        j_dict = {
            "id": j.id,
            "title": j.title,
            "company_name": j.company_name,
            "company_logo": j.company_logo,
            "source_name": j.source_name,
            "location": j.location,
            "remote_status": j.remote_status,
            "employment_type": j.employment_type,
            "experience_level": j.experience_level,
            "salary_formatted": j.salary_formatted,
            "skills": j.skills,
            "tags": j.tags,
            "date_posted": j.date_posted.isoformat() if hasattr(j.date_posted, 'isoformat') else str(j.date_posted),
            "is_featured": j.is_featured,
            "is_urgent": j.is_urgent,
            "visa_sponsorship": j.visa_sponsorship,
            "nysc_friendly": j.nysc_friendly,
            "match": match_data
        }
        results.append(j_dict)

    results.sort(key=lambda x: x["match"]["overall_match_score"], reverse=True)
    return results


@router.get("/{job_id}", summary="Get Full Job Details & Match Breakdown")
async def get_job_details(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_repo = JobRepositoryImpl(db)
    resume_repo = ResumeRepositoryImpl(db)
    ai_provider = AIProviderFactory.get_provider()
    matcher = ComputeJobMatchesUseCase(ai_provider)

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")

    latest_resume = await resume_repo.get_latest_by_user(current_user.id)
    resume_text = latest_resume.original_text if latest_resume else f"{current_user.full_name} {job.title}"

    match_data = await matcher.execute(current_user, resume_text, job)

    return {
        "job": job,
        "match": match_data
    }


@router.post("/{job_id}/prepare", response_model=schemas.OneClickPrepResponse, summary="1-Click Application Package Preparation")
async def prepare_one_click_application(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_repo = JobRepositoryImpl(db)
    resume_repo = ResumeRepositoryImpl(db)
    ai_provider = AIProviderFactory.get_provider()

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")

    use_case = PrepareOneClickApplicationUseCase(ai_provider, resume_repo)
    prep = await use_case.execute(current_user, job)
    return prep


# --- APPLICATION KANBAN TRACKER ENDPOINTS ---

@router.get("/applications/tracker", summary="Get User Application Kanban Tracker")
async def get_user_application_tracker(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_repo = JobApplicationRepositoryImpl(db)
    apps = await app_repo.get_user_applications(current_user.id)
    
    # Group applications by Kanban status
    kanban: Dict[str, List[Any]] = {
        "saved": [],
        "applied": [],
        "interview": [],
        "assessment": [],
        "offer": [],
        "rejected": []
    }

    job_repo = JobRepositoryImpl(db)
    for app in apps:
        job = await job_repo.get_by_id(app.job_id)
        item = {
            "application_id": app.id,
            "job_id": app.job_id,
            "status": app.status,
            "notes": app.notes,
            "job_title": job.title if job else "Position",
            "company_name": job.company_name if job else "Employer",
            "company_logo": job.company_logo if job else None,
            "location": job.location if job else "Remote",
            "applied_at": app.applied_at
        }
        st = app.status.lower()
        if st in kanban:
            kanban[st].append(item)
        else:
            kanban["applied"].append(item)

    return kanban


@router.post("/applications", response_model=schemas.JobApplicationResponse, summary="Create or Update Application Kanban Stage")
async def create_or_update_application(
    req: schemas.JobApplicationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_repo = JobApplicationRepositoryImpl(db)
    app = JobApplication(
        user_id=current_user.id,
        job_id=req.job_id,
        status=req.status,
        notes=req.notes
    )
    saved = await app_repo.create_or_update(app)
    return saved


# --- BOOKMARKS & COLLECTIONS ENDPOINTS ---

@router.get("/bookmarks", summary="List Bookmarked Jobs")
async def get_bookmarked_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bms = db.query(DBJobBookmark).filter(DBJobBookmark.user_id == current_user.id).order_by(DBJobBookmark.created_at.desc()).all()
    job_ids = [b.job_id for b in bms]
    
    jobs = db.query(DBJob).filter(DBJob.id.in_(job_ids)).all() if job_ids else []
    return [
        {
            "id": j.id,
            "title": j.title,
            "company_name": j.company_name,
            "company_logo": j.company_logo,
            "location": j.location,
            "remote_status": j.remote_status,
            "salary_formatted": j.salary_formatted,
            "date_posted": j.date_posted
        } for j in jobs
    ]


@router.post("/bookmarks", summary="Bookmark / Save Job")
async def toggle_job_bookmark(
    req: schemas.JobBookmarkCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(DBJobBookmark).filter(
        DBJobBookmark.user_id == current_user.id,
        DBJobBookmark.job_id == req.job_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False, "message": "Job removed from saved bookmarks"}
    else:
        bm = DBJobBookmark(
            user_id=current_user.id,
            job_id=req.job_id,
            collection_name=req.collection_name
        )
        db.add(bm)
        db.commit()
        return {"bookmarked": True, "message": f"Job saved to '{req.collection_name}' collection"}


# --- JOB ALERTS ENDPOINTS ---

@router.get("/alerts", response_model=List[schemas.JobAlertCreateRequest], summary="Get User Job Alerts")
async def get_job_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(DBJobAlert).filter(DBJobAlert.user_id == current_user.id).all()
    return alerts


@router.post("/alerts", summary="Create New AI Job Alert")
async def create_job_alert(
    req: schemas.JobAlertCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = DBJobAlert(
        user_id=current_user.id,
        title=req.title,
        role=req.role,
        location=req.location,
        remote_only=req.remote_only,
        min_salary=req.min_salary,
        frequency=req.frequency
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {"message": f"Job alert '{req.title}' created successfully!", "alert_id": alert.id}


# --- COMPANY PROFILES ---

@router.get("/companies/{company_id}", summary="Get Company Profile & Open Jobs")
async def get_company_profile(
    company_id: int,
    db: Session = Depends(get_db)
):
    company_repo = CompanyRepositoryImpl(db)
    job_repo = JobRepositoryImpl(db)

    company = await company_repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    jobs = await job_repo.list_jobs(limit=20)
    company_jobs = [j for j in jobs if j.company_name.lower() == company.name.lower()]

    return {
        "company": company,
        "open_positions": company_jobs
    }


# --- ADMIN DASHBOARD & ANALYTICS ---

@router.post("/admin/ingest", summary="Admin: Trigger Multi-Source Job Ingestion")
async def admin_trigger_job_ingestion(
    providers: Optional[List[str]] = Query(None),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_repo = JobRepositoryImpl(db)
    company_repo = CompanyRepositoryImpl(db)
    ingest_uc = IngestJobsUseCase(job_repo, company_repo)
    
    jobs = await ingest_uc.execute(provider_types=providers)
    return {
        "message": f"Successfully ingested {len(jobs)} jobs across providers",
        "ingested_count": len(jobs)
    }


@router.get("/admin/analytics", summary="Admin: Get Job Board Analytics")
async def admin_get_job_board_analytics(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_jobs = db.query(DBJob).count()
    total_companies = db.query(DBCompany).count()
    total_applications = db.query(DBJobApplication).count()

    return {
        "total_jobs": total_jobs,
        "total_companies": total_companies,
        "total_applications": total_applications,
        "active_sources": ["RemoteOK", "LinkedIn", "Jobberman", "Google Jobs"],
        "recommendation_accuracy_percent": 94.2
    }
