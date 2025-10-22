# -------------------------------------------------------
# 🧱 File: exceptions.py
# 📘 Chức năng: Định nghĩa các loại lỗi (Exception) tùy chỉnh
# giúp chương trình dễ quản lý và hiển thị thông báo rõ ràng hơn
# -------------------------------------------------------


# 🧾 Lỗi khi xử lý file CV (ví dụ: lỗi khi đọc, trích xuất nội dung, hoặc parse)
class CVProcessingError(Exception):
    """Raised when CV processing fails"""  # Mô tả ngắn: được gọi khi quá trình xử lý CV thất bại
    pass  # Không cần thêm gì vì chỉ cần tạo lớp lỗi riêng để dễ nhận diện


# 🧠 Lỗi khi tạo embedding (ví dụ: mô hình không hoạt động, API lỗi, hoặc text không hợp lệ)
class EmbeddingError(Exception):
    """Raised when embedding creation fails"""  # Được gọi khi tạo vector embedding thất bại
    pass


# 🧩 Lỗi khi thao tác với Vector Store (Pinecone)
# (ví dụ: lỗi kết nối, lỗi ghi dữ liệu, hoặc lỗi truy vấn)
class VectorStoreError(Exception):
    """Raised when vector store operations fail"""  # Được gọi khi thao tác với cơ sở dữ liệu vector bị lỗi
    pass


# 📂 Lỗi khi kiểm tra file upload (ví dụ: định dạng không hợp lệ, kích thước vượt quá giới hạn, file trống)
class FileValidationError(Exception):
    """Raised when file validation fails"""  # Được gọi khi quá trình kiểm tra file tải lên thất bại
    pass
