namespace JobMatchingSystem.API.DTOs.Response
{
    public class JobDetailResponse
    {
        public int JobId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string Benefits { get; set; }
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string Location { get; set; }
        public string JobType { get; set; }
        public string Status { get; set; }
        public int ViewsCount { get; set; }
        public int CompanyId { get; set; }
        public int RecuiterId { get; set; }
        public int? VerifiedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }

        public List<string> Taxonomies { get; set; } = new List<string>();
    }
}
