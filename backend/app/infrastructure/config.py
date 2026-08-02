import os
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

class Settings:
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./career_assistant.db")
    
    # AI Provider Settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini").lower()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    
    # Vertex AI Settings
    VERTEX_PROJECT_ID: str = os.getenv("VERTEX_PROJECT_ID", "")
    VERTEX_LOCATION: str = os.getenv("VERTEX_LOCATION", "us-central1")
    
    # Security Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-for-nigerian-career-assistant")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # CORS Settings
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

settings = Settings()
