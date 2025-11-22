"""
AI Service for Job Matching System
Provides CV validation, information extraction, and job matching capabilities
"""

import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.config import Config
from services.cv_service import CVService
from models.schemas import (
    CVValidationResponse, 
    CVExtractionResponse, 
    JobMatchRequest, 
    JobMatchResponse, 
    ErrorResponse, 
    HealthResponse
)
from utils.gemini_client import get_gemini_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("Starting AI Service...")
    
    # Validate configuration
    if not Config.validate_config():
        print("WARNING: Configuration validation failed!")
    
    # Test Gemini connection (optional - skip if quota exceeded)
    try:
        print("ℹ️ Skipping Gemini connection test to avoid quota usage")
        print("✅ AI Service ready (Gemini will be tested on first API call)")
    except Exception as e:
        print(f"⚠️ Gemini AI setup error: {e}")
    
    print("AI Service startup complete")
    
    yield  # App runs here
    
    # Shutdown
    print("Shutting down AI Service...")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Job Matching AI Service",
    description="AI-powered CV validation and job matching service",
    version="1.0.0",
    docs_url="/docs" if Config.DEBUG_MODE else None,
    redoc_url="/redoc" if Config.DEBUG_MODE else None,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
cv_service = CVService()


@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        services={
            "gemini_ai": "connected" if get_gemini_client().check_connection() else "disconnected",
            "pdf_processor": "available"
        },
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    gemini_client = get_gemini_client()
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        services={
            "gemini_ai": "connected" if gemini_client.check_connection() else "disconnected",
            "pdf_processor": "available",
            "current_model": gemini_client.current_model,
            "available_models": len([m for m in gemini_client.fallback_models if m not in gemini_client.failed_models]),
            "total_models": len(gemini_client.fallback_models)
        },
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/model-status")
async def get_model_status():
    """Get detailed model status information"""
    if not Config.DEBUG_MODE:
        raise HTTPException(status_code=404, detail="Endpoint not available in production")
    
    gemini_client = get_gemini_client()
    return {
        "model_status": gemini_client.get_status_info(),
        "config": Config.get_settings_info()
    }


@app.get("/config")
async def get_config():
    """Get current configuration info (for debugging)"""
    if not Config.DEBUG_MODE:
        raise HTTPException(status_code=404, detail="Endpoint not available in production")
    
    return Config.get_settings_info()


@app.post("/validate_cv", response_model=CVValidationResponse)
async def validate_cv(file: UploadFile = File(...)):
    """
    Validate if uploaded file is a CV
    
    - **file**: PDF file to validate
    - Returns: CV validation result with confidence score
    """
    try:
        if not file.filename.lower().endswith('.pdf'):
            return CVValidationResponse(
                is_cv=False,
                confidence=0.0,
                reason="Only PDF files are supported",
                file_info={"filename": file.filename, "error": "Invalid file type"}
            )
        
        result = await cv_service.validate_cv_file(file)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating CV: {str(e)}")


@app.post("/extract_cv_info", response_model=CVExtractionResponse)
async def extract_cv_info(file: UploadFile = File(...)):
    """
    Extract key information from CV
    
    - **file**: PDF CV file
    - Returns: Extracted CV information (name, email, skills, etc.)
    """
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        result = await cv_service.extract_cv_information(file)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting CV info: {str(e)}")


@app.post("/match_cv_job", response_model=JobMatchResponse)
async def match_cv_job(request: JobMatchRequest):
    """
    Match CV text with job description
    
    - **cv_text**: CV content as text
    - **job_description**: Job description text
    - Returns: Match score and analysis
    """
    try:
        result = cv_service.match_cv_with_job(
            cv_text=request.cv_text,
            job_description=request.job_description
        )
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching CV with job: {str(e)}")


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    if Config.DEBUG_MODE:
        print(f"Global error: {exc}")
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            error_code="INTERNAL_ERROR",
            details={"message": str(exc)} if Config.DEBUG_MODE else None
        ).dict()
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "ai_service:app",
        host="0.0.0.0",
        port=8000,
        reload=Config.DEBUG_MODE,
        log_level="debug" if Config.DEBUG_MODE else "info"
    )
