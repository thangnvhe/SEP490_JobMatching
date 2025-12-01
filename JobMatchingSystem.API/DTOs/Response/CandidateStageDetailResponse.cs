using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CandidateStageDetailResponse
    {
        // CandidateStage information
        public int Id { get; set; }
        public int CandidateJobId { get; set; }
        public int JobStageId { get; set; }
        public string? Status { get; set; }
        public DateOnly? InterviewDate { get; set; }
        public TimeOnly? InterviewStartTime { get; set; }
        public TimeOnly? InterviewEndTime { get; set; }
        public string? InterviewLocation { get; set; }
        public string? GoogleMeetLink { get; set; }
        public string? HiringManagerFeedback { get; set; }
        public string? JobStageTitle { get; set; }
        
        // User information
        public UserInfo User { get; set; } = null!;
        
        // CV information
        public CVInfo CV { get; set; } = null!;
    }
    
    public class UserInfo
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? Birthday { get; set; }
        public bool? Gender { get; set; }
    }
    
    public class CVInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string FileUrl { get; set; } = null!;
    }
}