namespace JobMatchingSystem.API.DTOs.Request
{
    public class JobStageRequest
    {
        public int JobId { get; set; }
        public int StageNumber { get; set; }
        public string Name { get; set; }
        public int? HiringManagerId { get; set; }
    }
    public class UpdateJobStageRequest
    {
        public int StageNumber { get; set; }
        public string Name { get; set; }
        public int? HiringManagerId { get; set; }
    }
}
