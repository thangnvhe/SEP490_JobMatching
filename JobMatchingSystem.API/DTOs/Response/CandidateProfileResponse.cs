using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CandidateProfileResponse
    {
        public int ProfileId { get; set; }
        public int UserId { get; set; }
        public int ExperienceYears { get; set; }
        public decimal SalaryExpect { get; set; }
        public string? Location { get; set; }
        public JobType JobType { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<int> TaxonomyIds { get; set; } = new();
    }
}
