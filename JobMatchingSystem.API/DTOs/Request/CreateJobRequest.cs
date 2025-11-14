using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateJobRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string Benefits { get; set; }
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string Location { get; set; }
        public JobType JobType { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }

        public List<CreateJobStageRequest>? JobStages { get; set; }
        public List<int>? TaxonomyIds { get; set; }
    }

    public class CreateJobStageRequest
    {
        public int StageNumber { get; set; }
        public string Name { get; set; }
        public int? HiringManagerId { get; set; }
    }

}
