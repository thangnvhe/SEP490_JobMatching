using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class ReportRepository : IReportRepository
    {
        private readonly ApplicationDbContext _context;

        public ReportRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Report?> GetByIdAsync(int id)
        {
            return await _context.Reports
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task UpdateAsync(Report report)
        {
            _context.Reports.Update(report);
            await _context.SaveChangesAsync();
        }

        public async Task CreateAsync(Report report)
        {
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Report>> GetAllReportsPagedAsync(GetReportPagedRequest request)
        {
            IQueryable<Report> query = _context.Reports.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.search))
            {
                var searchLower = request.search.ToLower();
                query = query.Where(r =>
                    r.Reason.ToLower().Contains(searchLower) ||
                    r.Note.ToLower().Contains(searchLower));
            }

            if (request.jobId.HasValue)
                query = query.Where(r => r.JobId == request.jobId.Value);
            if (request.reporterId.HasValue)
                query = query.Where(r => r.ReporterId == request.reporterId.Value);
            if (request.verifiedById.HasValue)
                query = query.Where(r => r.VerifiedId == request.verifiedById.Value);
            if (request.status.HasValue)
                query = query.Where(r => r.Status == request.status.Value);
            if (request.subject.HasValue)
                query = query.Where(r => r.Subject == request.subject.Value);

            // Filter theo khoảng ngày tạo
            if (request.createMin.HasValue)
                query = query.Where(r => r.CreatedAt >= request.createMin.Value);
            if (request.createMax.HasValue)
                query = query.Where(r => r.CreatedAt <= request.createMax.Value);

            // Sắp xếp động
            if (!string.IsNullOrWhiteSpace(request.sortBy))
            {
                var propertyInfo = typeof(Report).GetProperty(request.sortBy);
                if (propertyInfo != null)
                {
                    query = request.isDescending
                        ? query.OrderByDescending(x => EF.Property<object>(x, request.sortBy))
                        : query.OrderBy(x => EF.Property<object>(x, request.sortBy));
                }
                else
                {
                    query = query.OrderBy(r => r.Id); // default
                }
            }
            else
            {
                query = query.OrderBy(r => r.Id);
            }

            return await query.ToListAsync();
        }
    }
}
