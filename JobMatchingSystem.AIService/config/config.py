import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration management for AI Service"""
    
    # Google Gemini API
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY", "YOUR_API_KEY_HERE")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "models/gemini-2.0-flash-lite")
    
    # Fallback models for quota exhaustion (in priority order)
    GEMINI_FALLBACK_MODELS: list = [
        "models/gemini-2.5-flash",              # Latest stable Flash
        "models/gemini-2.5-pro",                # Latest stable Pro
        "models/gemini-2.0-flash",              # Stable 2.0 Flash
        "models/gemini-2.0-flash-001",          # Specific stable version
        "models/gemini-2.0-flash",         # Lite version
        "models/gemini-2.0-flash-lite-001",     # Specific lite version
        "models/gemini-2.5-pro-preview-06-05",  # Latest preview
        "models/gemini-2.5-pro-preview-05-06",  # Older preview
        "models/gemini-2.0-flash-exp",          # Experimental
        "models/gemini-2.0-pro-exp",            # Pro experimental
        "models/gemini-exp-1206",               # Latest experimental
    ]
    
    # PDF Processing
    PDF_MAX_SIZE_MB: int = int(os.getenv("PDF_MAX_SIZE_MB", "10"))  # 10MB default
    PDF_MIN_TEXT_LENGTH: int = int(os.getenv("PDF_MIN_TEXT_LENGTH", "50"))
    PDF_MAX_TEXT_LENGTH: int = int(os.getenv("PDF_MAX_TEXT_LENGTH", "3000"))  # For prompt
    
    # FastAPI Settings
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "False").lower() == "true"
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "False").lower() == "true"
    
    # CV Validation Settings
    CV_CONFIDENCE_THRESHOLD: float = float(os.getenv("CV_CONFIDENCE_THRESHOLD", "0.7"))
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate required configuration"""
        if cls.GOOGLE_API_KEY == "YOUR_API_KEY_HERE":
            print("WARNING: GOOGLE_API_KEY not set. Please set environment variable.")
            return False
        return True
    
    @classmethod
    def get_settings_info(cls) -> dict:
        """Get current configuration info (for debugging)"""
        return {
            "gemini_model": cls.GEMINI_MODEL,
            "pdf_max_size_mb": cls.PDF_MAX_SIZE_MB,
            "pdf_min_text_length": cls.PDF_MIN_TEXT_LENGTH,
            "cv_confidence_threshold": cls.CV_CONFIDENCE_THRESHOLD,
            "debug_mode": cls.DEBUG_MODE,
            "mock_mode": cls.MOCK_MODE,
            "api_key_set": cls.GOOGLE_API_KEY != "YOUR_API_KEY_HERE"
        }