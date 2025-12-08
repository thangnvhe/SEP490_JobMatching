namespace JobMatchingSystem.API.DTOs.Response
{
    public class CandidateDashboardResponse
    {
        public int TotalAppliedJobs { get; set; }
        public List<AppliedJobDto> RecentAppliedJobs { get; set; } = new();

        public int UpcomingInterviewCount { get; set; }
        public List<UpcomingStageDto> UpcomingStages { get; set; } = new();

        public int TotalSavedJobs { get; set; }
        public List<SavedJobDto> RecentSavedJobs { get; set; } = new();

        public int TotalReports { get; set; }
    }

    public class AppliedJobDto
    {
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public DateTime AppliedAt { get; set; }
    }

    public class UpcomingStageDto
    {
        public string JobTitle { get; set; }
        public string StageName { get; set; }
        public DateTime? ScheduleTime { get; set; }
    }

    public class SavedJobDto
    {
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public DateTime SavedAt { get; set; }
    }

}
