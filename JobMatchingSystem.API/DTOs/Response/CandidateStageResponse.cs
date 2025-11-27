using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CandidateStageResponse
    {
        public int Id { get; set; }
        public int CandidateJobId { get; set; }
        public int JobStageId { get; set; }
        public CandidateStageStatus? Status { get; set; }
        public DateTime? ScheduleTime { get; set; }
        public string? InterviewLocation { get; set; }
        public string? GoogleMeetLink { get; set; }
        public string? HiringManagerFeedback { get; set; }
        
        // Navigation properties for additional info
        public string? JobStageTitle { get; set; }
        public string? CandidateName { get; set; }
    }
}