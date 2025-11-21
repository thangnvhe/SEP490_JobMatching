using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateJobRequest
    {
        // Tiêu đề công việc (Có thể null. Nếu có, phải hợp lệ)
        [StringLength(200, ErrorMessage = "Title must not exceed 200 characters")]
        public string? Title { get; set; }

        // Mô tả công việc (Có thể null. Nếu có, phải đủ độ dài tối thiểu)
        [MinLength(50, ErrorMessage = "Description must be at least 50 characters")]
        public string? Description { get; set; }

        // Yêu cầu công việc (Có thể null)
        public string? Requirements { get; set; }

        // Phúc lợi (Có thể null)
        public string? Benefits { get; set; }

        // Lương tối thiểu (Có thể null. Nếu có, phải là số không âm)
        [Range(0, int.MaxValue, ErrorMessage = "Salary minimum must be a non-negative number")]
        public int? SalaryMin { get; set; }

        // Lương tối đa (Có thể null. Nếu có, phải là số không âm)
        [Range(0, int.MaxValue, ErrorMessage = "Salary maximum must be a non-negative number")]
        public int? SalaryMax { get; set; }

        // Địa điểm làm việc (Có thể null. Nếu có, không dài quá 255 ký tự)
        [StringLength(255, ErrorMessage = "Location must not exceed 255 characters")]
        public string? Location { get; set; }

        // Số năm kinh nghiệm (Có thể null. Nếu có, phải trong khoảng hợp lệ)
        [Range(0, 50, ErrorMessage = "Experience year must be between 0 and 50")]
        public int? ExperienceYear { get; set; }

        // Loại hình công việc (Có thể null. Nếu có, không dài quá 50 ký tự)
        [StringLength(50, ErrorMessage = "Job type must not exceed 50 characters")]
        public string? JobType { get; set; }

        // Ngày mở đăng tuyển (Có thể null)
        // Không cần validation đặc biệt, chỉ cần kiểu dữ liệu hợp lệ (DateTime)
        public DateTime? OpenedAt { get; set; }

        // Ngày hết hạn đăng tuyển (Có thể null)
        public DateTime? ExpiredAt { get; set; }

        // Danh sách các ID phân loại/ngành nghề (Không áp dụng validation theo yêu cầu)
        public List<int>? TaxonomyIds { get; set; }
    }
}
