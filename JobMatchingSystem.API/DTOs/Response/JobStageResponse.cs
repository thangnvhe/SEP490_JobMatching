namespace JobMatchingSystem.API.DTOs.Response
{
    public class JobStageResponse
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public int StageNumber { get; set; }
        public string Name { get; set; }
        public int? HiringManagerId { get; set; }
    }
}
