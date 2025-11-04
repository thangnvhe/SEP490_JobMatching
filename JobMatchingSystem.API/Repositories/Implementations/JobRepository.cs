using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class JobRepository : IJobRepository
    {
        private readonly ApplicationDbContext _context;

        public JobRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Job job)
        {
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();
        }

        public async Task<Job?> GetByIdAsync(int id)
        {
            return await _context.Jobs.Where(j => j.IsDeleted == false)
                .FirstOrDefaultAsync(j => j.JobId == id);
        }

        public async Task UpdateAsync(Job job)
        {
            _context.Jobs.Update(job);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Job>> GetAllAsync(string? title, int? salaryMin, int? salaryMax, string? location, JobType? jobType, JobStatus? status, int? companyId, int? poster, List<int>? taxonomyIds)
        {
            var query = _context.Jobs.Where(j => j.IsDeleted == false)
                .AsQueryable();

            if (!string.IsNullOrEmpty(title))
                query = query.Where(j => j.Title!.Contains(title));

            if (salaryMin.HasValue)
                query = query.Where(j => j.SalaryMin >= salaryMin.Value);

            if (salaryMax.HasValue)
                query = query.Where(j => j.SalaryMax <= salaryMax.Value);

            if (!string.IsNullOrEmpty(location))
                query = query.Where(j => j.Location!.Contains(location));

            if (jobType.HasValue)
                query = query.Where(j => j.JobType == jobType.Value);

            if (status.HasValue)
                query = query.Where(j => j.Status == status.Value);

            if (companyId.HasValue)
                query = query.Where(j => j.CompanyId == companyId.Value);

            if (poster.HasValue)
                query = query.Where(j => j.Poster == poster.Value);

            // ✅ Filter theo taxonomy ID (job phải có đủ tất cả taxonomy ID được truyền vào)
            if (taxonomyIds != null && taxonomyIds.Any())
            {
                var jobIds = await _context.EntityTaxonomies
                    .Where(et => et.EntityType == EntityType.Job && taxonomyIds.Contains(et.TaxonomyId))
                    .GroupBy(et => et.EntityId)
                    .Where(g => taxonomyIds.All(id => g.Select(x => x.TaxonomyId).Contains(id)))
                    .Select(g => g.Key)
                    .ToListAsync();

                query = query.Where(j => jobIds.Contains(j.JobId));
            }

            var result = await query.ToListAsync();

            if (result == null || result.Count == 0)
                throw new AppException(ErrorCode.NotFoundJob());

            return result;
        }
    }
}
