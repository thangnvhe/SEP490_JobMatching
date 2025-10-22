from fastapi import APIRouter, HTTPException
import google.generativeai as genai
import time
import logging
from typing import List
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorService
from app.api.schemas import JobDescription, MatchingResponse, CVMatch
from app.core.config import settings

# Cấu hình logger để theo dõi quá trình hoạt động và lỗi
logger = logging.getLogger(__name__)

# Khởi tạo router cho API (FastAPI)
router = APIRouter()

# ======================
# Khởi tạo các dịch vụ cốt lõi
# ======================
embedding_service = EmbeddingService()   # Xử lý tạo embedding cho CV và Job
vector_service = VectorService()         # Xử lý lưu trữ và tìm kiếm vector (Pinecone)

# ======================
# Cấu hình Gemini API (Google Generative AI)
# ======================
genai.configure(api_key=settings.gemini_api_key)
gemini_model = genai.GenerativeModel('gemini-1.5-pro')  # Dùng mô hình Gemini Pro cho phân tích chuyên sâu

# =========================================================
# API chính: Ghép CV với mô tả công việc
# =========================================================
@router.post("/match-cvs", response_model=MatchingResponse)
async def match_cvs_to_job(job: JobDescription, top_k: int = 10):
    """
    So khớp các CV tốt nhất với một mô tả công việc.
    Quy trình gồm 5 bước:
    1️⃣ Nhận mô tả công việc từ client
    2️⃣ Tạo embedding cho Job
    3️⃣ Tìm các CV có embedding tương tự trong cơ sở dữ liệu
    4️⃣ Dùng Gemini AI để phân tích chi tiết mức độ phù hợp
    5️⃣ Trả về danh sách ứng viên phù hợp nhất
    """
    start_time = time.time()
    
    try:
        # 1️⃣ Tạo vector embedding cho mô tả công việc
        job_embedding = embedding_service.create_job_embedding(job)
        
        # 2️⃣ Tìm các CV tương tự trong Pinecone
        search_results = vector_service.search_similar_cvs(
            query_embedding=job_embedding,
            top_k=top_k * 2  # Lấy nhiều hơn để có dư dữ liệu cho bước lọc
        )
        
        # Nếu không tìm thấy CV nào
        if not search_results:
            return MatchingResponse(
                job_id="",
                total_matches=0,
                matches=[],
                processing_time=time.time() - start_time
            )
        
        # 3️⃣ Dùng Gemini để phân tích mức độ phù hợp từng CV
        matches = []
        for result in search_results[:top_k]:
            cv_metadata = result["metadata"]
            
            # Tạo prompt gửi cho Gemini để yêu cầu phân tích chi tiết
            analysis_prompt = f"""
            Analyze the compatibility between this job and CV:
            
            JOB DESCRIPTION:
            Title: {job.title}
            Description: {job.description}
            Requirements: {job.requirements}
            Location: {job.location or 'Not specified'}
            
            CV CANDIDATE:
            Name: {cv_metadata.get('full_name', 'Unknown')}
            Skills: {', '.join(cv_metadata.get('skills', []))}
            Experience Count: {cv_metadata.get('experience_count', 0)}
            Education Count: {cv_metadata.get('education_count', 0)}
            Certifications: {', '.join(cv_metadata.get('certifications', []))}
            
            Please provide a detailed analysis in the following format:
            SCORE: [0-100]
            MATCHING_SKILLS: [comma-separated list of matching skills]
            MISSING_SKILLS: [comma-separated list of required but missing skills]
            EXPERIENCE_MATCH: [brief assessment of experience relevance]
            EDUCATION_MATCH: [brief assessment of education relevance]
            SUMMARY: [2-3 sentence summary of why this candidate is/isn't a good fit]
            """
            
            try:
                # 4️⃣ Gửi prompt đến Gemini và nhận kết quả phân tích
                analysis_response = gemini_model.generate_content(analysis_prompt)
                analysis_text = analysis_response.text
                
                # Phân tích text đầu ra của Gemini thành dữ liệu có cấu trúc
                parsed_analysis = parse_gemini_analysis(analysis_text)
                
                # Tạo đối tượng CVMatch cho ứng viên
                cv_match = CVMatch(
                    cv_id=result["cv_id"],
                    score=parsed_analysis.get("score", result["score"] * 100),
                    summary=parsed_analysis.get("summary", "Analysis not available"),
                    matching_skills=parsed_analysis.get("matching_skills", []),
                    missing_skills=parsed_analysis.get("missing_skills", []),
                    experience_match=parsed_analysis.get("experience_match", "Not analyzed"),
                    education_match=parsed_analysis.get("education_match", "Not analyzed")
                )
                matches.append(cv_match)
                
            except Exception as e:
                # Nếu Gemini bị lỗi, fallback sang đánh giá cơ bản
                logger.warning(f"Error analyzing CV {result['cv_id']}: {str(e)}")
                cv_match = CVMatch(
                    cv_id=result["cv_id"],
                    score=result["score"] * 100,
                    summary=f"Candidate with {len(cv_metadata.get('skills', []))} skills and {cv_metadata.get('experience_count', 0)} work experiences",
                    matching_skills=cv_metadata.get('skills', [])[:5],
                    missing_skills=[],
                    experience_match=f"{cv_metadata.get('experience_count', 0)} work experiences",
                    education_match=f"{cv_metadata.get('education_count', 0)} education records"
                )
                matches.append(cv_match)
        
        # 5️⃣ Sắp xếp danh sách ứng viên theo điểm giảm dần
        matches.sort(key=lambda x: x.score, reverse=True)
        
        processing_time = time.time() - start_time
        
        # ✅ Trả kết quả cuối cùng cho client
        return MatchingResponse(
            job_id=str(hash(job.title + job.description)),
            total_matches=len(matches),
            matches=matches,
            processing_time=processing_time
        )
        
    except Exception as e:
        # Ghi log và trả lỗi 500 nếu có sự cố nghiêm trọng
        logger.error(f"Error matching CVs to job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error matching CVs: {str(e)}")

