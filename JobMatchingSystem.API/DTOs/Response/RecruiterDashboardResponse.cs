using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class RecruiterDashboardResponse
    {
        public int JobsCreated { get; set; }
        public List<JobShortInfo> RecentCreatedJobs { get; set; } = new();

        public int JobsApproved { get; set; }
        public List<JobShortInfo> RecentApprovedJobs { get; set; } = new();

        public decimal TotalSpent { get; set; }
        public List<RecruiterOrderInfo> PurchasedPlans { get; set; } = new();

        public int CandidatesApplied { get; set; }
        public List<CandidateAppliedInfo> RecentCandidates { get; set; } = new();
    }

    public class JobShortInfo
    {
        public int JobId { get; set; }
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }
        public JobStatus Status { get; set; }
    }

    public class RecruiterOrderInfo
    {
        public int OrderId { get; set; }
        public string PlanName { get; set; }
        public decimal Amount { get; set; }
        public DateTime PurchasedAt { get; set; }
    }

    public class CandidateAppliedInfo
    {
        public int CandidateJobId { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public string CandidateName { get; set; }
        public int? CVId { get; set; }
        public DateTime AppliedAt { get; set; }
    }
}
