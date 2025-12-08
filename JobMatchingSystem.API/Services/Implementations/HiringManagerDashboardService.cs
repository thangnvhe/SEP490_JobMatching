using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class HiringManagerDashboardService : IHiringManagerDashboardService
    {
        private readonly ApplicationDbContext _context;

        public HiringManagerDashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<HiringManagerDashboardResponse> GetDashboardDataAsync(int hiringManagerId)
        {
            var now = DateTime.UtcNow;
            var next7Days = now.AddDays(7);
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);

            var response = new HiringManagerDashboardResponse();

            // Get all stages assigned to this hiring manager
            var assignedStages = await _context.CandidateStages
                .Include(cs => cs.CandidateJob)
                    .ThenInclude(cj => cj.Job)
                .Include(cs => cs.CandidateJob)
                    .ThenInclude(cj => cj.CVUpload)
                        .ThenInclude(cv => cv.User)
                .Include(cs => cs.JobStage)
                .Where(cs => cs.JobStage.HiringManagerId == hiringManagerId)
                .ToListAsync();

            // ===== 1. Tổng số ứng viên đã review (có feedback) =====
            response.TotalReviewedCandidates = assignedStages
                .Count(cs => !string.IsNullOrEmpty(cs.HiringManagerFeedback));

            // ===== 2. Số ứng viên chờ đánh giá (chưa có feedback và đã qua phỏng vấn hoặc không có lịch) =====
            response.PendingReviewCount = assignedStages
                .Count(cs => string.IsNullOrEmpty(cs.HiringManagerFeedback) && 
                            (cs.InterviewDate == null || 
                             (cs.InterviewDate.HasValue && cs.InterviewDate.Value.ToDateTime(TimeOnly.MinValue) <= now)));

            // ===== 3. 5 ứng viên chờ đánh giá gần nhất =====
            var pendingReviews = assignedStages
                .Where(cs => string.IsNullOrEmpty(cs.HiringManagerFeedback) &&
                            (cs.InterviewDate == null || 
                             (cs.InterviewDate.HasValue && cs.InterviewDate.Value.ToDateTime(TimeOnly.MinValue) <= now)))
                .OrderBy(cs => cs.InterviewDate ?? DateOnly.MinValue)
                .Take(5)
                .Select(cs => new PendingReviewDto
                {
                    CandidateStageId = cs.Id,
                    CandidateJobId = cs.CandidateJobId,
                    CandidateName = cs.CandidateJob.CVUpload.User.FullName ?? "N/A",
                    JobTitle = cs.CandidateJob.Job.Title,
                    StageName = cs.JobStage.Name,
                    SubmittedAt = cs.InterviewDate.HasValue && cs.InterviewStartTime.HasValue
                        ? cs.InterviewDate.Value.ToDateTime(cs.InterviewStartTime.Value)
                        : (DateTime?)null,
                    InterviewLocation = cs.InterviewLocation,
                    GoogleMeetLink = cs.GoogleMeetLink
                })
                .ToList();

            response.PendingReviews = pendingReviews;

            // ===== 4. Số buổi phỏng vấn sắp diễn ra (7 ngày tới) =====
            var today = DateOnly.FromDateTime(now);
            var next7DaysDate = DateOnly.FromDateTime(next7Days);

            response.UpcomingInterviewCount = assignedStages
                .Count(cs => cs.InterviewDate.HasValue &&
                            cs.InterviewDate.Value >= today &&
                            cs.InterviewDate.Value <= next7DaysDate &&
                            string.IsNullOrEmpty(cs.HiringManagerFeedback));

            // ===== 5. 5 buổi phỏng vấn sắp diễn ra =====
            var upcomingInterviews = assignedStages
                .Where(cs => cs.InterviewDate.HasValue &&
                            cs.InterviewDate.Value >= today &&
                            cs.InterviewDate.Value <= next7DaysDate &&
                            string.IsNullOrEmpty(cs.HiringManagerFeedback))
                .OrderBy(cs => cs.InterviewDate)
                .ThenBy(cs => cs.InterviewStartTime)
                .Take(5)
                .Select(cs => new UpcomingInterviewDto
                {
                    CandidateStageId = cs.Id,
                    CandidateJobId = cs.CandidateJobId,
                    CandidateName = cs.CandidateJob.CVUpload.User.FullName ?? "N/A",
                    JobTitle = cs.CandidateJob.Job.Title,
                    StageName = cs.JobStage.Name,
                    InterviewDateTime = cs.InterviewDate.HasValue && cs.InterviewStartTime.HasValue
                        ? cs.InterviewDate.Value.ToDateTime(cs.InterviewStartTime.Value)
                        : (DateTime?)null,
                    InterviewLocation = cs.InterviewLocation,
                    GoogleMeetLink = cs.GoogleMeetLink
                })
                .ToList();

            response.UpcomingInterviews = upcomingInterviews;

            // ===== 6. Thống kê theo trạng thái trong tháng =====
            response.ApprovedThisMonth = assignedStages
                .Count(cs => cs.Status == CandidateStageStatus.Passed &&
                            !string.IsNullOrEmpty(cs.HiringManagerFeedback) &&
                            cs.InterviewDate.HasValue &&
                            cs.InterviewDate.Value.ToDateTime(TimeOnly.MinValue) >= startOfMonth &&
                            cs.InterviewDate.Value.ToDateTime(TimeOnly.MinValue) < endOfMonth);

            response.RejectedThisMonth = assignedStages
                .Count(cs => cs.Status == CandidateStageStatus.Failed &&
                            !string.IsNullOrEmpty(cs.HiringManagerFeedback) &&
                            cs.InterviewDate.HasValue &&
                            cs.InterviewDate.Value.ToDateTime(TimeOnly.MinValue) >= startOfMonth &&
                            cs.InterviewDate.Value.ToDateTime(TimeOnly.MinValue) < endOfMonth);

            return response;
        }
    }
}
