using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class JobResponse
    {
        public int JobId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public string? Benefits { get; set; }
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string? Location { get; set; }
        public string? WorkInfo { get; set; }
        public JobType? JobType { get; set; }
        public JobStatus? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }

        public List<string>? Taxonomies { get; set; }
    }
}
