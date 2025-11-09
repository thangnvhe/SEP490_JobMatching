using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class JobResponse
    {
        public int JobId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public string? Benefits { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public int? SalaryMin { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public int? SalaryMax { get; set; }
        public string? Location { get; set; }
        public string? WorkInfo { get; set; }
        public JobType? JobType { get; set; }
        public JobStatus? Status { get; set; } = JobStatus.Draft;
        public int? ViewsCount { get; set; } = 0;
        public int? AppliesCount { get; set; } = 0;
        public int? CompanyId { get; set; }
        public int? Poster { get; set; }
        public int? VerifiedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public bool? IsDeleted { get; set; } = false;
    }
}
