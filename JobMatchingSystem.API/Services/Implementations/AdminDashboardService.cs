using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class AdminDashboardService : IAdminDashboardService
{
    private readonly ApplicationDbContext _context;

    public AdminDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardResponse> GetDashboardDataAsync(int month, int year)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var dashboard = new AdminDashboardResponse();

        // ======= COMPANY =======
        dashboard.NewCompanies = await _context.Companies
            .CountAsync(c => c.CreatedAt >= startDate && c.CreatedAt < endDate);

        dashboard.ApprovedCompanies = await _context.Companies
            .CountAsync(c => c.VerifiedAt >= startDate && c.VerifiedAt < endDate);

        // ======= JOB =======
        dashboard.NewJobs = await _context.Jobs
            .CountAsync(j => j.CreatedAt >= startDate && j.CreatedAt < endDate);

        dashboard.OpenedJobs = await _context.Jobs
            .CountAsync(j => j.Status == JobStatus.Opened && j.OpenedAt >= startDate && j.OpenedAt < endDate);

        // ======= REPORT =======
        dashboard.NewReports = await _context.Reports
            .CountAsync(r => r.CreatedAt >= startDate && r.CreatedAt < endDate);

        // ======= ORDER + REVENUE =======
        var successfulOrders = await _context.Orders
            .Where(o => o.Status == OrderStatus.Success &&
                        o.CreatedAt >= startDate && o.CreatedAt < endDate)
            .ToListAsync();

        dashboard.MonthlyRevenue = successfulOrders.Sum(o => o.Amount);
        dashboard.SuccessfulOrders = successfulOrders.Count;

        // ===== TOP SERVICE PLANS =====
        dashboard.TopServicePlans = await _context.Orders
            .Where(o => o.Status == OrderStatus.Success &&
                        o.CreatedAt >= startDate && o.CreatedAt < endDate)
            .GroupBy(o => new { o.ServicePlan.Id, o.ServicePlan.Name })
            .Select(g => new TopServicePlanDto
            {
                ServiceId = g.Key.Id,
                Name = g.Key.Name,
                PurchaseCount = g.Count()
            })
            .OrderByDescending(x => x.PurchaseCount)
            .Take(5)
            .ToListAsync();

        // ===== RECENT LISTS =====
        dashboard.RecentCompanies = await _context.Companies
            .OrderByDescending(c => c.CreatedAt)
            .Take(5)
            .Select(c => new RecentCompanyDto
            {
                CompanyId = c.Id,
                Name = c.Name,
                CreatedAt = c.CreatedAt.Value,
                Status = c.Status
            })
            .ToListAsync();

        dashboard.RecentApprovedCompanies = await _context.Companies
            .Where(c => c.Status == CompanyStatus.Approved && c.VerifiedAt != null)
            .OrderByDescending(c => c.VerifiedAt)
            .Take(5)
            .Select(c => new RecentCompanyDto
            {
                CompanyId = c.Id,
                Name = c.Name,
                CreatedAt = c.VerifiedAt.Value,
                Status = c.Status
            })
            .ToListAsync();

        dashboard.RecentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                Amount = o.Amount,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        dashboard.RecentJobs = await _context.Jobs
            .OrderByDescending(j => j.CreatedAt)
            .Take(5)
            .Select(j => new RecentJobDto
            {
                JobId = j.JobId,
                Title = j.Title,
                CreatedAt = j.CreatedAt
            })
            .ToListAsync();

        return dashboard;
    }
}
