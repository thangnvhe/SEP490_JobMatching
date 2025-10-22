# Import FastAPI framework để tạo REST API
from fastapi import FastAPI

# Import middleware CORS (Cross-Origin Resource Sharing)
# Dùng để cho phép client (như React, Vue, Angular...) gọi API từ domain khác
from fastapi.middleware.cors import CORSMiddleware

# Import logging để ghi log trong suốt quá trình chạy
import logging

# Import các route (API endpoint) riêng cho từng module
from app.api.routes import cv_parser, matching

# Import cấu hình từ file config (chứa API key, port, tên app,...)
from app.core.config import settings

# Import service kết nối với Pinecone (Vector Database)
from app.services.vector_service import VectorService


# ---------------------------------------
# 🧾 CẤU HÌNH LOGGING TOÀN HỆ THỐNG
# ---------------------------------------
# Ghi log ở mức độ INFO (ghi ra các sự kiện thông thường, không phải lỗi)
logging.basicConfig(level=logging.INFO)
# Tạo logger cho file này, giúp phân biệt log giữa các module khác nhau
logger = logging.getLogger(__name__)


# ---------------------------------------
# 🚀 KHỞI TẠO FASTAPI APP
# ---------------------------------------
app = FastAPI(
    title=settings.app_name,  # Tên ứng dụng (lấy từ file .env hoặc config)
    version=settings.api_version,  # Phiên bản API
    description="AI-powered CV parsing and job matching service"  # Mô tả ngắn
)


# ---------------------------------------
# 🌍 THÊM MIDDLEWARE CORS
# ---------------------------------------
# Dùng để cho phép request từ các domain khác (frontend có thể chạy ở localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả domain (⚠️ nên giới hạn khi lên production)
    allow_credentials=True,  # Cho phép gửi cookie/headers xác thực
    allow_methods=["*"],  # Cho phép tất cả HTTP methods (GET, POST, PUT, DELETE,...)
    allow_headers=["*"],  # Cho phép tất cả headers
)


# ---------------------------------------
# 🧩 ĐĂNG KÝ ROUTER CHO API
# ---------------------------------------
# Kết nối router từ các module riêng biệt
# - cv_parser: Xử lý trích xuất dữ liệu từ CV
# - matching: Xử lý so khớp CV và Job Description
app.include_router(cv_parser.router, prefix="/api/v1", tags=["CV Processing"])
app.include_router(matching.router, prefix="/api/v1", tags=["Job Matching"])


# ---------------------------------------
# ⚙️ SỰ KIỆN KHI ỨNG DỤNG KHỞI ĐỘNG
# ---------------------------------------
@app.on_event("startup")
async def startup_event():
    """Hàm này sẽ chạy 1 lần khi ứng dụng bắt đầu khởi động"""
    try:
        # Khởi tạo VectorService để kết nối với Pinecone
        vector_service = VectorService()
        # Kiểm tra nếu index chưa tồn tại thì tạo mới
        vector_service.create_index_if_not_exists()
        logger.info("Application started successfully ✅")
    except Exception as e:
        # Ghi log lỗi nếu khởi tạo thất bại
        logger.error(f"Error during startup: {str(e)}")


# ---------------------------------------
# 📍 ROUTE GỐC "/" — DÙNG KIỂM TRA TRẠNG THÁI APP
# ---------------------------------------
@app.get("/")
async def root():
    """Trả về thông tin cơ bản của service"""
    return {
        "message": "CV Matching AI Service",  # Tên service hiển thị
        "version": settings.api_version,       # Phiên bản API
        "status": "running"                    # Trạng thái hiện tại
    }


# ---------------------------------------
# 💓 ROUTE /health — DÙNG CHO HEALTH CHECK
# ---------------------------------------
@app.get("/health")
async def health_check():
    """Endpoint dùng để kiểm tra tình trạng hệ thống (health check)"""
    return {"status": "healthy"}


# ---------------------------------------
# 🏁 CHẠY ỨNG DỤNG BẰNG UVICORN
# ---------------------------------------
if __name__ == "__main__":
    import uvicorn
    # uvicorn là web server chạy FastAPI
    # host="0.0.0.0" cho phép truy cập từ bên ngoài (trên cloud)
    # port=8000 là cổng chạy API (VD: http://localhost:8000)
    uvicorn.run(app, host="0.0.0.0", port=8000)
