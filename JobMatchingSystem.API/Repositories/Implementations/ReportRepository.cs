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

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchLower = request.Search.ToLower();
                query = query.Where(r =>
                    r.Reason.ToLower().Contains(searchLower) ||
                    r.Note.ToLower().Contains(searchLower));
            }

            if (request.JobId.HasValue)
                query = query.Where(r => r.JobId == request.JobId.Value);
            if (request.ReporterId.HasValue)
                query = query.Where(r => r.ReporterId == request.ReporterId.Value);
            if (request.VerifiedById.HasValue)
                query = query.Where(r => r.VerifiedId == request.VerifiedById.Value);
            if (request.Status.HasValue)
                query = query.Where(r => r.Status == request.Status.Value);
            if (request.Subject.HasValue)
                query = query.Where(r => r.Subject == request.Subject.Value);

            // Filter theo khoảng ngày tạo
            if (request.CreateMin.HasValue)
                query = query.Where(r => r.CreatedAt >= request.CreateMin.Value);
            if (request.CreateMax.HasValue)
                query = query.Where(r => r.CreatedAt <= request.CreateMax.Value);

            // Sắp xếp động
            if (!string.IsNullOrWhiteSpace(request.SortBy))
            {
                var propertyInfo = typeof(Report).GetProperty(request.SortBy);
                if (propertyInfo != null)
                {
                    query = request.IsDescending
                        ? query.OrderByDescending(x => EF.Property<object>(x, request.SortBy))
                        : query.OrderBy(x => EF.Property<object>(x, request.SortBy));
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
