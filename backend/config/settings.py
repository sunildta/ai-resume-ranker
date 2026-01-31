"""
Application settings and configuration management.
Uses Pydantic for validation and environment variable loading.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    gemini_api_key: str
    
    # Firebase Configuration
    firebase_credentials_path: str = "firebase_key.json"
    
    # Security
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    secret_key: str = "change-this-in-production"
    
    # File Upload Settings
    upload_dir: str = "uploads"
    max_file_size_mb: int = 10
    allowed_extensions: List[str] = [".pdf", ".docx", ".doc", ".txt"]
    
    # Application Settings
    debug: bool = False
    environment: str = "development"
    
    # Database
    use_firestore: bool = True
    
    def get_cors_origins_list(self) -> List[str]:
        """Parse cors_origins string into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore VITE_* variables for frontend


# Global settings instance
settings = Settings()


# Helper functions
def get_max_file_size_bytes() -> int:
    """Get max file size in bytes."""
    return settings.max_file_size_mb * 1024 * 1024


def is_allowed_file_extension(filename: str) -> bool:
    """Check if file extension is allowed."""
    _, ext = os.path.splitext(filename.lower())
    return ext in settings.allowed_extensions
