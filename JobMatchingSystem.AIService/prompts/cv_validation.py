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

📋 YÊU CẦU BẮT BUỘC (PHẢI CÓ ĐỦ 3 YÉU TỐ):

1. ✅ THÔNG TIN CÁ NHÂN:
   - Tên (họ và tên đầy đủ hoặc tên gọi)
   - VÀ ít nhất 1 trong 2: Số điện thoại HOẶC Email

2. ✅ HỌC VẤN:
   - Trường học/đại học
   - Chuyên ngành học
   - Bằng cấp/trình độ
   - Thời gian học

3. ✅ KINH NGHIỆM LÀM VIỆC:
   - Vị trí công việc
   - Tên công ty/tổ chức
   - Thời gian làm việc
   - Mô tả công việc/trách nhiệm

🎯 YÊU CẦU PHỤ (PHẢI CÓ ÍT NHẤT 2 TRONG 4 MỤC SAU):

1. 🛠️ KỸ NĂNG:
   - Kỹ năng chuyên môn
   - Kỹ năng lập trình/công nghệ
   - Kỹ năng mềm
   - Ngôn ngữ/công cụ sử dụng

2. 🏆 THÀNH TỰU:
   - Giải thưởng
   - Thành tích nổi bật
   - Kết quả công việc xuất sắc
   - Danh hiệu được nhận

3. 📚 DỰ ÁN:
   - Tên dự án đã thực hiện
   - Mô tả dự án
   - Công nghệ/phương pháp sử dụng
   - Vai trò trong dự án

4. 📜 CHỨNG CHỈ:
   - Chứng chỉ nghề nghiệp
   - Chứng nhận kỹ năng
   - Khóa học đã hoàn thành
   - Giấy phép hành nghề

❌ LOẠI BỎ - KHÔNG PHẢI CV:
- Hóa đơn, phiếu thu
- Hợp đồng, văn bản pháp lý
- Quảng cáo, thông báo
- Báo cáo, tài liệu kỹ thuật
- Sách, truyện, bài viết
- Catalog sản phẩm
- Hướng dẫn sử dụng

ĐỊNH DẠNG TRẢ LỜI:
- Nếu đủ tiêu chí: "YES - CV hợp lệ. Có [3 yếu tố bắt buộc + X/4 yếu tố phụ: liệt kê cụ thể]"
- Nếu thiếu: "NO - Thiếu [liệt kê yếu tố còn thiếu]. Cần đủ 3 yếu tố bắt buộc và 2/4 yếu tố phụ"

Hãy phân tích cẩn thận theo đúng tiêu chí:"""