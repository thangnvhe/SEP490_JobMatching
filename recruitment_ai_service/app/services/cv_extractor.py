import google.generativeai as genai
from PIL import Image
import PyPDF2
import io
from typing import Dict, Any
import json
import logging
from app.core.config import settings
from app.api.schemas import ExtractedCV

# Cấu hình logger để ghi log lỗi và trạng thái trong quá trình xử lý CV
logger = logging.getLogger(__name__)

# =========================================================
# Lớp CVExtractor: Xử lý trích xuất thông tin từ CV (PDF, Image, Text)
# =========================================================
class CVExtractor:
    """Dịch vụ xử lý trích xuất dữ liệu từ file CV/Resume (PDF hoặc hình ảnh) bằng Gemini AI"""

    def __init__(self):
        """Khởi tạo model Gemini và cấu hình API key"""
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')
        
    # =========================================================
    # Hàm 1: Trích xuất text từ file PDF
    # =========================================================
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """
        Trích xuất toàn bộ nội dung văn bản từ file PDF.

        Args:
            file_content (bytes): Dữ liệu nhị phân của file PDF.

        Returns:
            str: Văn bản được trích xuất từ PDF.

        Raises:
            ValueError: Khi có lỗi trong quá trình đọc hoặc phân tích file PDF.
        """
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting PDF: {str(e)}")
            raise ValueError(f"Cannot extract text from PDF: {str(e)}")
    
    # =========================================================
    # Hàm 2: Trích xuất text từ hình ảnh CV
    # =========================================================
    def extract_text_from_image(self, file_content: bytes) -> str:
        """
        Trích xuất văn bản từ hình ảnh CV bằng Gemini Vision.

        Args:
            file_content (bytes): Dữ liệu hình ảnh của file (png, jpg, jpeg...).

        Returns:
            str: Văn bản được trích xuất từ hình ảnh.

        Raises:
            ValueError: Khi có lỗi trong quá trình phân tích hình ảnh.
        """
        try:
            image = Image.open(io.BytesIO(file_content))
            
            prompt = """
            Extract all text from this CV/Resume image. 
            Return the text as accurately as possible, maintaining the structure and formatting.
            """
            
            response = self.model.generate_content([prompt, image])
            return response.text
        except Exception as e:
            logger.error(f"Error extracting from image: {str(e)}")
            raise ValueError(f"Cannot extract text from image: {str(e)}")
    
    # =========================================================
    # Hàm 3: Phân tích text CV và chuyển thành dữ liệu có cấu trúc
    # =========================================================
    def extract_structured_data(self, raw_text: str) -> ExtractedCV:
        """
        Dùng Gemini để phân tích text CV và trích xuất dữ liệu có cấu trúc dạng JSON.

        Args:
            raw_text (str): Toàn bộ nội dung text của CV (đã được trích từ PDF hoặc ảnh).

        Returns:
            ExtractedCV: Đối tượng chứa dữ liệu CV có cấu trúc (theo schema chuẩn).

        Raises:
            ValueError: Khi Gemini trả về JSON không hợp lệ hoặc lỗi xử lý khác.
        """
        try:
            # Prompt hướng dẫn Gemini phân tích CV và chỉ trả về JSON thuần
            prompt = f"""
            Analyze this CV/Resume text and extract structured information in JSON format.
            
            CV Text:
            {raw_text}
            
            Please extract the following information and return ONLY a valid JSON object:
            {{
                "personal_info": {{
                    "full_name": "string or null",
                    "email": "string or null", 
                    "phone": "string or null",
                    "address": "string or null",
                    "linkedin": "string or null",
                    "github": "string or null"
                }},
                "education": [
                    {{
                        "institution": "string or null",
                        "degree": "string or null", 
                        "field_of_study": "string or null",
                        "start_date": "string or null",
                        "end_date": "string or null",
                        "gpa": "string or null"
                    }}
                ],
                "experiences": [
                    {{
                        "company": "string or null",
                        "position": "string or null",
                        "start_date": "string or null", 
                        "end_date": "string or null",
                        "description": "string or null",
                        "achievements": ["list of achievements"]
                    }}
                ],
                "projects": [
                    {{
                        "name": "string or null",
                        "description": "string or null",
                        "role": "string or null", 
                        "technologies": ["list of technologies"],
                        "start_date": "string or null",
                        "end_date": "string or null"
                    }}
                ],
                "skills": ["list of technical skills"],
                "certifications": ["list of certifications"],
                "languages": ["list of languages"]
            }}
            
            Important: Return ONLY the JSON object, no additional text or formatting.
            """
            
            # Gửi prompt đến Gemini
            response = self.model.generate_content(prompt)
            json_text = response.text.strip()
            
            # Loại bỏ ký hiệu markdown nếu có (ví dụ: ```json ... ```)
            if json_text.startswith("```json"):
                json_text = json_text.replace("```json", "").replace("```", "").strip()
            
            # Chuyển đổi chuỗi JSON thành Python dict
            data = json.loads(json_text)
            
            # Tạo đối tượng ExtractedCV từ dữ liệu JSON
            extracted_cv = ExtractedCV(
                personal_info=data.get("personal_info", {}),
                education=data.get("education", []),
                experiences=data.get("experiences", []),
                projects=data.get("projects", []), 
                skills=data.get("skills", []),
                certifications=data.get("certifications", []),
                languages=data.get("languages", []),
                raw_text=raw_text
            )
            
            return extracted_cv
            
        except json.JSONDecodeError as e:
            # Lỗi khi Gemini trả về JSON không hợp lệ
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Response text: {response.text}")
            raise ValueError(f"Invalid JSON response from Gemini: {str(e)}")
        except Exception as e:
            # Lỗi tổng quát trong quá trình xử lý
            logger.error(f"Error extracting structured data: {str(e)}")
            raise ValueError(f"Cannot extract structured data: {str(e)}")
