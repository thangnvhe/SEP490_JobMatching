using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class RecruiterDashboardService : IRecruiterDashboardService
{
    private readonly ApplicationDbContext _context;

    public RecruiterDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RecruiterDashboardResponse> GetDashboardAsync(int recruiterId, int month, int year)
    {
        // Ensure valid month and year
        if (year <= 0 || year > 9999)
        {
            var now = DateTime.UtcNow;
            year = now.Year;
        }
        if (month <= 0 || month > 12)
        {
            var now = DateTime.UtcNow;
            month = now.Month;
        }

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var dashboard = new RecruiterDashboardResponse();

        // ==== JOB CREATED ====
        dashboard.JobsCreated = await _context.Jobs
            .Where(j => j.RecuiterId == recruiterId &&
                        j.CreatedAt >= startDate && j.CreatedAt < endDate)
            .CountAsync();

        dashboard.RecentCreatedJobs = await _context.Jobs
            .Where(j => j.RecuiterId == recruiterId)
            .OrderByDescending(j => j.CreatedAt)
            .Take(5)
            .Select(j => new JobShortInfo
            {
                JobId = j.JobId,
                Title = j.Title,
                CreatedAt = j.CreatedAt,
                Status = j.Status
            })
            .ToListAsync();

        // ==== JOB APPROVED ====
        dashboard.JobsApproved = await _context.Jobs
            .Where(j => j.RecuiterId == recruiterId &&
                        j.Status == JobStatus.Opened &&
                        j.OpenedAt >= startDate && j.OpenedAt < endDate)
            .CountAsync();

        dashboard.RecentApprovedJobs = await _context.Jobs
            .Where(j => j.RecuiterId == recruiterId &&
                        j.Status == JobStatus.Opened)
            .OrderByDescending(j => j.OpenedAt)
            .Take(5)
            .Select(j => new JobShortInfo
            {
                JobId = j.JobId,
                Title = j.Title,
                CreatedAt = j.OpenedAt.Value,
                Status = j.Status
            })
            .ToListAsync();

        // ==== MONEY SPENT (ORDERS) ====
        var recruiterOrders = await _context.Orders
            .Where(o => o.BuyerId == recruiterId &&
                        o.Status == OrderStatus.Success &&
                        o.CreatedAt >= startDate && o.CreatedAt < endDate)
            .Include(o => o.ServicePlan)
            .ToListAsync();

        dashboard.TotalSpent = recruiterOrders.Sum(o => o.Amount);

        dashboard.PurchasedPlans = recruiterOrders.Select(o => new RecruiterOrderInfo
        {
            OrderId = o.Id,
            PlanName = o.ServicePlan.Name,
            Amount = o.Amount,
            PurchasedAt = o.CreatedAt
        }).ToList();

        // ==== CANDIDATES APPLIED ====
        dashboard.CandidatesApplied = await _context.CandidateJobs
            .Where(cj => cj.AppliedAt >= startDate && cj.AppliedAt < endDate &&
                         cj.Job.RecuiterId == recruiterId)
            .CountAsync();

        dashboard.RecentCandidates = await _context.CandidateJobs
            .Where(cj => cj.Job.RecuiterId == recruiterId)
            .OrderByDescending(cj => cj.AppliedAt)
            .Take(5)
            .Select(cj => new CandidateAppliedInfo
            {
                CandidateName = _context.Users
            .Where(u => u.Id == cj.CVUpload.UserId)
            .Select(u => u.FullName)      // hoặc Name / UserName tùy model
            .FirstOrDefault(),
                CandidateJobId = cj.Id,
                JobId = cj.JobId,
                JobTitle = cj.Job.Title,
                CVId = cj.CVId,
                AppliedAt = cj.AppliedAt
            })
            .ToListAsync();

        return dashboard;
    }
}
