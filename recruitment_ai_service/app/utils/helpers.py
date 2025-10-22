# Thư viện uuid dùng để tạo mã định danh duy nhất (unique ID)
import uuid

# Dùng để lấy thời gian hiện tại (datetime)
from datetime import datetime

# Kiểu dữ liệu gợi ý (type hinting)
from typing import Any, Dict

# Thư viện logging dùng để ghi log (lưu thông tin chạy của chương trình)
import logging

# Tạo đối tượng logger riêng cho module này (theo tên file)
logger = logging.getLogger(__name__)


# -------------------------------
# 🆔 HÀM 1: TẠO ID DUY NHẤT
# -------------------------------
def generate_unique_id() -> str:
    """
    🔹 Tạo mã định danh duy nhất (unique identifier) cho từng bản ghi hoặc file.
    - Dùng UUID v4 (tạo ngẫu nhiên, không trùng nhau).
    - Thường dùng khi lưu dữ liệu CV, user, hoặc file upload.
    """
    return str(uuid.uuid4())  # Trả về chuỗi UUID, ví dụ: 'a3d5b1de-7f2c-41b8-a2c9-0b3acdc3a8b2'


# -------------------------------
# ⏰ HÀM 2: LẤY THỜI GIAN HIỆN TẠI
# -------------------------------
def get_current_timestamp() -> str:
    """
    🔹 Lấy thời gian hiện tại của hệ thống dưới dạng chuỗi ISO 8601.
    Ví dụ: '2025-10-18T14:22:53.123456'
    - Dùng để ghi log, hoặc lưu thời điểm tạo/cập nhật dữ liệu.
    """
    return datetime.now().isoformat()


# -------------------------------
# 📂 HÀM 3: LÀM SẠCH TÊN FILE
# -------------------------------
def sanitize_filename(filename: str) -> str:
    """
    🔹 Làm sạch (sanitize) tên file trước khi lưu vào ổ đĩa hoặc cơ sở dữ liệu.
    - Xóa hoặc thay thế các ký tự đặc biệt không an toàn trong tên file.
    - Giúp tránh lỗi khi lưu file (như ký tự /, :, ?, *...).
    """
    import re
    # Dùng biểu thức chính quy (regex) để thay ký tự không hợp lệ bằng dấu gạch dưới '_'
    # Ký tự hợp lệ: chữ, số, gạch dưới (_), gạch ngang (-), và dấu chấm (.)
    sanitized = re.sub(r'[^\w\-_\.]', '_', filename)
    return sanitized


# -------------------------------
# 📊 HÀM 4: CHUYỂN ĐIỂM TƯƠNG ĐỒNG (SCORE)
# -------------------------------
def calculate_similarity_score(score: float) -> int:
    """
    🔹 Chuyển giá trị điểm tương đồng (float) sang phần trăm (int).
    - Thường dùng khi đánh giá độ khớp giữa 2 văn bản (VD: CV với JD).
    - Ví dụ:
        0.82 → 82%
        1.1  → 100%
        -0.2 → 0%
    """
    # Nhân với 100 để đổi sang phần trăm, ép kiểu int.
    # Dùng min/max để giới hạn giá trị trong khoảng [0, 100]
    return min(100, max(0, int(score * 100)))


# -------------------------------
# 🧠 HÀM 5: GHI LOG THỜI GIAN XỬ LÝ
# -------------------------------
def log_processing_time(func_name: str, start_time: float, end_time: float):
    """
    🔹 Ghi log về thời gian thực thi của một hàm để theo dõi hiệu suất.
    - `func_name`: Tên hàm được đo.
    - `start_time`, `end_time`: Thời gian bắt đầu và kết thúc (tính bằng giây, lấy bằng time.time()).
    - Ghi lại thông tin dưới dạng log info.
    """
    processing_time = end_time - start_time
    # Ghi log theo định dạng: "TênHàm completed in 0.25 seconds"
    logger.info(f"{func_name} completed in {processing_time:.2f} seconds")
