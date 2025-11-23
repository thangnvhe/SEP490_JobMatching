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
Bạn là chuyên gia HR kinh nghiệm. Hãy đánh giá xem văn bản sau có phải là CV/Resume hợp lệ không:

===== NỘI DUNG FILE =====
{truncated_text}
==========================

TIÊU CHÍ ĐÁNH GIÁ CV HỢP LỆ:

📋 YÊU CẦU BẮT BUỘC (PHẢI CÓ ĐỦ):
1. ✅ HỌ TÊN của người nộp đơn (tên đầy đủ hoặc tên gọi)
2. ✅ THÔNG TIN LIÊN LẠC (ít nhất 1 trong các mục sau):
   - Email
   - Số điện thoại  
   - Địa chỉ
   - LinkedIn/mạng xã hội nghề nghiệp

🎯 YÊU CẦU CHUYÊN MÔN (PHẢI CÓ ÍT NHẤT 3 TRONG CÁC MỤC SAU):
1. 💼 KINH NGHIỆM LÀM VIỆC:
   - Vị trí công việc đã làm
   - Tên công ty/tổ chức
   - Thời gian làm việc
   - Mô tả công việc/trách nhiệm

2. 🛠️ KỸ NĂNG CHUYÊN MÔN:
   - Kỹ năng lập trình/công nghệ
   - Kỹ năng nghề nghiệp
   - Công cụ/phần mềm sử dụng
   - Ngôn ngữ lập trình

3. 📚 DỰ ÁN ĐÃ THỰC HIỆN:
   - Tên dự án
   - Mô tả dự án
   - Công nghệ sử dụng
   - Vai trò trong dự án

4. 🎓 HỌC VẤN/ĐÀO TẠO:
   - Trường học/đại học
   - Chuyên ngành
   - Bằng cấp/chứng chỉ
   - Năm tốt nghiệp

5. 🏆 THÀNH TỰU/CHỨNG CHỈ:
   - Giải thưởng
   - Chứng nhận nghề nghiệp
   - Khóa học đã hoàn thành

❌ KHÔNG PHẢI CV:
- Hóa đơn, phiếu thu
- Hợp đồng, văn bản pháp lý
- Quảng cáo, thông báo
- Báo cáo, tài liệu kỹ thuật
- Sách, truyện, bài viết

ĐỊNH DẠNG TRẢ LỜI:
- Nếu đủ tiêu chí: "YES - CV hợp lệ. Có [họ tên + thông tin liên lạc + X/5 yếu tố chuyên môn: liệt kê]"
- Nếu thiếu: "NO - Thiếu [liệt kê yếu tố còn thiếu]"

Hãy phân tích cẩn thận:"""

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