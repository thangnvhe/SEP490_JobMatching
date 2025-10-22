# -------------------------------------------------------
# 📁 File: app/api/routes/cv_parser.py
# 📘 Mục đích: Xử lý các API liên quan đến CV
#  - Upload CV (PDF/Image)
#  - Trích xuất dữ liệu (Gemini)
#  - Tạo embedding (SentenceTransformer)
#  - Lưu vào Vector Database (Pinecone)
#  - Xem thông tin CV hoặc xóa CV
# -------------------------------------------------------

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
import time
import logging

# 🧩 Import các service cần thiết
from app.services.cv_extractor import CVExtractor          # Xử lý trích xuất text và data từ CV
from app.services.embedding_service import EmbeddingService  # Tạo embedding cho CV
from app.services.vector_service import VectorService        # Làm việc với vector database (Pinecone)
from app.api.schemas import CVUploadResponse                 # Schema định dạng response trả về
from app.utils.file_loader import FileLoader                 # Xử lý kiểm tra và đọc file
from app.core.config import settings                         # Lấy cấu hình từ .env

# ⚙️ Cấu hình logging (ghi log lỗi, trạng thái)
logger = logging.getLogger(__name__)

# 📦 Tạo router riêng cho nhóm API này (gắn vào /api/v1/... sau)
router = APIRouter()

# 🚀 Khởi tạo các service (được dùng lại nhiều lần)
cv_extractor = CVExtractor()
embedding_service = EmbeddingService()
vector_service = VectorService()
file_loader = FileLoader()


# ==============================================================
# 📤 1️⃣ API: Upload CV và xử lý
# ==============================================================
@router.post("/upload-cv", response_model=CVUploadResponse)
async def upload_cv(file: UploadFile = File(...)):
    """
    📄 Upload và xử lý CV (PDF hoặc hình ảnh)
    Pipeline: File Upload → Text Extraction → Data Extraction → Embedding → Vector Storage
    """
    start_time = time.time()  # ⏱️ Đo thời gian xử lý
    
    try:
        # 🧾 Kiểm tra file hợp lệ (định dạng, kích thước)
        if not file_loader.validate_file(file):
            raise HTTPException(status_code=400, detail="Invalid file format or size")
        
        # 🆔 Tạo ID ngẫu nhiên cho CV
        cv_id = str(uuid.uuid4())
        
        # 📥 Đọc nội dung file upload
        file_content = await file.read()
        
        # 📄 Lấy phần mở rộng của file (để biết là pdf hay image)
        file_extension = file.filename.split(".")[-1].lower()
        
        # 🧠 Bước 1: Trích xuất text từ CV
        if file_extension == "pdf":
            raw_text = cv_extractor.extract_text_from_pdf(file_content)
        elif file_extension in ["png", "jpg", "jpeg"]:
            raw_text = cv_extractor.extract_text_from_image(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # 🤖 Bước 2: Gọi Gemini để trích xuất thông tin có cấu trúc từ text
        extracted_data = cv_extractor.extract_structured_data(raw_text)
        
        # 🔢 Bước 3: Tạo vector embedding từ dữ liệu CV
        embedding = embedding_service.create_cv_embedding(extracted_data)
        
        # 🗄️ Bước 4: Lưu vector và metadata vào Pinecone (vector database)
        vector_service.upsert_cv(cv_id, embedding, extracted_data)
        
        # ⏰ Tính thời gian xử lý
        processing_time = time.time() - start_time
        
        # ✅ Trả kết quả thành công
        return CVUploadResponse(
            cv_id=cv_id,
            extracted_data=extracted_data,
            processing_time=processing_time,
            message="CV processed and stored successfully"
        )
        
    except Exception as e:
        # ❌ Nếu có lỗi, ghi log và trả lỗi HTTP 500
        logger.error(f"Error processing CV upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing CV: {str(e)}")


# ==============================================================
# 🔍 2️⃣ API: Lấy thông tin CV theo ID
# ==============================================================
@router.get("/cv/{cv_id}")
async def get_cv_info(cv_id: str):
    """📂 Lấy thông tin CV (metadata) theo ID"""
    try:
        # Gọi Pinecone để tìm CV có cv_id tương ứng
        results = vector_service.search_similar_cvs(
            query_embedding=[0] * settings.embedding_dimension,  # Dummy embedding tạm (vì chỉ lọc theo ID)
            top_k=1,
            filter_dict={"cv_id": cv_id}
        )
        
        # Nếu không tìm thấy
        if not results:
            raise HTTPException(status_code=404, detail="CV not found")
        
        # ✅ Trả metadata CV
        return results[0]["metadata"]
        
    except Exception as e:
        logger.error(f"Error getting CV info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving CV: {str(e)}")


# ==============================================================
# 🗑️ 3️⃣ API: Xóa CV khỏi vector database
# ==============================================================
@router.delete("/cv/{cv_id}")
async def delete_cv(cv_id: str):
    """🧹 Xóa CV khỏi vector database theo ID"""
    try:
        success = vector_service.delete_cv(cv_id)
        if success:
            return {"message": "CV deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="CV not found")
            
    except Exception as e:
        logger.error(f"Error deleting CV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting CV: {str(e)}")
