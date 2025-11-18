namespace JobMatchingSystem.API.DTOs.Response
{
    public class ReportDetailResponse
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public int ReporterId { get; set; }
        public int? VerifiedById { get; set; }
        public string Subject { get; set; } = "";
        public string Reason { get; set; } = "";
        public string? Note { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}
