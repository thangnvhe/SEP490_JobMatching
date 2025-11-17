using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class GetReportPagedRequest
    {
        public int Page { get; set; } = 1;
        public int Size { get; set; } = 10;
        public string? Search { get; set; } = "";
        public string? SortBy { get; set; } = "";
        public bool IsDescending { get; set; } = false;

        // Các filter hiện có
        public int? JobId { get; set; }
        public int? ReporterId { get; set; }
        public ReportStatus? Status { get; set; }
        public ReportType? Subject { get; set; }
        public int? VerifiedById { get; set; }

        // Filter ngày tạo
        public DateTime? CreateMin { get; set; }
        public DateTime? CreateMax { get; set; }
    }
}
