<!-- ...existing code... -->

# Recruitment AI Service

Dịch vụ AI nhỏ gọn cho pipeline xử lý CV và tìm ứng viên phù hợp (CV upload → OCR/parse → embedding → vector search → AI scoring).

## Tóm tắt
- FastAPI làm REST API (để .NET hoặc frontend gọi).
- Gemini (Google) dùng để OCR / trích xuất cấu trúc CV.
- SentenceTransformers tạo embedding (text → vector).
- Pinecone lưu và tìm kiếm vector.
- Pipeline: upload CV (pdf/image) → extract structured JSON → embed → upsert vào Pinecone.  
  Nhận Job Description → embed → search → gọi Gemini phân tích + chấm điểm → trả JSON kết quả.

## Cấu trúc thư mục chính
- app/
  - api/schemas.py — Pydantic models
  - api/routes/cv_parser.py — upload / quản lý CV
  - api/routes/matching.py — match job → CV
  - core/config.py — cấu hình (.env)
  - services/
    - cv_extractor.py — Gemini + PDF/Image extract
    - embedding_service.py — SentenceTransformers
    - vector_service.py — Pinecone ops
  - utils/file_loader.py — validate upload
  - main.py — FastAPI entrypoint

## Yêu cầu (requirements.txt)
Tham khảo file requirements.txt (FastAPI, uvicorn, google-generativeai, sentence-transformers, pinecone-client, PyPDF2, Pillow, ...)

## Cấu hình môi trường
Sao chép `.env.example` → `.env` và điền:
- GEMINI_API_KEY
- PINECONE_API_KEY
- PINECONE_ENVIRONMENT
- PINECONE_INDEX_NAME
- EMBEDDING_MODEL_NAME (mặc định: all-MiniLM-L6-v2)

## Cài đặt & chạy (Windows)
1. Tạo virtualenv và cài dependencies:
   - python -m venv .venv
   - .venv\Scripts\activate
   - pip install -r requirements.txt
2. Tạo `.env` từ `.env.example` và điền API keys.
3. Chạy dev server:
   - uvicorn app.main:app --reload --port 8000

API docs: http://localhost:8000/docs

## Endpoints chính
- POST /api/v1/upload-cv
  - form-data: file (pdf/png/jpg/jpeg)
  - Trả về: cv_id, extracted_data, processing_time
  - Example curl:
    curl -F "file=@/path/to/cv.pdf" http://localhost:8000/api/v1/upload-cv

- POST /api/v1/match-cvs
  - body: JobDescription (JSON)
  - params: top_k (optional)
  - Trả về: top CVs + score + summary

- GET /api/v1/cv/{cv_id} — lấy metadata CV
- DELETE /api/v1/cv/{cv_id} — xóa CV
- GET /api/v1/health — health check

## Lưu ý vận hành / production
- Không dùng allow_origins = ["*"] trong production.
- Giới hạn kích thước file và scan input để tránh lạm dụng.
- Gemini & Pinecone đều gây chi phí — bật logging và hạn chế request thử nghiệm.
- Embedding model có thể cần GPU cho throughput cao; với CPU nhỏ, cân nhắc batch hoặc queue.

## Debugging & testing
- Kiểm tra logs console (uvicorn).
- Nếu gặp lỗi JSON từ Gemini khi extract, in response.text để debug prompt.
- Kiểm tra kết nối Pinecone và index tồn tại (app sẽ tạo index khi khởi động nếu thiếu).

## Mở rộng
- Thêm auth (API key/JWT) cho các endpoint.
- Lưu file gốc (uploads/) và phiên bản parsed cho audit.
- Caching kết quả embedding / job searches cho hiệu năng.

## License
MIT — tuỳ chỉnh theo dự án.

<!-- ...existing code... -->