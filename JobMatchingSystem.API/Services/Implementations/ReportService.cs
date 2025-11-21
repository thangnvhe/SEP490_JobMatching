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

namespace JobMatchingSystem.API.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public ReportService(IReportRepository reportRepository,
                             UserManager<ApplicationUser> userManager,
                             ApplicationDbContext context)
        {
            _reportRepository = reportRepository;
            _userManager = userManager;
            _context = context;
        }

        public async Task<Report> GetReportByIdAsync(int id)
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

            report.VerifiedId = admin.Id;
            report.Status = request.Status;
            report.Note = request.Note;
            report.VerifiedAt = DateTime.UtcNow;

            await _reportRepository.UpdateAsync(report);
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
                    pageInfo = new PageInfo(0, request.Page, request.Size, request.SortBy ?? "", request.IsDescending)
                };
            }

            var pagedReports = reports
                .Skip((request.Page - 1) * request.Size)
                .Take(request.Size)
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
                pageInfo = new PageInfo(reports.Count, request.Page, request.Size, request.SortBy ?? "", request.IsDescending)
            };
        }
    }
}
