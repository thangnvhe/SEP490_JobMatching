using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ICandidateJobRepository _candidateJobRepository;

        public ReportService(IReportRepository reportRepository,
                           UserManager<ApplicationUser> userManager,
                           ApplicationDbContext context,
                           IEmailService emailService,
                           ICandidateJobRepository candidateJobRepository)
        {
            _reportRepository = reportRepository;
            _userManager = userManager;
            _context = context;
            _emailService = emailService;
            _candidateJobRepository = candidateJobRepository;
        }        public async Task<Report> GetReportByIdAsync(int id)
        {
            var report = await _reportRepository.GetByIdAsync(id);
            if (report == null)
                throw new AppException(ErrorCode.NotFoundReport());

            return report;
        }

        public async Task CensorReportAsync(int id, int adminId, CensorReportRequest request)
        {
            var admin = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == adminId);
            if (admin == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var report = await _reportRepository.GetByIdAsync(id);
            if (report == null)
                throw new AppException(ErrorCode.NotFoundReport());

            if (request.Status != ReportStatus.Approved && request.Status != ReportStatus.Rejected)
                throw new AppException(ErrorCode.InvalidStatus());

            // Update report status
            report.VerifiedId = admin.Id;
            report.Status = request.Status;
            report.Note = request.Note;
            report.VerifiedAt = DateTime.UtcNow;

            await _reportRepository.UpdateAsync(report);

            // Handle different scenarios based on approval/rejection
            if (request.Status == ReportStatus.Approved)
            {
                await HandleApprovedReportAsync(report);
            }
            else if (request.Status == ReportStatus.Rejected)
            {
                await HandleRejectedReportAsync(report);
            }
        }

        private async Task HandleApprovedReportAsync(Report report)
        {
            // Get the job and its company with includes
            var job = await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.Recruiter)
                .FirstOrDefaultAsync(j => j.JobId == report.JobId);

            if (job?.Company == null) return;

            var company = job.Company;
            
            // Deduct points from company (reduced penalties)
            var pointsToDeduct = CalculateCompanyPenalty(report.Subject);
            var currentScore = company.Score;
            var newScore = Math.Max(0, currentScore - pointsToDeduct);
            
            company.Score = newScore;
            _context.Companies.Update(company);
            
            // Close the reported job
            job.Status = JobStatus.Closed;
            _context.Jobs.Update(job);
            
            await _context.SaveChangesAsync();

            // Send notification to recruiter about job closure
            if (job.Recruiter != null && !string.IsNullOrEmpty(job.Recruiter.Email))
            {
                try
                {
                    await _emailService.SendJobClosedDueToReportAsync(
                        job.Recruiter.Email,
                        job.Recruiter.FullName ?? "Recruiter",
                        job.Title,
                        company.Name,
                        report.Reason);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send job closure notification to recruiter: {ex.Message}");
                }
            }

            // Get all candidates who applied to this job and notify them
            await NotifyCandidatesAboutJobClosure(job.JobId, job.Title, company.Name);

            // Check if company should be suspended (score < 50)
            if (newScore < 50 && company.IsActive)
            {
                await SuspendCompanyAsync(company, "Điểm tín nhiệm quá thấp do vi phạm quy định");
            }
        }

        private async Task HandleRejectedReportAsync(Report report)
        {
            // Get the reporter (user who made the false report)
            var reporter = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == report.ReporterId);
            if (reporter == null) return;

            // Deduct points from reporter for false report (reduced penalty)
            var pointsToDeduct = CalculateReporterPenalty(report.Subject);
            var currentScore = reporter.Score ?? 100;
            var newScore = Math.Max(0, currentScore - pointsToDeduct);
            
            reporter.Score = newScore;
            await _userManager.UpdateAsync(reporter);

            // Get job info for email
            var job = await _context.Jobs
                .Include(j => j.Company)
                .FirstOrDefaultAsync(j => j.JobId == report.JobId);

            // Send notification about false report
            try
            {
                await _emailService.SendFalseReportNotificationAsync(
                    reporter.Email,
                    reporter.FullName ?? "User",
                    job?.Title ?? "N/A",
                    job?.Company?.Name ?? "N/A");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send false report notification: {ex.Message}");
            }

            // Check if reporter should be suspended (score < 50)
            if (newScore < 50 && reporter.IsActive)
            {
                await SuspendUserAsync(reporter, "Điểm tín nhiệm quá thấp do báo cáo sai nhiều lần");
            }
        }

        private async Task NotifyCandidatesAboutJobClosure(int jobId, string jobTitle, string companyName)
        {
            var candidateApplications = await _candidateJobRepository.GetCandidateJobsByJobIdAsync(jobId);

            foreach (var application in candidateApplications)
            {
                // Update application status
                if (application.Status == CandidateJobStatus.Pending || 
                    application.Status == CandidateJobStatus.Processing)
                {
                    application.Status = CandidateJobStatus.Fail;
                    await _candidateJobRepository.UpdateAsync(application);
                }

                // Send notification email to candidate
                if (application.CVUpload?.User != null && !string.IsNullOrEmpty(application.CVUpload.User.Email))
                {
                    try
                    {
                        await _emailService.SendJobDeletedNotificationAsync(
                            application.CVUpload.User.Email,
                            application.CVUpload.User.FullName ?? "Candidate",
                            jobTitle,
                            companyName);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Failed to send job closure notification to candidate: {ex.Message}");
                    }
                }
            }
        }

        private int CalculateCompanyPenalty(ReportType reportType)
        {
            return reportType switch
            {
                ReportType.FraudulentJobPosting => 15,  // Tin tuyển dụng gian lận (giảm từ 25)
                ReportType.Spam => 5,                    // Spam (giảm từ 10)
                ReportType.InappropriateContent => 8,    // Nội dung không phù hợp (giảm từ 15)
                ReportType.Other => 6,                   // Khác (giảm từ 12)
                _ => 8                                    // Mặc định
            };
        }

        private int CalculateReporterPenalty(ReportType reportType)
        {
            return reportType switch
            {
                ReportType.FraudulentJobPosting => 8,   // Báo cáo sai về gian lận
                ReportType.Spam => 3,                    // Báo cáo sai về spam
                ReportType.InappropriateContent => 5,    // Báo cáo sai về nội dung
                ReportType.Other => 4,                   // Báo cáo sai khác
                _ => 5                                    // Mặc định
            };
        }

        private async Task SuspendCompanyAsync(Company company, string reason)
        {
            // Deactivate company
            company.IsActive = false;
            _context.Companies.Update(company);

            // Deactivate all company users
            var companyUsers = await _userManager.Users
                .Where(u => u.CompanyId == company.Id && u.IsActive)
                .ToListAsync();

            foreach (var user in companyUsers)
            {
                user.IsActive = false;
                await _userManager.UpdateAsync(user);
            }

            // Close all active company jobs
            var activeJobs = await _context.Jobs
                .Where(j => j.CompanyId == company.Id && 
                           (j.Status == JobStatus.Opened || j.Status == JobStatus.Draft || j.Status == JobStatus.Moderated))
                .ToListAsync();

            foreach (var job in activeJobs)
            {
                job.Status = JobStatus.Closed;
            }

            await _context.SaveChangesAsync();

            // Send suspension emails to company users
            foreach (var user in companyUsers.Where(u => !string.IsNullOrEmpty(u.Email)))
            {
                try
                {
                    await _emailService.SendAccountSuspensionNotificationAsync(
                        user.Email,
                        user.FullName ?? "User",
                        reason,
                        true); // isCompany = true
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send company suspension notification: {ex.Message}");
                }
            }
        }

        private async Task SuspendUserAsync(ApplicationUser user, string reason)
        {
            // Deactivate user account
            user.IsActive = false;
            await _userManager.UpdateAsync(user);

            // Update their job applications
            var candidateApplications = await _candidateJobRepository.GetByUserIdAsync(
                user.Id, 
                string.Empty, 
                "AppliedAt", 
                false
            );

            var activeApplications = candidateApplications
                .Where(cj => cj.Status == CandidateJobStatus.Pending || cj.Status == CandidateJobStatus.Processing)
                .ToList();

            foreach (var application in activeApplications)
            {
                application.Status = CandidateJobStatus.Fail;
                await _candidateJobRepository.UpdateAsync(application);
            }

            // Send notification email
            try
            {
                await _emailService.SendAccountSuspensionNotificationAsync(
                    user.Email,
                    user.FullName ?? "User",
                    reason,
                    false); // isCompany = false
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send user suspension notification: {ex.Message}");
            }
        }


        public async Task CreateReportAsync(CreateReportRequest request, int userId)
        {
            // Check user
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            // Check job
            var job = await _context.Jobs.FirstOrDefaultAsync(x => x.JobId == request.JobId);
            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            var report = new Report
            {
                JobId = request.JobId,
                ReporterId = user.Id,
                Subject = request.Subject,
                Reason = request.Reason,
                VerifiedId = null,
                Note = null,
                Status = ReportStatus.Pending
            };

            await _reportRepository.CreateAsync(report);
        }

        public async Task<PagedResult<ReportDetailResponse>> GetReportsPagedAsync(GetReportPagedRequest request)
        {
            var reports = await _reportRepository.GetAllReportsPagedAsync(request);

            if (reports == null || !reports.Any())
            {
                return new PagedResult<ReportDetailResponse>
                {
                    Items = new List<ReportDetailResponse>(),
                    pageInfo = new PageInfo(0, request.page, request.size, request.sortBy ?? "", request.isDescending)
                };
            }

            var pagedReports = reports
                .Skip((request.page - 1) * request.size)
                .Take(request.size)
                .ToList();

            var reportDtos = pagedReports.Select(r => new ReportDetailResponse
            {
                Id = r.Id,
                JobId = r.JobId,
                ReporterId = r.ReporterId,
                VerifiedById = r.VerifiedId,
                Subject = r.Subject.ToString(),
                Reason = r.Reason,
                Note = r.Note,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt,
                VerifiedAt = r.VerifiedAt
            }).ToList();

            return new PagedResult<ReportDetailResponse>
            {
                Items = reportDtos,
                pageInfo = new PageInfo(reports.Count, request.page, request.size, request.sortBy ?? "", request.isDescending)
            };
        }
    }
}
