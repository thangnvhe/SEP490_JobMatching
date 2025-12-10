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
Bạn là chuyên gia HR với 15 năm kinh nghiệm tuyển dụng. Phân tích CHÍNH XÁC xem văn bản sau có phải CV/Resume thật không:

===== NỘI DUNG FILE =====
{truncated_text}
==========================

🔍 PHÂN TÍCH THEO BƯỚC:

BƯỚC 1: KIỂM TRA LOẠI TÀI LIỆU
❌ LOẠI BỎ NGAY nếu thuộc các loại sau:
- Database Design, ERD, Schema, SQL
- Technical Documentation, API docs
- Scientific Papers, Research
- Legal Documents, Contracts
- Product Manuals, Tutorials
- Financial Reports, Invoices
- Medical Records, Prescriptions
- Academic Assignments, Homework
- News Articles, Blog Posts
- Marketing Materials, Brochures

BƯỚC 2: KIỂM TRA THÔNG TIN CÁ NHÂN (BẮT BUỘC)
✅ PHẢI CÓ TẤT CẢ:
- Tên người (họ tên đầy đủ, không phải tên dự án/công ty)
- Ít nhất 1 liên lạc: Email hoặc Số điện thoại
- Thông tin này PHẢI xuất hiện ở đầu tài liệu

BƯỚC 3: KIỂM TRA NỘI DUNG CV (BẮT BUỘC CÓ ÍT NHẤT 4/6 MỤC)
1. 🎓 HỌC VẤN: Trường học + Chuyên ngành + Thời gian
2. 💼 KINH NGHIỆM: Vị trí + Công ty + Thời gian + Mô tả
3. 🛠️ KỸ NĂNG: Kỹ năng chuyên môn/lập trình/mềm
4. 📚 DỰ ÁN: Tên dự án + Mô tả + Công nghệ + Vai trò
5. 🏆 THÀNH TỰU: Giải thưởng/Thành tích/Kết quả xuất sắc
6. 📜 CHỨNG CHỈ: Chứng chỉ nghề/Khóa học/Giấy phép

BƯỚC 4: KIỂM TRA CẤU TRÚC CV
- Có cấu trúc rõ ràng theo sections
- Thông tin được trình bày theo thời gian hoặc mức độ ưu tiên
- Không phải list data, bảng kỹ thuật

🎯 QUY TẮC CHẤM ĐIỂM:
- Database/Technical docs: NGAY LẬP TỨC = NO
- Thiếu thông tin cá nhân: = NO
- Có dưới 4/6 mục CV: = NO
- Đủ tiêu chí: = YES

ĐỊNH DẠNG TRẢ LỜI:
- "YES - CV hợp lệ. Có [X/6 mục]: [liệt kê cụ thể các mục tìm thấy]"
- "NO - [Lý do cụ thể]. [Mô tả ngắn gọn tài liệu này là gì]"

VÍ DỤ TRẢ LỜI CHUẨN:
- "NO - Đây là tài liệu thiết kế database với ERD và bảng dữ liệu, không phải CV"
- "NO - Thiếu thông tin cá nhân (tên/liên lạc) và chỉ có 2/6 mục CV"
- "YES - CV hợp lệ. Có 5/6 mục: Thông tin cá nhân, Học vấn, Kinh nghiệm, Kỹ năng, Dự án"

Phân tích ngay:"""