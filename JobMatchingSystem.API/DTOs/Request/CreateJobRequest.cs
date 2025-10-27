using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateJobRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public string? Benefits { get; set; }
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string? Location { get; set; }
        public string? WorkInfo { get; set; }
        public JobType? JobType { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }

        // Danh sách taxonomy ID (Skill, Category)
        public List<int>? TaxonomyIds { get; set; }

        // Danh sách stage (số thứ tự + loại stage)
        public List<CreateJobStageRequest>? Stages { get; set; }
    }

    public class CreateJobStageRequest
    {
        public int StageNumber { get; set; }
        public bool Type { get; set; } = false;
    }
}
