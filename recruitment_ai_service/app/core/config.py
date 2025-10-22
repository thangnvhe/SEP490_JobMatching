from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Configuration
    app_name: str = "CV Matching AI Service"
    debug: bool = False
    api_version: str = "v1"
    
    # Gemini API
    gemini_api_key: str = ""  # Default rỗng để tránh lỗi
    
    # Pinecone Configuration
    pinecone_api_key: str = ""  # Default rỗng để tránh lỗi
    pinecone_environment: str = "us-east-1"
    pinecone_index_name: str = "job-matching-m4xfybw"
    
    # Embedding Configuration
    embedding_model_name: str = "multilingual-e5-large"
    embedding_dimension: int = 1024
    
    # File Upload Configuration
    max_file_size: int = 5 * 1024 * 1024  # 5MB
    allowed_extensions_str: str = "pdf,png,jpg,jpeg,doc,docx"
    upload_directory: str = "uploads"
    
    # Property để convert string thành list
    @property
    def allowed_extensions(self) -> List[str]:
        return [ext.strip() for ext in self.allowed_extensions_str.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        env_ignore_empty = True

# Khởi tạo với error handling
try:
    settings = Settings()
    print("✅ Config loaded successfully")
except Exception as e:
    print(f"❌ Error loading config: {e}")
    # Tạo default settings
    settings = Settings()
