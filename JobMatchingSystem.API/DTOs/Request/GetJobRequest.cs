using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class GetJobRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public string? Benefits { get; set; }
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string? Location { get; set; }
        public int? ExperienceYear { get; set; }
        public string? JobType { get; set; }
        public JobStatus? Status { get; set; }
        public int? CompanyId { get; set; }
        public int? RecuiterId { get; set; }
        public List<int>? TaxonomyIds { get; set; }
    }
}
