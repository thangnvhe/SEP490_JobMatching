using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateJobRequest
    {
        // Tiêu đề công việc (Có thể null. Nếu có, phải hợp lệ)
        [StringLength(200, ErrorMessage = "Tiêu đề công việc không được vượt quá 200 ký tự")]
        public string? Title { get; set; }

        // Mô tả công việc (Có thể null. Nếu có, phải đủ độ dài tối thiểu)
        [MinLength(50, ErrorMessage = "Mô tả công việc phải có ít nhất 50 ký tự")]
        public string? Description { get; set; }

        // Yêu cầu công việc (Có thể null)
        public string? Requirements { get; set; }

        // Phúc lợi (Có thể null)
        public string? Benefits { get; set; }

        // Lương tối thiểu (Có thể null. Nếu có, phải là số không âm)
        [Range(0, int.MaxValue, ErrorMessage = "Lương tối thiểu phải là số không âm")]
        public int? SalaryMin { get; set; }

        // Lương tối đa (Có thể null. Nếu có, phải là số không âm)
        [Range(0, int.MaxValue, ErrorMessage = "Lương tối đa phải là số không âm")]
        public int? SalaryMax { get; set; }

        // Địa điểm làm việc (Có thể null. Nếu có, không dài quá 255 ký tự)
        [StringLength(255, ErrorMessage = "Địa điểm làm việc không được vượt quá 255 ký tự")]
        public string? Location { get; set; }

        // Số năm kinh nghiệm (Có thể null. Nếu có, phải trong khoảng hợp lệ)
        [Range(0, 50, ErrorMessage = "Số năm kinh nghiệm phải từ 0 đến 50")]
        public int? ExperienceYear { get; set; }

        // Loại hình công việc (Có thể null. Nếu có, không dài quá 50 ký tự)
        [StringLength(50, ErrorMessage = "Loại hình công việc không được vượt quá 50 ký tự")]
        public string? JobType { get; set; }

        public int? PositionId { get; set; }

        // Ngày mở đăng tuyển (Có thể null)
        // Không cần validation đặc biệt, chỉ cần kiểu dữ liệu hợp lệ (DateTime)
        public DateTime? OpenedAt { get; set; }

        // Ngày hết hạn đăng tuyển (Có thể null)
        public DateTime? ExpiredAt { get; set; }

        // Danh sách các ID phân loại/ngành nghề (Không áp dụng validation theo yêu cầu)
        public List<int>? TaxonomyIds { get; set; }
        public int? HighlightJobId { get; set; }
        public int? ExtensionJobId { get; set; }
    }
}
