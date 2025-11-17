using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CensorReportRequest
    {
        public ReportStatus Status { get; set; } // 1 = Approved, 2 = Rejected
        public string? Note { get; set; }
    }
}
