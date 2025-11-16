using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateJobRequest
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
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }

        public List<int>? TaxonomyIds { get; set; }
    }
}
