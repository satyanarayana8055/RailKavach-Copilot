import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "RailKavach AI Copilot API"
    APP_VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Port & Host
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Google Cloud Storage (GCS)
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "railkavach-evidence-vault")
    GCS_PROJECT_ID: str = os.getenv("GCS_PROJECT_ID", "railkavach-production")
    LOCAL_STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "storage"))
    
    # PostgreSQL / Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./railkavach.db")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8501", # Streamlit fallback
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
