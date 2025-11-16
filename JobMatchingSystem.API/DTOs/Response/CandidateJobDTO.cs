using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CandidateJobDTO
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public int? CVId { get; set; }
        public CandidateJobStatus Status { get; set; } 
        public DateTime AppliedAt { get; set; } 
    }
}
