"""
CV Validation Prompts for Gemini AI
"""

class CVValidationPrompts:
    """Prompts specifically for CV validation tasks"""
    
    @staticmethod
    def validate_cv_content(text: str, max_length: int = 3000) -> str:
        """Generate prompt to validate if document is a CV"""
        # Truncate text if too long
        truncated_text = text[:max_length] if len(text) > max_length else text
        
        return f"""
Bạn là một chuyên gia HR có kinh nghiệm trong việc đánh giá CV. Hãy phân tích văn bản sau từ một file PDF:

===== NỘI DUNG FILE =====
{truncated_text}
==========================

NHIỆM VỤ: Xác định xem đây có phải là CV (Curriculum Vitae/Resume) hay không.

TIÊU CHÍ ĐÁNH GIÁ:
1. Có thông tin cá nhân (tên, địa chỉ, số điện thoại, email)
2. Có thông tin học vấn hoặc kinh nghiệm làm việc
3. Có kỹ năng, chứng chỉ hoặc thành tích
4. Định dạng và cấu trúc giống CV
5. Không phải là tài liệu khác (báo cáo, hướng dẫn, quảng cáo, etc.)

ĐỊNH DẠNG TRẢ LỜI:
- Nếu là CV: "YES - [lý do ngắn gọn tại sao đây là CV]"
- Nếu không phải CV: "NO - [lý do ngắn gọn tại sao đây không phải CV]"

Hãy trả lời ngay lập tức:"""

    @staticmethod
    def extract_cv_info(text: str, max_length: int = 4000) -> str:
        """Generate prompt to extract key information from CV"""
        truncated_text = text[:max_length] if len(text) > max_length else text
        
        return f"""
Bạn là một chuyên gia HR. Hãy trích xuất thông tin quan trọng từ CV sau:

===== CV CONTENT =====
{truncated_text}
======================

Hãy trích xuất và trả về thông tin dưới dạng JSON:
{{
    "name": "Tên ứng viên",
    "email": "Email liên hệ",
    "phone": "Số điện thoại",
    "experience_years": "Số năm kinh nghiệm (ước tính)",
    "education": "Trình độ học vấn cao nhất",
    "skills": ["kỹ năng 1", "kỹ năng 2", "..."],
    "positions": ["vị trí đã làm 1", "vị trí đã làm 2", "..."],
    "summary": "Tóm tắt ngắn về ứng viên"
}}

Nếu không tìm thấy thông tin nào, hãy để giá trị là null hoặc []."""

    @staticmethod
    def match_cv_with_job(cv_text: str, job_description: str, max_cv_length: int = 3000, max_job_length: int = 1500) -> str:
        """Generate prompt to match CV with job description"""
        truncated_cv = cv_text[:max_cv_length] if len(cv_text) > max_cv_length else cv_text
        truncated_job = job_description[:max_job_length] if len(job_description) > max_job_length else job_description
        
        return f"""
Bạn là một chuyên gia tuyển dụng. Hãy đánh giá mức độ phù hợp giữa CV và mô tả công việc:

===== CV =====
{truncated_cv}
==============

===== MÔ TẢ CÔNG VIỆC =====
{truncated_job}
===========================

Hãy đánh giá và trả về kết quả dưới dạng JSON:
{{
    "match_score": 0-100,
    "matching_skills": ["kỹ năng phù hợp 1", "kỹ năng phù hợp 2"],
    "missing_skills": ["kỹ năng thiếu 1", "kỹ năng thiếu 2"],
    "experience_match": true/false,
    "education_match": true/false,
    "overall_assessment": "Đánh giá tổng thể ngắn gọn",
    "recommendations": ["đề xuất cải thiện 1", "đề xuất cải thiện 2"]
}}

Điểm số từ 0-100 (100 là hoàn toàn phù hợp)."""