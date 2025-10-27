using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateOrUpdateCandidateProfileRequest
    {
        public int ExperienceYears { get; set; }
        public decimal SalaryExpect { get; set; }
        public string? Location { get; set; }
        public JobType JobType { get; set; }

        // Danh sách taxonomy ID (Skill, Category)
        public List<int>? TaxonomyIds { get; set; }
    }
}
