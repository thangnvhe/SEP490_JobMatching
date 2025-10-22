# -------------------------------------------------------
# 📁 File: schemas.py
# 📘 Mục đích: Định nghĩa các mô hình dữ liệu (schema)
# sử dụng trong hệ thống AI Matching, bao gồm CV, job,
# kết quả matching, và phản hồi API.
# -------------------------------------------------------

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# 🏫 Thông tin học vấn trong CV
class CVEducation(BaseModel):
    # Tên trường / tổ chức
    institution: Optional[str] = None
    # Bằng cấp (ví dụ: Cử nhân, Thạc sĩ, ...)
    degree: Optional[str] = None
    # Ngành học
    field_of_study: Optional[str] = None
    # Ngày bắt đầu học
    start_date: Optional[str] = None
    # Ngày kết thúc học
    end_date: Optional[str] = None
    # Điểm trung bình (GPA)
    gpa: Optional[str] = None


# 💼 Kinh nghiệm làm việc trong CV
class CVExperience(BaseModel):
    # Tên công ty
    company: Optional[str] = None
    # Chức vụ đảm nhiệm
    position: Optional[str] = None
    # Ngày bắt đầu làm việc
    start_date: Optional[str] = None
    # Ngày kết thúc
    end_date: Optional[str] = None
    # Mô tả công việc (nhiệm vụ chính)
    description: Optional[str] = None
    # Thành tựu nổi bật trong công việc
    achievements: Optional[List[str]] = []


# 🚀 Dự án cá nhân hoặc trong công việc
class CVProject(BaseModel):
    # Tên dự án
    name: Optional[str] = None
    # Mô tả chi tiết dự án
    description: Optional[str] = None
    # Vai trò của ứng viên trong dự án
    role: Optional[str] = None
    # Công nghệ sử dụng trong dự án
    technologies: Optional[List[str]] = []
    # Thời gian bắt đầu
    start_date: Optional[str] = None
    # Thời gian kết thúc
    end_date: Optional[str] = None


# 📄 Dữ liệu CV sau khi được trích xuất bởi AI (Gemini)
class ExtractedCV(BaseModel):
    # Thông tin cá nhân: tên, email, số điện thoại,...
    personal_info: Dict[str, Any] = Field(default_factory=dict)
    # Danh sách học vấn
    education: List[CVEducation] = Field(default_factory=list)
    # Danh sách kinh nghiệm làm việc
    experiences: List[CVExperience] = Field(default_factory=list)
    # Danh sách dự án
    projects: List[CVProject] = Field(default_factory=list)
    # Kỹ năng của ứng viên (skills)
    skills: List[str] = Field(default_factory=list)
    # Chứng chỉ chuyên môn
    certifications: List[str] = Field(default_factory=list)
    # Ngôn ngữ mà ứng viên biết
    languages: List[str] = Field(default_factory=list)
    # Toàn bộ text CV gốc (để lưu trữ hoặc debug)
    raw_text: str = ""


# 💼 Mô tả công việc (Job Description)
class JobDescription(BaseModel):
    # Tiêu đề công việc (VD: Backend Developer)
    title: str
    # Mô tả chi tiết công việc
    description: str
    # Yêu cầu kỹ năng, kinh nghiệm, bằng cấp,...
    requirements: str
    # Quyền lợi (benefits)
    benefits: Optional[str] = None
    # Địa điểm làm việc
    location: Optional[str] = None
    # Mức lương tối thiểu
    salary_min: Optional[int] = None
    # Mức lương tối đa
    salary_max: Optional[int] = None
    # Loại công việc (Full-time, Part-time, Remote,...)
    job_type: Optional[str] = None


# 🤝 Kết quả matching giữa 1 CV và 1 job
class CVMatch(BaseModel):
    # ID của CV trong cơ sở dữ liệu
    cv_id: str
    # Điểm matching (0.0 - 1.0 hoặc %)
    score: float
    # Tóm tắt lý do vì sao phù hợp
    summary: str
    # Các kỹ năng khớp giữa CV và job
    matching_skills: List[str]
    # Các kỹ năng còn thiếu
    missing_skills: List[str]
    # Mức độ phù hợp về kinh nghiệm
    experience_match: str
    # Mức độ phù hợp về học vấn
    education_match: str


# 📊 Kết quả tổng hợp khi tìm CV phù hợp cho 1 job
class MatchingResponse(BaseModel):
    # ID của job
    job_id: str
    # Tổng số CV phù hợp
    total_matches: int
    # Danh sách các CV phù hợp nhất
    matches: List[CVMatch]
    # Thời gian xử lý (để đo hiệu năng)
    processing_time: float


# 📤 Phản hồi sau khi upload CV và xử lý xong
class CVUploadResponse(BaseModel):
    # ID CV lưu trong database hoặc vector store
    cv_id: str
    # Dữ liệu CV đã được AI trích xuất (ExtractedCV)
    extracted_data: ExtractedCV
    # Thời gian xử lý CV (tính bằng giây)
    processing_time: float
    # Thông báo phản hồi (VD: “Tải lên thành công”)
    message: str
