using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateJobRequest
    {
        // Tiêu đề công việc
        [Required(ErrorMessage = "Tiêu đề công việc không được để trống")]
        [StringLength(200, ErrorMessage = "Tiêu đề công việc không được vượt quá 200 ký tự")]
        public string Title { get; set; }

        // Mô tả công việc
        [Required(ErrorMessage = "Mô tả công việc không được để trống")]
        [MinLength(50, ErrorMessage = "Mô tả công việc phải có ít nhất 50 ký tự")]
        public string Description { get; set; }

        // Yêu cầu công việc
        [Required(ErrorMessage = "Yêu cầu công việc không được để trống")]
        public string Requirements { get; set; }

        // Phúc lợi
        [Required(ErrorMessage = "Phúc lợi không được để trống")]
        public string Benefits { get; set; }

        // Lương tối thiểu (có thể null)
        [Range(0, int.MaxValue, ErrorMessage = "Lương tối thiểu phải là số không âm")]
        public int? SalaryMin { get; set; }

        // Lương tối đa (có thể null)
        [Range(0, int.MaxValue, ErrorMessage = "Lương tối đa phải là số không âm")]
        public int? SalaryMax { get; set; }

        // Địa điểm làm việc
        [Required(ErrorMessage = "Địa điểm làm việc không được để trống")]
        [StringLength(255, ErrorMessage = "Địa điểm làm việc không được vượt quá 255 ký tự")]
        public string Location { get; set; }

        // Số năm kinh nghiệm (có thể null)
        [Range(0, 50, ErrorMessage = "Số năm kinh nghiệm phải từ 0 đến 50")]
        public int? ExperienceYear { get; set; }

        // Loại hình công việc (Full-time, Part-time,...)
        [Required(ErrorMessage = "Loại hình công việc không được để trống")]
        [StringLength(50, ErrorMessage = "Loại hình công việc không được vượt quá 50 ký tự")]
        public string JobType { get; set; }

        public int? PositionId { get; set; }

        // Ngày mở đăng tuyển
        [Required(ErrorMessage = "Ngày mở tuyển dụng không được để trống")]
        public DateTime? OpenedAt { get; set; }

        // Ngày hết hạn đăng tuyển
        [Required(ErrorMessage = "Ngày hết hạn tuyển dụng không được để trống")]
        // Custom validation để đảm bảo ExpiredAt lớn hơn OpenedAt (Cần triển khai IValidatableObject hoặc Custom Attribute cho validation này nếu muốn kiểm tra chéo)
        public DateTime? ExpiredAt { get; set; }

        // Danh sách các giai đoạn tuyển dụng (Không áp dụng validation theo yêu cầu)
        public List<CreateJobStageRequest>? JobStages { get; set; }

        // Danh sách các ID phân loại/ngành nghề (Không áp dụng validation theo yêu cầu)
        public List<int>? TaxonomyIds { get; set; }

        public int? HighlightJobId { get; set; }
        public int? ExtensionJobId { get; set; }
    }

    public class CreateJobStageRequest
    {
        public int StageNumber { get; set; }
        public string Name { get; set; }
        public int? HiringManagerId { get; set; }
    }

}
