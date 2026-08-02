"""
Enterprise FastAPI Application Entrypoint
===========================================
Integrates OpenAPI/Swagger documentation, GZip compression, CORS,
rate limiting, request correlation middleware, structured logging,
and global exception handling.
"""

import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from backend.app.presentation.api_v1 import router as api_v1_router
from backend.app.infrastructure.database import init_db
from backend.app.infrastructure.config import settings
from backend.app.infrastructure.logging_config import setup_logging
from backend.app.infrastructure.middleware import (
    RequestCorrelationMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware
)

# Initialize Structured Logging System
setup_logging(log_level="INFO")
logger = logging.getLogger("backend.app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and graceful shutdown."""
    logger.info("Starting Enterprise AI Career Assistant Backend Server...")
    try:
        init_db()
        logger.info("Database schema initialized & verified.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}", exc_info=True)

    yield

    logger.info("Shutting down backend server gracefully...")


# OpenAPI Tags Metadata for Interactive Swagger Documentation
tags_metadata = [
    {
        "name": "Authentication",
        "description": "User registration, OAuth2 JWT login, and token validation.",
    },
    {
        "name": "Resumes & ATS Scorer",
        "description": "Upload PDF/DOCX resumes, compute 0-100 ATS scores, detect NYSC details, and tailor bullet points.",
    },
    {
        "name": "Cover Letters",
        "description": "Generate bespoke, 1-page ATS-friendly cover letters strictly bound to resume facts.",
    },
    {
        "name": "Job Analysis & Parser",
        "description": "Parse job posting URLs or raw text to extract required skills, qualifications, and keywords.",
    },
    {
        "name": "Job Match Engine",
        "description": "Perform semantic vector embeddings match between candidate resume and job descriptions.",
    },
    {
        "name": "Interview Simulator",
        "description": "Simulate real-time AI mock interviews with chat sessions, STAR answers, and evaluation reports.",
    },
    {
        "name": "Interview Questions",
        "description": "Generate 5 question types (Technical, Behavioral, HR, Situational, STAR) with model answers & rubrics.",
    },
    {
        "name": "Nigeria Career Insights",
        "description": "Explore demand trends, salary estimates, certifications, and visa pathways across 7 Nigerian industries.",
    },
    {
        "name": "Enterprise Admin Dashboard",
        "description": "AI provider switching (Gemini, Groq, OpenRouter, Vertex), fallback order, feature flags, system prompts, API keys, and audit logs.",
    },
]

app = FastAPI(
    title="Naija Career AI — Enterprise Backend API",
    description=(
        "**Enterprise AI Career Assistant & Resume Builder API** tailored for Nigerian job seekers and international relocation.\n\n"
        "### Key Features:\n"
        "- **ATS Scorer & Analyzer**: Parse PDF/DOCX resumes and rate ATS compatibility.\n"
        "- **Cover Letter Generator**: Fact-checked bespoke cover letter creation.\n"
        "- **Interview Question Bank**: 5 question types with model answers & 1-5 rubrics.\n"
        "- **Career Insights**: 7 key Nigerian industries (Fintech, O&G, Banking, Telecom, Govt, Healthcare, Remote Tech).\n"
        "- **Multi-Provider AI Fallback**: Resilient failover across Gemini, Groq, OpenRouter, and Vertex AI.\n"
    ),
    version="2.5.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    contact={
        "name": "Naija Career AI Engineering Team",
        "email": "engineering@naijacareer.ai",
    },
    license_info={
        "name": "Proprietary / Enterprise License",
    }
)

# CORS Configuration
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
if "*" in origins or not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if "*" not in origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production Compression & Middleware Chain
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestCorrelationMiddleware)
app.add_middleware(RateLimitMiddleware)


# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on '{request.url.path}': {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please try again.",
            "details": str(exc) if "sqlite" in settings.DATABASE_URL else None,
            "retry_recommended": True
        }
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "BadRequest",
            "message": str(exc),
            "retry_recommended": False
        }
    )


from backend.app.presentation.api_v1 import router as api_v1_router
from backend.app.presentation.admin_api import router as admin_api_router
from backend.app.presentation.ws_interview import router as ws_router
from backend.app.presentation.job_board_api import router as job_board_router
from backend.app.presentation.config_api import router as config_api_router

# Include Routers
app.include_router(api_v1_router)
app.include_router(admin_api_router)
app.include_router(ws_router)
app.include_router(job_board_router)
app.include_router(config_api_router)


@app.get("/health", tags=["System Operations"], summary="Health Check")
def health_check():
    """Verify backend server health, database connectivity, and uptime status."""
    return {
        "status": "healthy",
        "service": "Naija Career AI Backend",
        "version": "2.5.0",
        "timestamp": time.time()
    }
