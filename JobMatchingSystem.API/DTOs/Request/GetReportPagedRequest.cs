using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class GetReportPagedRequest
    {
        public int page { get; set; } = 1;
        public int size { get; set; } = 10;
        public string? search { get; set; } = "";
        public string? sortBy { get; set; } = "";
        public bool isDescending { get; set; } = false;

        // Các filter hiện có
        public int? jobId { get; set; }
        public int? reporterId { get; set; }
        public ReportStatus? status { get; set; }
        public ReportType? subject { get; set; }
        public int? verifiedById { get; set; }

        // Filter ngày tạo
        public DateTime? createMin { get; set; }
        public DateTime? createMax { get; set; }
    }
}
