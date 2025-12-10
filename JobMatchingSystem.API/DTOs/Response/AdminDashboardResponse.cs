using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class AdminDashboardResponse
    {
        public int NewCompanies { get; set; }
        public int ApprovedCompanies { get; set; }

        public int NewJobs { get; set; }
        public int OpenedJobs { get; set; }

        public int NewReports { get; set; }

        public decimal MonthlyRevenue { get; set; }
        public int SuccessfulOrders { get; set; }

        public List<TopServicePlanDto> TopServicePlans { get; set; } = new();

        public List<RecentCompanyDto> RecentCompanies { get; set; } = new();
        public List<RecentCompanyDto> RecentApprovedCompanies { get; set; } = new();
        public List<RecentOrderDto> RecentOrders { get; set; } = new();
        public List<RecentJobDto> RecentJobs { get; set; } = new();
    }

    public class TopServicePlanDto
    {
        public int ServiceId { get; set; }
        public string Name { get; set; }
        public int PurchaseCount { get; set; }
    }

    public class RecentCompanyDto
    {
        public int CompanyId { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public CompanyStatus Status { get; set; }
    }

    public class RecentOrderDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RecentJobDto
    {
        public int JobId { get; set; }
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
