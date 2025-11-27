namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateResultCandidateStage
    {
        public string Result { get; set; }
        public string? HiringManagerFeedback { get; set; } // Đánh giá của Hiring Manager
    }
}
