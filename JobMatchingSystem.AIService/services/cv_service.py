from typing import Tuple
from fastapi import UploadFile
from models.schemas import CVValidationResponse, CVExtractionResponse, JobMatchResponse, ErrorResponse
from utils.pdf_processor import PDFProcessor
from utils.gemini_client import get_gemini_client, GeminiClient
from prompts.cv_validation import CVValidationPrompts
from config.config import Config


class CVService:
    """Service class for CV-related operations"""
    
    def __init__(self):
        self.gemini_client = get_gemini_client()
        self.pdf_processor = PDFProcessor()
    
    async def validate_cv_file(self, file: UploadFile) -> CVValidationResponse:
        """Validate if uploaded file is a CV"""
        try:
            # Read file content
            content = await file.read()
            
            # Validate PDF file
            is_valid, error_msg = self.pdf_processor.validate_pdf_file(content, file.filename)
            if not is_valid:
                return CVValidationResponse(
                    is_cv=False,
                    confidence=0.0,
                    reason=error_msg,
                    file_info={"filename": file.filename, "error": error_msg}
                )
            
            # Extract text from PDF
            text = self.pdf_processor.extract_text_from_bytes(content)
            
            if len(text) < Config.PDF_MIN_TEXT_LENGTH:
                return CVValidationResponse(
                    is_cv=False,
                    confidence=0.0,
                    reason=f"File contains insufficient text content (minimum {Config.PDF_MIN_TEXT_LENGTH} characters required)",
                    file_info=self.pdf_processor.get_pdf_info(content, file.filename)
                )
            
            # Generate prompt and get AI response
            prompt = CVValidationPrompts.validate_cv_content(text, Config.PDF_MAX_TEXT_LENGTH)
            ai_response = self.gemini_client.generate_content(prompt)
            
            # Parse AI response
            is_cv, reason = GeminiClient.parse_yes_no_response(ai_response)
            
            # Calculate confidence based on response clarity
            confidence = self._calculate_confidence(ai_response, is_cv)
            
            return CVValidationResponse(
                is_cv=is_cv,
                confidence=confidence,
                reason=reason,
                file_info=self.pdf_processor.get_pdf_info(content, file.filename)
            )
            
        except Exception as e:
            return CVValidationResponse(
                is_cv=False,
                confidence=0.0,
                reason=f"Error processing file: {str(e)}",
                file_info={"filename": file.filename, "error": str(e)}
            )
    
    async def extract_cv_information(self, file: UploadFile) -> CVExtractionResponse:
        """Extract key information from CV"""
        try:
            # Read and validate file
            content = await file.read()
            is_valid, error_msg = self.pdf_processor.validate_pdf_file(content, file.filename)
            if not is_valid:
                raise ValueError(error_msg)
            
            # Extract text
            text = self.pdf_processor.extract_text_from_bytes(content)
            
            # Generate prompt and get AI response
            prompt = CVValidationPrompts.extract_cv_info(text)
            ai_response = self.gemini_client.generate_json_content(prompt)
            
            # Convert to response model
            return CVExtractionResponse(**ai_response)
            
        except Exception as e:
            # Return empty response with error in summary
            return CVExtractionResponse(summary=f"Error extracting CV info: {str(e)}")
    
    def match_cv_with_job(self, cv_text: str, job_description: str) -> JobMatchResponse:
        """Match CV with job description"""
        try:
            prompt = CVValidationPrompts.match_cv_with_job(cv_text, job_description)
            ai_response = self.gemini_client.generate_json_content(prompt)
            
            # Set defaults for missing fields
            response_data = {
                "match_score": ai_response.get("match_score", 0),
                "matching_skills": ai_response.get("matching_skills", []),
                "missing_skills": ai_response.get("missing_skills", []),
                "experience_match": ai_response.get("experience_match", False),
                "education_match": ai_response.get("education_match", False),
                "overall_assessment": ai_response.get("overall_assessment", "Unable to assess"),
                "recommendations": ai_response.get("recommendations", [])
            }
            
            return JobMatchResponse(**response_data)
            
        except Exception as e:
            return JobMatchResponse(
                match_score=0,
                overall_assessment=f"Error matching CV with job: {str(e)}"
            )
    
    def _calculate_confidence(self, ai_response: str, is_cv: bool) -> float:
        """Calculate confidence score based on AI response with improved scoring"""
        response_lower = ai_response.lower()
        
        # Positive indicators for CV detection
        cv_positive_words = [
            "tên", "họ và tên", "email", "điện thoại", "address", "phone", 
            "kinh nghiệm", "experience", "học vấn", "education", "kỹ năng", "skills",
            "dự án", "project", "chứng chỉ", "certificate", "thành tích", "achievement",
            "mục tiêu", "objective", "summary", "cv", "resume", "curriculum vitae"
        ]
        
        # High confidence indicators
        high_confidence_words = ["clearly", "definitely", "obviously", "certainly", "undoubtedly", "rõ ràng", "chắc chắn"]
        medium_confidence_words = ["likely", "appears", "seems", "probably", "có thể", "dường như"]
        low_confidence_words = ["unclear", "ambiguous", "difficult", "uncertain", "không chắc", "khó xác định"]
        
        # Count CV-related elements mentioned
        cv_elements_found = sum(1 for word in cv_positive_words if word in response_lower)
        
        # Base confidence calculation
        if is_cv:
            # For positive CV detection, start with higher confidence
            confidence = 0.75  # More generous base confidence
            
            # Boost confidence based on CV elements mentioned
            if cv_elements_found >= 3:
                confidence = min(confidence + 0.15, 0.95)
            elif cv_elements_found >= 1:
                confidence = min(confidence + 0.10, 0.90)
            
        else:
            # For negative detection, be more conservative
            confidence = 0.60
        
        # Adjust based on certainty words
        if any(word in response_lower for word in high_confidence_words):
            confidence = min(confidence + 0.10, 0.95)
        elif any(word in response_lower for word in medium_confidence_words):
            confidence = min(confidence + 0.05, 0.85)
        elif any(word in response_lower for word in low_confidence_words):
            confidence = max(confidence - 0.15, 0.30)
        
        # If response starts clearly with YES/NO, increase confidence
        if ai_response.strip().lower().startswith(('yes -', 'no -')):
            confidence = min(confidence + 0.05, 0.95)
        
        # Ensure minimum confidence for valid CVs
        if is_cv and confidence < 0.70:
            confidence = 0.70
        
        return confidence