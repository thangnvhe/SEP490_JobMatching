from typing import Optional, Dict, Any, List
import json
from google import genai
from config.config import Config


class GeminiClient:
    """Utility class for Google Gemini API interactions with fallback support"""
    
    def __init__(self):
        self.client = genai.Client(api_key=Config.GOOGLE_API_KEY)
        self.primary_model = Config.GEMINI_MODEL
        self.fallback_models = Config.GEMINI_FALLBACK_MODELS.copy()
        self.current_model = self.primary_model
        self.failed_models = set()
    
    def _get_next_available_model(self) -> Optional[str]:
        """Get next available model that hasn't failed"""
        available_models = [m for m in self.fallback_models if m not in self.failed_models]
        return available_models[0] if available_models else None
    
    def generate_content(self, prompt: str, retry_on_quota_error: bool = True) -> str:
        """Generate content using Gemini API with automatic fallback"""
        models_to_try = [self.current_model] + [m for m in self.fallback_models if m != self.current_model]
        
        last_error = None
        
        for model in models_to_try:
            if model in self.failed_models:
                continue
                
            try:
                print(f"🤖 Trying model: {model}")
                result = self.client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                
                # Success! Update current model
                self.current_model = model
                print(f"✅ Success with model: {model}")
                return result.text
                
            except Exception as e:
                error_str = str(e)
                print(f"❌ Model {model} failed: {error_str[:100]}...")
                
                # Check if it's a quota error
                if "RESOURCE_EXHAUSTED" in error_str or "429" in error_str:
                    print(f"⚠️ Quota exhausted for {model}, trying next model...")
                    self.failed_models.add(model)
                    last_error = f"Quota exhausted: {error_str}"
                    continue
                elif "NOT_FOUND" in error_str or "404" in error_str:
                    print(f"⚠️ Model {model} not available, trying next model...")
                    self.failed_models.add(model)
                    last_error = f"Model not found: {error_str}"
                    continue
                else:
                    # Other errors, might be temporary
                    last_error = error_str
                    
        # All models failed
        error_msg = f"All Gemini models failed. Last error: {last_error}"
        print(f"💥 {error_msg}")
        
        # Check if mock mode is enabled
        if Config.MOCK_MODE:
            return self._get_mock_response(prompt)
        
        if Config.DEBUG_MODE:
            return f"AI ERROR: {error_msg}"
        else:
            return "AI service temporarily unavailable. Please try again later."
    
    def _get_mock_response(self, prompt: str) -> str:
        """Generate mock response for testing when all models are down"""
        prompt_lower = prompt.lower()
        
        # CV Validation mock responses
        if "có phải cv" in prompt_lower or "curriculum vitae" in prompt_lower or "validate" in prompt_lower:
            if any(keyword in prompt_lower for keyword in ["john smith", "software engineer", "experience", "education", "skills"]):
                return "YES - This document contains personal information, work experience, education details, and skills section which are typical components of a CV/Resume."
            else:
                return "NO - This document does not appear to contain the standard components of a CV such as personal information, work experience, or education history."
        
        # CV Information extraction mock
        elif "trích xuất thông tin" in prompt_lower or "extract" in prompt_lower and "json" in prompt_lower:
            return '''
            {
                "name": "John Smith",
                "email": "john.smith@example.com",
                "phone": "+1234567890",
                "experience_years": "3",
                "education": "Bachelor of Computer Science",
                "skills": ["Python", "JavaScript", "React", "Docker"],
                "positions": ["Software Engineer", "Backend Developer"],
                "summary": "Experienced software engineer with 3 years in web development"
            }
            '''
        
        # Job matching mock
        elif "match score" in prompt_lower or "phù hợp" in prompt_lower:
            return '''
            {
                "match_score": 85,
                "matching_skills": ["Python", "JavaScript", "React"],
                "missing_skills": ["AWS", "Kubernetes"],
                "experience_match": true,
                "education_match": true,
                "overall_assessment": "Good match with most required skills",
                "recommendations": ["Learn cloud technologies", "Gain DevOps experience"]
            }
            '''
        
        # Default response
        else:
            return "Mock AI response: Service is in testing mode. All Gemini models are currently unavailable due to quota limits."
    
    def generate_json_content(self, prompt: str) -> Dict[Any, Any]:
        """Generate JSON content using Gemini API with fallback support"""
        try:
            response = self.generate_content(prompt)
            
            # Try to extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            else:
                # If no JSON found, return the response as text
                return {"raw_response": response}
                
        except json.JSONDecodeError as e:
            if Config.DEBUG_MODE:
                print(f"JSON Parse Error: {e}")
            return {"error": "Invalid JSON response", "raw_response": response}
        except Exception as e:
            if Config.DEBUG_MODE:
                print(f"Gemini JSON API Error: {e}")
            return {"error": str(e)}
    
    def check_connection(self) -> bool:
        """Check if Gemini API is accessible by testing with available models"""
        try:
            # Try a simple test with each model
            test_prompt = "Reply with just 'OK'"
            
            for model in self.fallback_models:
                if model in self.failed_models:
                    continue
                    
                try:
                    result = self.client.models.generate_content(
                        model=model,
                        contents=test_prompt
                    )
                    if result.text and len(result.text.strip()) > 0:
                        self.current_model = model
                        return True
                except:
                    self.failed_models.add(model)
                    continue
            
            # If all models failed, check if API key is at least set
            from config.config import Config
            return Config.GOOGLE_API_KEY and Config.GOOGLE_API_KEY != "YOUR_API_KEY_HERE"
        except:
            return False
    
    def get_status_info(self) -> Dict[str, Any]:
        """Get detailed status information about model availability"""
        return {
            "current_model": self.current_model,
            "available_models": [m for m in self.fallback_models if m not in self.failed_models],
            "failed_models": list(self.failed_models),
            "total_models": len(self.fallback_models)
        }
    
    @staticmethod
    def parse_yes_no_response(response: str) -> tuple[bool, str]:
        """Parse YES/NO response from Gemini"""
        response_lower = response.lower().strip()
        
        if response_lower.startswith('yes'):
            return True, response
        elif response_lower.startswith('no'):
            return False, response
        else:
            # Try to detect yes/no in the response
            if 'yes' in response_lower and 'no' not in response_lower:
                return True, response
            elif 'no' in response_lower and 'yes' not in response_lower:
                return False, response
            else:
                # Default to False if unclear
                return False, f"Unclear response: {response}"


# Singleton instance
_gemini_client: Optional[GeminiClient] = None

def get_gemini_client() -> GeminiClient:
    """Get singleton Gemini client instance"""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client