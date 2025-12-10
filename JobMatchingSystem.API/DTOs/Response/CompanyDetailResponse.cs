using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CompanyDetailResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Logo { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? Address { get; set; }
        public string? PhoneContact { get; set; }
        public CompanyStatus Status { get; set; }
        public string? TaxCode { get; set; }
        public string? LicenseFile { get; set; }
        public bool IsActive { get; set; }
        public int Score { get; set; }
        public string? RejectReason { get; set; }
        public DateTime CreatedAt { get; set; }

        // Thêm 3 trường mới
        /// <summary>
        /// Số tin tuyển dụng hiện tại của công ty
        /// </summary>
        public int JobCount { get; set; }

        /// <summary>
        /// Số thành viên (nhân sự) của công ty bao gồm Recruiter và Hiring Manager
        /// </summary>
        public int TeamMembersCount { get; set; }

        /// <summary>
        /// Số người đã được tuyển dụng thành công (có trạng thái Pass)
        /// </summary>
        public int RecruitsCount { get; set; }
    }
}
