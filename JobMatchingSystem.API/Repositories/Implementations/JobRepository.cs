using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;
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

        public async Task CreateAsync(Job job)
        {
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Job>> GetJobsAsync(GetJobRequest request)
        {
            var query = _context.Jobs
                .Include(j => j.JobTaxonomies)
                    .ThenInclude(jt => jt.Taxonomy)
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Title))
                query = query.Where(j => j.Title.Contains(request.Title));
            if (!string.IsNullOrEmpty(request.Description))
                query = query.Where(j => j.Description.Contains(request.Description));
            if (!string.IsNullOrEmpty(request.Requirements))
                query = query.Where(j => j.Requirements.Contains(request.Requirements));
            if (!string.IsNullOrEmpty(request.Benefits))
                query = query.Where(j => j.Benefits.Contains(request.Benefits));
            if (!string.IsNullOrEmpty(request.Location))
                query = query.Where(j => j.Location.Contains(request.Location));
            if (request.SalaryMin.HasValue)
                query = query.Where(j => j.SalaryMax >= request.SalaryMin);
            if (request.SalaryMax.HasValue)
                query = query.Where(j => j.SalaryMin <= request.SalaryMax);
            if (!string.IsNullOrEmpty(request.JobType))
                query = query.Where(j => j.JobType.Contains(request.JobType));
            if (request.Status.HasValue)
                query = query.Where(j => j.Status == request.Status.Value);
            if (request.ExperienceYear.HasValue)
                query = query.Where(j => j.ExperienceYear == request.ExperienceYear.Value);
            if (request.CompanyId.HasValue)
                query = query.Where(j => j.CompanyId == request.CompanyId.Value);
            if (request.RecuiterId.HasValue)
                query = query.Where(j => j.RecuiterId == request.RecuiterId.Value);

            if (request.TaxonomyIds != null && request.TaxonomyIds.Any())
            {
                foreach (var taxonomyId in request.TaxonomyIds)
                {
                    query = query.Where(j => j.JobTaxonomies.Any(jt => jt.TaxonomyId == taxonomyId));
                }
            }

            return await query.ToListAsync();
        }

        public async Task<List<Job>> GetAllJobsPaged(GetJobPagedRequest request)
        {
            IQueryable<Job> query = _context.Jobs
                .Include(j => j.JobTaxonomies)
                    .ThenInclude(jt => jt.Taxonomy)
                .AsQueryable();

            // Tìm kiếm tổng quát (title, description, location)
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchLower = request.Search.ToLower();
                query = query.Where(j =>
                    j.Title.ToLower().Contains(searchLower) ||
                    j.Benefits.ToLower().Contains(searchLower) ||
                    j.Location.ToLower().Contains(searchLower));
            }

            // Lọc theo các field
            if (!string.IsNullOrEmpty(request.Title))
                query = query.Where(j => j.Title.Contains(request.Title));
            if (!string.IsNullOrEmpty(request.Description))
                query = query.Where(j => j.Description.Contains(request.Description));
            if (!string.IsNullOrEmpty(request.Requirements))
                query = query.Where(j => j.Requirements.Contains(request.Requirements));
            if (!string.IsNullOrEmpty(request.Benefits))
                query = query.Where(j => j.Benefits.Contains(request.Benefits));
            if (!string.IsNullOrEmpty(request.Location))
                query = query.Where(j => j.Location.Contains(request.Location));

            if (request.SalaryMin.HasValue)
                query = query.Where(j => j.SalaryMax >= request.SalaryMin.Value);
            if (request.SalaryMax.HasValue)
                query = query.Where(j => j.SalaryMin <= request.SalaryMax.Value);

            if (!string.IsNullOrEmpty(request.JobType))
                query = query.Where(j => j.JobType.Contains(request.JobType));
            if (request.Status.HasValue)
                query = query.Where(j => j.Status == request.Status.Value);
            if (request.ExperienceYear.HasValue)
                query = query.Where(j => j.ExperienceYear == request.ExperienceYear.Value);
            if (request.CompanyId.HasValue)
                query = query.Where(j => j.CompanyId == request.CompanyId.Value);
            if (request.RecuiterId.HasValue)
                query = query.Where(j => j.RecuiterId == request.RecuiterId.Value);

            if (request.TaxonomyIds != null && request.TaxonomyIds.Any())
            {
                foreach (var taxonomyId in request.TaxonomyIds)
                {
                    query = query.Where(j => j.JobTaxonomies.Any(jt => jt.TaxonomyId == taxonomyId));
                }
            }

            // Sắp xếp động
            if (!string.IsNullOrWhiteSpace(request.SortBy))
            {
                var propertyInfo = typeof(Job).GetProperty(request.SortBy);
                if (propertyInfo != null)
                {
                    query = request.IsDescending
                        ? query.OrderByDescending(x => EF.Property<object>(x, request.SortBy))
                        : query.OrderBy(x => EF.Property<object>(x, request.SortBy));
                }
                else
                {
                    query = query.OrderBy(j => j.JobId); // default
                }
            }
            else
            {
                query = query.OrderBy(j => j.JobId);
            }

            return await query.ToListAsync();
        }
    }
}
