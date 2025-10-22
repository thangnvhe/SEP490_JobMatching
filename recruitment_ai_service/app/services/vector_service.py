# Import thư viện Pinecone để làm việc với cơ sở dữ liệu vector
from pinecone import Pinecone, ServerlessSpec  # CẬP NHẬT IMPORT
from typing import List, Dict, Any, Optional
import uuid
import logging
from app.core.config import settings
from app.api.schemas import ExtractedCV

# Khởi tạo logger để ghi log (theo dõi sự kiện, lỗi, thông tin,...)
logger = logging.getLogger(__name__)

class VectorService:
    """Dịch vụ quản lý dữ liệu vector (CV embeddings) trong Pinecone"""
    
    def __init__(self):
        """
        Hàm khởi tạo: Kết nối đến Pinecone bằng API key và environment.
        Nếu có lỗi, sẽ ghi log và báo lỗi khởi tạo.
        """
        # --- Khởi tạo Pinecone ---
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        
        # Connect to existing index
        try:
            self.index = self.pc.Index(settings.pinecone_index_name)
            logger.info(f"Connected to Pinecone index: {settings.pinecone_index_name}")
        except Exception as e:
            logger.error(f"Error connecting to Pinecone index: {str(e)}")
            raise ValueError(f"Cannot connect to Pinecone: {str(e)}")
    
    def create_index_if_not_exists(self):
        """Create Pinecone index if it doesn't exist (CHỈ CẦN KIỂM TRA)"""
        try:
            # Liệt kê các index hiện có
            existing_indexes = [index.name for index in self.pc.list_indexes()]
            
            if settings.pinecone_index_name not in existing_indexes:
                logger.warning(f"Index {settings.pinecone_index_name} không tồn tại!")
                logger.info("Bạn cần tạo index trên Pinecone dashboard hoặc tạo bằng code")
                
                # TÙY CHỌN: Tự động tạo index mới (nếu cần)
                # self.pc.create_index(
                #     name=settings.pinecone_index_name,
                #     dimension=settings.embedding_dimension,
                #     metric="cosine",
                #     spec=ServerlessSpec(
                #         cloud="aws",
                #         region="us-east-1"
                #     )
                # )
            else:
                logger.info(f"✅ Pinecone index đã tồn tại: {settings.pinecone_index_name}")
                
        except Exception as e:
            logger.error(f"Error checking Pinecone index: {str(e)}")
            # Không raise exception để app vẫn chạy được
    
    def upsert_cv(self, cv_id: str, embedding: List[float], cv_data: ExtractedCV) -> bool:
        """Store CV embedding and metadata in Pinecone"""
        try:
            # Prepare metadata (Pinecone có giới hạn metadata)
            metadata = {
                "cv_id": cv_id,
                "full_name": cv_data.personal_info.get("full_name", "") or "",
                "email": cv_data.personal_info.get("email", "") or "",
                "skills": cv_data.skills[:10],  # Giới hạn 10 skills
                "experience_count": len(cv_data.experiences),
                "education_count": len(cv_data.education),
                "certifications": cv_data.certifications[:5],  # Giới hạn 5 certs
                "raw_text": cv_data.raw_text[:1000] if cv_data.raw_text else ""  # Giới hạn text
            }
            
            # Upsert vector
            self.index.upsert(
                vectors=[{
                    "id": cv_id,
                    "values": embedding,
                    "metadata": metadata
                }]
            )
            
            logger.info(f"Successfully upserted CV: {cv_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error upserting CV to Pinecone: {str(e)}")
            raise ValueError(f"Cannot store CV in vector database: {str(e)}")
    
    def search_similar_cvs(self, query_embedding: List[float], top_k: int = 10, filter_dict: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Search for similar CVs using vector similarity"""
        try:
            # Perform vector search
            search_results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            # Format results
            results = []
            for match in search_results.matches:
                result = {
                    "cv_id": match.id,
                    "score": float(match.score),
                    "metadata": match.metadata
                }
                results.append(result)
            
            logger.info(f"Found {len(results)} similar CVs")
            return results
            
        except Exception as e:
            logger.error(f"Error searching CVs in Pinecone: {str(e)}")
            raise ValueError(f"Cannot search vector database: {str(e)}")
    
    def delete_cv(self, cv_id: str) -> bool:
        """Delete CV from vector database"""
        try:
            self.index.delete(ids=[cv_id])
            logger.info(f"Deleted CV: {cv_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting CV: {str(e)}")
            return False
    
    def get_index_stats(self) -> Dict[str, Any]:
        """Get statistics about the index"""
        try:
            stats = self.index.describe_index_stats()
            return {
                "total_vectors": stats.total_vector_count,
                "dimension": stats.dimension,
                "index_fullness": stats.index_fullness
            }
        except Exception as e:
            logger.error(f"Error getting index stats: {str(e)}")
            return {}
