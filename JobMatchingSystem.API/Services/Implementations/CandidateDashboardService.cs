using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class CandidateDashboardService : ICandidateDashboardService
{
    private readonly ApplicationDbContext _context;

    public CandidateDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CandidateDashboardResponse> GetDashboardDataAsync(int candidateId)
    {
        var now = DateTime.UtcNow;
        var next7Days = now.AddDays(7);

        var response = new CandidateDashboardResponse();

        // ===== 1. Total applied jobs =====
        var appliedQuery = _context.CandidateJobs
            .Where(cj => cj.CVUpload.UserId == candidateId);

        response.TotalAppliedJobs = await appliedQuery.CountAsync();

        // ===== 2. Recent applied jobs =====
        response.RecentAppliedJobs = await appliedQuery
            .OrderByDescending(cj => cj.AppliedAt)
            .Take(5)
            .Select(cj => new AppliedJobDto
            {
                JobId = cj.JobId,
                JobTitle = cj.Job.Title,
                AppliedAt = cj.AppliedAt
            })
            .ToListAsync();

        // ===== 3. Upcoming candidate stages within 7 days =====
        var today = DateOnly.FromDateTime(now);
        var next7DaysDate = DateOnly.FromDateTime(next7Days);
        
        var stages = await _context.CandidateStages
            .Where(cs => cs.CandidateJob.CVUpload.UserId == candidateId &&
                         cs.InterviewDate != null &&
                         cs.InterviewDate >= today &&
                         cs.InterviewDate <= next7DaysDate)
            .OrderBy(cs => cs.InterviewDate)
            .ThenBy(cs => cs.InterviewStartTime)
            .Select(cs => new UpcomingStageDto
            {
                JobTitle = cs.CandidateJob.Job.Title,
                StageName = cs.JobStage.Name,
                ScheduleTime = cs.InterviewDate.HasValue && cs.InterviewStartTime.HasValue
                    ? cs.InterviewDate.Value.ToDateTime(cs.InterviewStartTime.Value)
                    : (DateTime?)null
            })
            .ToListAsync();

        response.UpcomingStages = stages;
        response.UpcomingInterviewCount = stages.Count;

        // ===== 4. Total saved jobs =====
        response.TotalSavedJobs = await _context.SavedJobs
            .Where(s => s.UserId == candidateId)
            .CountAsync();

        // ===== 5. Recent saved jobs =====
        response.RecentSavedJobs = await _context.SavedJobs
            .Where(s => s.UserId == candidateId)
            .OrderByDescending(s => s.Id)
            .Take(5)
            .Select(s => new SavedJobDto
            {
                JobId = s.JobId,
                JobTitle = s.Job.Title,
                SavedAt = s.Job.CreatedAt
            })
            .ToListAsync();

        // ===== 6. Total reports =====
        response.TotalReports = await _context.Reports
            .Where(r => r.ReporterId == candidateId)
            .CountAsync();

        return response;
    }
}
