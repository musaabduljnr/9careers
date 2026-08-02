from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from backend.app.domain.models import User, Resume, CoverLetter, InterviewSession, JobAnalysis

class AIProvider(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        """Generate text from prompt with an optional system instruction."""
        pass

    @abstractmethod
    async def generate_json(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        """Generate structured JSON response conforming to a schema or format instructions."""
        pass

    @abstractmethod
    async def chat_completion(self, messages: List[Dict[str, str]], system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        """Generate a chat response based on conversation history."""
        pass

    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for the given text."""
        pass

    @abstractmethod
    async def generate_text_stream(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7):
        """Stream generated text chunks asynchronously from prompt."""
        pass

    @abstractmethod
    def get_usage_metrics(self) -> Dict[str, Any]:
        """Get call count, token usage estimates, and latency stats for this provider."""
        pass


class DocumentParser(ABC):
    @abstractmethod
    def parse_pdf(self, file_bytes: bytes) -> str:
        """Extract text content from a PDF document."""
        pass

    @abstractmethod
    def parse_docx(self, file_bytes: bytes) -> str:
        """Extract text content from a DOCX document."""
        pass


class UserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def create(self, user: User) -> User:
        pass

    @abstractmethod
    async def update(self, user: User) -> User:
        pass


class ResumeRepository(ABC):
    @abstractmethod
    async def get_by_id(self, resume_id: int) -> Optional[Resume]:
        pass

    @abstractmethod
    async def get_latest_by_user(self, user_id: int) -> Optional[Resume]:
        pass

    @abstractmethod
    async def create(self, resume: Resume) -> Resume:
        pass

    @abstractmethod
    async def update(self, resume: Resume) -> Resume:
        pass


class CoverLetterRepository(ABC):
    @abstractmethod
    async def get_by_id(self, cover_letter_id: int) -> Optional[CoverLetter]:
        pass

    @abstractmethod
    async def get_by_user(self, user_id: int) -> List[CoverLetter]:
        pass

    @abstractmethod
    async def create(self, cover_letter: CoverLetter) -> CoverLetter:
        pass


class InterviewRepository(ABC):
    @abstractmethod
    async def get_session_by_id(self, session_id: str) -> Optional[InterviewSession]:
        pass

    @abstractmethod
    async def get_sessions_by_user(self, user_id: int) -> List[InterviewSession]:
        pass

    @abstractmethod
    async def create_session(self, session: InterviewSession) -> InterviewSession:
        pass

    @abstractmethod
    async def update_session(self, session: InterviewSession) -> InterviewSession:
        pass

    @abstractmethod
    async def add_question(self, session_id: str, question: Any) -> Any:
        pass

    @abstractmethod
    async def update_question(self, question: Any) -> Any:
        pass


class JobAnalysisRepository(ABC):
    @abstractmethod
    async def get_by_id(self, analysis_id: int) -> Optional[JobAnalysis]:
        pass

    @abstractmethod
    async def get_by_user(self, user_id: int) -> List[JobAnalysis]:
        pass

    @abstractmethod
    async def create(self, analysis: JobAnalysis) -> JobAnalysis:
        pass


class JobProvider(ABC):
    @abstractmethod
    async def fetch_jobs(self, limit: int = 50) -> List[Any]:
        """Fetch raw job postings from source and return normalized Job domain objects."""
        pass


class JobRepository(ABC):
    @abstractmethod
    async def get_by_id(self, job_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    async def list_jobs(self, filters: Dict[str, Any], limit: int = 50, offset: int = 0) -> List[Any]:
        pass

    @abstractmethod
    async def create(self, job: Any) -> Any:
        pass

    @abstractmethod
    async def update(self, job: Any) -> Any:
        pass


class CompanyRepository(ABC):
    @abstractmethod
    async def get_by_id(self, company_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    async def list_companies(self, limit: int = 50) -> List[Any]:
        pass

    @abstractmethod
    async def create(self, company: Any) -> Any:
        pass


class JobApplicationRepository(ABC):
    @abstractmethod
    async def get_user_applications(self, user_id: int) -> List[Any]:
        pass

    @abstractmethod
    async def create_or_update(self, application: Any) -> Any:
        pass
