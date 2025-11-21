using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateJobRequest
    {
        // Tiêu đề công việc
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title must not exceed 200 characters")]
        public string Title { get; set; }

        // Mô tả công việc
        [Required(ErrorMessage = "Description is required")]
        [MinLength(50, ErrorMessage = "Description must be at least 50 characters")]
        public string Description { get; set; }

        // Yêu cầu công việc
        [Required(ErrorMessage = "Requirements are required")]
        public string Requirements { get; set; }

        // Phúc lợi
        [Required(ErrorMessage = "Benefits are required")]
        public string Benefits { get; set; }

        // Lương tối thiểu (có thể null)
        [Range(0, int.MaxValue, ErrorMessage = "Salary minimum must be a non-negative number")]
        public int? SalaryMin { get; set; }

        // Lương tối đa (có thể null)
        [Range(0, int.MaxValue, ErrorMessage = "Salary maximum must be a non-negative number")]
        public int? SalaryMax { get; set; }

        // Địa điểm làm việc
        [Required(ErrorMessage = "Location is required")]
        [StringLength(255, ErrorMessage = "Location must not exceed 255 characters")]
        public string Location { get; set; }

        // Số năm kinh nghiệm (có thể null)
        [Range(0, 50, ErrorMessage = "Experience year must be between 0 and 50")]
        public int? ExperienceYear { get; set; }

        // Loại hình công việc (Full-time, Part-time,...)
        [Required(ErrorMessage = "Job type is required")]
        [StringLength(50, ErrorMessage = "Job type must not exceed 50 characters")]
        public string JobType { get; set; }

        // Ngày mở đăng tuyển
        [Required(ErrorMessage = "Opened at date is required")]
        public DateTime? OpenedAt { get; set; }

        // Ngày hết hạn đăng tuyển
        [Required(ErrorMessage = "Expired at date is required")]
        // Custom validation để đảm bảo ExpiredAt lớn hơn OpenedAt (Cần triển khai IValidatableObject hoặc Custom Attribute cho validation này nếu muốn kiểm tra chéo)
        public DateTime? ExpiredAt { get; set; }

        // Danh sách các giai đoạn tuyển dụng (Không áp dụng validation theo yêu cầu)
        public List<CreateJobStageRequest>? JobStages { get; set; }

        // Danh sách các ID phân loại/ngành nghề (Không áp dụng validation theo yêu cầu)
        public List<int>? TaxonomyIds { get; set; }
    }

    public class CreateJobStageRequest
    {
        public int StageNumber { get; set; }
        public string Name { get; set; }
        public int? HiringManagerId { get; set; }
    }

}
