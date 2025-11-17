using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
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
    }
}
