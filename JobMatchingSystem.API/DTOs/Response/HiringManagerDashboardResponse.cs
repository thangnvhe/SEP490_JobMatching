namespace JobMatchingSystem.API.DTOs.Response
{
    public class HiringManagerDashboardResponse
    {
        // Tổng số ứng viên đã review
        public int TotalReviewedCandidates { get; set; }

        // Số ứng viên chờ đánh giá (chưa có feedback)
        public int PendingReviewCount { get; set; }

        // 5 ứng viên chờ đánh giá gần nhất
        public List<PendingReviewDto> PendingReviews { get; set; } = new List<PendingReviewDto>();

        // Số buổi phỏng vấn sắp diễn ra (7 ngày tới)
        public int UpcomingInterviewCount { get; set; }

        // 5 buổi phỏng vấn sắp diễn ra
        public List<UpcomingInterviewDto> UpcomingInterviews { get; set; } = new List<UpcomingInterviewDto>();

        // Thống kê theo trạng thái trong tháng
        public int ApprovedThisMonth { get; set; }
        public int RejectedThisMonth { get; set; }
    }

    public class PendingReviewDto
    {
        public int CandidateStageId { get; set; }
        public int CandidateJobId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string StageName { get; set; } = string.Empty;
        public DateTime? SubmittedAt { get; set; }
        public string? InterviewLocation { get; set; }
        public string? GoogleMeetLink { get; set; }
    }

    public class UpcomingInterviewDto
    {
        public int CandidateStageId { get; set; }
        public int CandidateJobId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string StageName { get; set; } = string.Empty;
        public DateTime? InterviewDateTime { get; set; }
        public string? InterviewLocation { get; set; }
        public string? GoogleMeetLink { get; set; }
    }
}
