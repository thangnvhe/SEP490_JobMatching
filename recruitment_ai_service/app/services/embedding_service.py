from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any
import logging
from app.core.config import settings
from app.api.schemas import ExtractedCV, JobDescription

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for creating text embeddings from CVs and job descriptions"""

    def __init__(self):
        # Load the pre-trained SentenceTransformer model from config
        # Ví dụ: 'all-MiniLM-L6-v2' hoặc model embedding khác
        self.model = SentenceTransformer(settings.embedding_model_name)
        
    # ======================================================================
    # 🧠 CV Embedding Section
    # ======================================================================
    def create_cv_text_for_embedding(self, cv_data: ExtractedCV) -> str:
        """
        Convert structured CV data into a single text string that 
        represents the candidate's profile — used to generate embeddings.
        """
        text_parts = []  # Chứa các phần thông tin được nối dần vào

        # --- 1️⃣ Personal Information (Thông tin cá nhân) ---
        if cv_data.personal_info:
            name = cv_data.personal_info.get("full_name", "")
            if name:
                text_parts.append(f"Name: {name}")
        
        # --- 2️⃣ Skills (Kỹ năng) ---
        if cv_data.skills:
            text_parts.append(f"Skills: {', '.join(cv_data.skills)}")
        
        # --- 3️⃣ Experience (Kinh nghiệm làm việc) ---
        for exp in cv_data.experiences:
            exp_text = []
            if exp.position:
                exp_text.append(f"Position: {exp.position}")
            if exp.company:
                exp_text.append(f"Company: {exp.company}")
            if exp.description:
                exp_text.append(f"Description: {exp.description}")
            if exp.achievements:
                exp_text.append(f"Achievements: {', '.join(exp.achievements)}")
            
            # Ghép tất cả thông tin kinh nghiệm lại thành 1 chuỗi
            if exp_text:
                text_parts.append(" ".join(exp_text))
        
        # --- 4️⃣ Education (Học vấn) ---
        for edu in cv_data.education:
            edu_text = []
            if edu.degree:
                edu_text.append(f"Degree: {edu.degree}")
            if edu.field_of_study:
                edu_text.append(f"Field: {edu.field_of_study}")
            if edu.institution:
                edu_text.append(f"Institution: {edu.institution}")
            
            if edu_text:
                text_parts.append(" ".join(edu_text))
        
        # --- 5️⃣ Projects (Dự án) ---
        for project in cv_data.projects:
            project_text = []
            if project.name:
                project_text.append(f"Project: {project.name}")
            if project.description:
                project_text.append(f"Description: {project.description}")
            if project.technologies:
                project_text.append(f"Technologies: {', '.join(project.technologies)}")
            
            if project_text:
                text_parts.append(" ".join(project_text))
        
        # --- 6️⃣ Certifications (Chứng chỉ) ---
        if cv_data.certifications:
            text_parts.append(f"Certifications: {', '.join(cv_data.certifications)}")
        
        # Kết hợp toàn bộ phần trên thành 1 chuỗi lớn cho model embedding
        return " ".join(text_parts)
    
    # ======================================================================
    # 💼 Job Embedding Section
    # ======================================================================
    def create_job_text_for_embedding(self, job: JobDescription) -> str:
        """
        Convert job description data into a single text string suitable for embedding.
        """
        text_parts = []

        # Thêm tiêu đề, mô tả, yêu cầu
        text_parts.append(f"Job Title: {job.title}")
        text_parts.append(f"Description: {job.description}")
        text_parts.append(f"Requirements: {job.requirements}")
        
        # Thêm thông tin phụ nếu có
        if job.benefits:
            text_parts.append(f"Benefits: {job.benefits}")
        
        if job.location:
            text_parts.append(f"Location: {job.location}")
        
        if job.job_type:
            text_parts.append(f"Job Type: {job.job_type}")
        
        # Trả về một chuỗi hoàn chỉnh
        return " ".join(text_parts)
    
    # ======================================================================
    # 🔢 Embedding Creation Section
    # ======================================================================
    def create_embedding(self, text: str) -> List[float]:
        """
        Generate a numerical vector (embedding) from input text using the SentenceTransformer model.
        This vector is later stored in a vector database for similarity search.
        """
        try:
            # Model chuyển text → vector dạng numpy array
            embedding = self.model.encode(text, convert_to_numpy=True)

            # Convert sang list để dễ lưu trữ (ví dụ: trong Pinecone)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error creating embedding: {str(e)}")
            raise ValueError(f"Cannot create embedding: {str(e)}")
    
    def create_cv_embedding(self, cv_data: ExtractedCV) -> List[float]:
        """
        Generate an embedding for a candidate CV.
        Steps:
            1. Convert CV structured data → text
            2. Convert text → vector embedding
        """
        cv_text = self.create_cv_text_for_embedding(cv_data)
        return self.create_embedding(cv_text)
    
    def create_job_embedding(self, job: JobDescription) -> List[float]:
        """
        Generate an embedding for a job description.
        Steps:
            1. Convert job data → text
            2. Convert text → vector embedding
        """
        job_text = self.create_job_text_for_embedding(job)
        return self.create_embedding(job_text)
