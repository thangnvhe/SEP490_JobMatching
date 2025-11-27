namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateCandidateStageRequest
    {
        public DateTime Schedule { get; set; }
        public string? InterviewLocation { get; set; } // Địa chỉ nơi phỏng vấn
        public string? GoogleMeetLink { get; set; } // Link Google Meet cho phỏng vấn online
    }
}