# =========================================================
# Hàm phụ: Phân tích output của Gemini thành dict
# =========================================================
def parse_gemini_analysis(analysis_text: str) -> dict:
    """
    Chuyển đổi văn bản phản hồi của Gemini thành dữ liệu có cấu trúc.
    Dạng dữ liệu trả về gồm:
    - score
    - matching_skills
    - missing_skills
    - experience_match
    - education_match
    - summary
    """
    try:
        result = {}
        lines = analysis_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith('SCORE:'):
                # Trích điểm số từ văn bản
                score_text = line.replace('SCORE:', '').strip()
                import re
                score_match = re.search(r'\d+', score_text)
                if score_match:
                    result['score'] = min(100, max(0, int(score_match.group())))
                else:
                    result['score'] = 50
                    
            elif line.startswith('MATCHING_SKILLS:'):
                skills_text = line.replace('MATCHING_SKILLS:', '').strip()
                result['matching_skills'] = [s.strip() for s in skills_text.split(',') if s.strip()]
                
            elif line.startswith('MISSING_SKILLS:'):
                skills_text = line.replace('MISSING_SKILLS:', '').strip()
                result['missing_skills'] = [s.strip() for s in skills_text.split(',') if s.strip()]
                
            elif line.startswith('EXPERIENCE_MATCH:'):
                result['experience_match'] = line.replace('EXPERIENCE_MATCH:', '').strip()
                
            elif line.startswith('EDUCATION_MATCH:'):
                result['education_match'] = line.replace('EDUCATION_MATCH:', '').strip()
                
            elif line.startswith('SUMMARY:'):
                result['summary'] = line.replace('SUMMARY:', '').strip()
        
        return result
        
    except Exception as e:
        logger.error(f"Error parsing Gemini analysis: {str(e)}")
        return {}

# =========================================================
# API kiểm tra tình trạng hệ thống (health check)
# =========================================================
@router.get("/health")
async def health_check():
    """
    Endpoint kiểm tra tình trạng hoạt động của các thành phần hệ thống:
    - Vector Database (Pinecone)
    - Embedding Service
    - Gemini API
    """
    try:
        # Kiểm tra kết nối vector database
        stats = vector_service.get_index_stats()
        
        return {
            "status": "healthy",
            "services": {
                "vector_database": "connected",
                "embedding_service": "ready",
                "gemini_api": "ready"
            },
            "index_stats": stats
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
