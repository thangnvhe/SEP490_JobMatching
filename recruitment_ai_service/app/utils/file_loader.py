# Import UploadFile từ FastAPI để xử lý file được người dùng upload qua API
from fastapi import UploadFile

# Thư viện `magic` giúp đọc "MIME type" (định dạng thực tế của file) dựa trên nội dung nhị phân
import magic

# Dùng `List` để định nghĩa kiểu dữ liệu danh sách trong type hints
from typing import List

# Import cấu hình từ app (đọc từ .env qua settings)
from app.core.config import settings


class FileLoader:
    """Lớp chịu trách nhiệm kiểm tra, xác định loại file và đảm bảo file hợp lệ trước khi xử lý."""

    def __init__(self):
        """
        Hàm khởi tạo: nạp cấu hình cho file loader.
        - `allowed_extensions`: danh sách phần mở rộng được phép (vd: pdf, jpg, png,...)
        - `max_file_size`: kích thước tối đa của file upload (tính bằng byte)
        """
        self.allowed_extensions = settings.allowed_extensions
        self.max_file_size = settings.max_file_size
    
    def validate_file(self, file: UploadFile) -> bool:
        """
        ✅ Kiểm tra tính hợp lệ của file được upload:
        - Kích thước file có vượt quá giới hạn không
        - Phần mở rộng file có nằm trong danh sách cho phép không
        Trả về True nếu file hợp lệ, False nếu không.
        """
        
        # --- 1️⃣ Kiểm tra dung lượng file ---
        # Một số trường hợp UploadFile không có thuộc tính `.size`, nên cần kiểm tra an toàn bằng hasattr()
        if hasattr(file, 'size') and file.size > self.max_file_size:
            # Nếu file quá lớn → không hợp lệ
            return False
        
        # --- 2️⃣ Kiểm tra phần mở rộng (extension) của file ---
        if file.filename:
            # Lấy phần mở rộng của tên file (chuỗi sau dấu '.')
            extension = file.filename.split('.')[-1].lower()
            
            # Nếu phần mở rộng không nằm trong danh sách cho phép → không hợp lệ
            if extension not in self.allowed_extensions:
                return False
        
        # --- 3️⃣ Nếu qua được tất cả kiểm tra → file hợp lệ ---
        return True
    
    def get_file_type(self, file_content: bytes) -> str:
        """
        🔍 Xác định loại file dựa trên nội dung thực tế (không chỉ dựa vào phần mở rộng).
        Dùng thư viện `magic` để đọc MIME type:
        - Trả về `'pdf'` nếu là file PDF.
        - Trả về `'image'` nếu là file ảnh (jpg, png, jpeg,...).
        - Trả về `'unknown'` nếu không xác định được.
        """
        try:
            # Đọc vài byte đầu tiên để đoán định dạng file (MIME type)
            mime_type = magic.from_buffer(file_content, mime=True)
            
            # --- 1️⃣ Nếu MIME type là PDF ---
            if mime_type == 'application/pdf':
                return 'pdf'
            
            # --- 2️⃣ Nếu MIME type là hình ảnh ---
            elif mime_type.startswith('image/'):
                return 'image'
            
            # --- 3️⃣ Nếu không thuộc hai loại trên ---
            else:
                return 'unknown'
        
        # Nếu xảy ra lỗi trong quá trình đọc MIME type
        except:
            return 'unknown'
