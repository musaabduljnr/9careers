import pytest
import asyncio
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.infrastructure.database import Base
from backend.app.domain.interfaces import AIProvider

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine) -> Generator[Session, None, None]:
    connection = db_engine.connect()
    transaction = connection.begin()
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = SessionLocal()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


class MockAIProvider(AIProvider):
    async def generate_text(self, prompt: str, system_instruction: str = None, temperature: float = 0.7) -> str:
        return "Mocked AI Response"

    async def generate_json(self, prompt: str, schema: str, system_instruction: str = None, temperature: float = 0.2) -> dict:
        # Cover Letter Generator Mock
        if "cover_letter_content" in str(schema) or "cover_letter_content" in str(prompt):
            return {
                "cover_letter_content": "Dear Hiring Manager,\n\nI am writing to express my interest in the position. Here is my mocked cover letter."
            }

        # Semantic Match Engine Mock
        if "likelihood_of_interview" in str(schema) or "likelihood_of_interview" in str(prompt):
            return {
                "likelihood_of_interview": "High",
                "skills_match_explanation": "Great overlap in React and Node.",
                "experience_match_explanation": "Experience maps well to backend development.",
                "education_match_explanation": "Matches B.Sc. requirement.",
                "missing_skills": ["Docker", "Kubernetes"],
                "recommendations": ["Add Docker experience", "Tailor achievements"]
            }

        # Job Description Parser Mock
        if "nysc_required" in str(schema) and "company" in str(schema):
            return {
                "company": "Access Bank",
                "job_title": "Graduate Trainee",
                "location": "Lagos, Nigeria",
                "experience": "0-2 years",
                "required_skills": ["Python", "SQL"],
                "preferred_skills": ["PowerBI"],
                "responsibilities": ["Analyze datasets", "Report findings"],
                "education": "B.Sc. in Computer Science or similar",
                "salary": "₦150,000 - ₦250,005 / month",
                "benefits": ["Pension", "Health insurance"],
                "keywords": ["Data", "Analysis"],
                "nysc_required": True
            }

        # Default Resume Analyzer Mock
        return {
            "ats_score": 85,
            "score_breakdown": {
                "grammar": 90,
                "formatting": 80,
                "keyword": 85,
                "impact": 75,
                "skills": 95
            },
            "detailed_analysis": {
                "readability": "Excellent",
                "achievements": ["Automated grading system saving 10 hours per week"],
                "action_verbs": ["Taught", "Automated"],
                "weak_bullet_points": [
                    {"original": "Taught coding", "issue": "Lacks impact", "suggested_rewrite": "Delivered coding bootcamp to 50 students"}
                ],
                "missing_keywords": ["React", "FastAPI"],
                "missing_skills": ["React", "FastAPI"],
                "red_flags": ["No portfolio link provided"],
                "recommendations": ["Add detailed metrics for PPA projects", "Highlight ICAN or other certs"]
            },
            "parsed_profile": {
                "name": "Musa Abubakar",
                "email": "musa@example.com",
                "phone": "08012345678",
                "nysc_mentioned": True,
                "education": [
                    {"school": "University of Ibadan", "degree": "B.Sc. Computer Science", "grade": "First Class", "graduation_year": "2024"}
                ],
                "experience": [
                    {"company": "Local Tech PPA", "role": "IT Teacher / Assistant", "duration": "1 year", "achievements": ["Taught coding to students", "Automated grading system"]}
                ],
                "skills": ["Python", "SQL", "HTML"]
            },
            "nysc_recommendation": "Mention your teaching PPA as a Project Management and Leadership role.",
            
            # Additional response fields for evaluations
            "score": 80,
            "overall_score": 80,
            "scores_detail": {
                "communication": 80, "technical_accuracy": 85, "problem_solving": 80,
                "leadership": 75, "confidence": 80, "star_method": 80,
                "clarity": 85, "depth": 80, "relevance": 85, "professionalism": 85
            },
            "feedback": "Great STAR format application.",
            "next_question": "Explain a time when you resolved a conflict within a team.",
            "report": "Final evaluation report content.",
            "candidate_summary": "Mock candidate summary.",
            "key_strengths": ["Technical skill", "Communication"],
            "perceived_weaknesses": ["Metrics"],
            "likely_questions": ["Tell me about yourself"],
            "interview_strategy": "Focus on STAR responses",
            "focus_areas": ["System Design"]
        }

    async def chat_completion(self, messages: list, system_instruction: str = None, temperature: float = 0.7) -> str:
        return "Mocked next question from chat."

    async def generate_embedding(self, text: str) -> list[float]:
        vector = [0.0] * 768
        for char in text:
            vector[ord(char) % 768] += 1.0
        magnitude = sum([v**2 for v in vector])**0.5
        if magnitude > 0:
            vector = [v / magnitude for v in vector]
        return vector

    async def generate_text_stream(self, prompt: str, system_instruction: str = None, temperature: float = 0.7):
        yield "Mock stream chunk"

    def get_usage_metrics(self) -> dict:
        return {"provider": "MockAI", "total_calls": 1}

@pytest.fixture
def mock_ai_provider() -> AIProvider:
    return MockAIProvider()
