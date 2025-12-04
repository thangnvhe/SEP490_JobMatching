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

        public async Task<Job?> GetById(int id)
        {
            return await _context.Jobs.FindAsync(id);
        }

        public async Task UpdateAsync(Job job)
        {
            _context.Jobs.Update(job);
            await _context.SaveChangesAsync();
        }

        public async Task<(List<Job> jobs, int totalCount)> GetAllJobsPagedWithCount(GetJobPagedRequest request)
        {
            IQueryable<Job> query = _context.Jobs
                .Include(j => j.JobTaxonomies)
                    .ThenInclude(jt => jt.Taxonomy)
                .Include(j => j.Company)
                .Include(j => j.Position)
                .AsQueryable();

            // Tìm kiếm tổng quát (title, description, location)
            if (!string.IsNullOrWhiteSpace(request.search))
            {
                var searchLower = request.search.ToLower();
                query = query.Where(j =>
                    j.Title.ToLower().Contains(searchLower));
            }

            // Lọc theo các field
            if (!string.IsNullOrEmpty(request.title))
                query = query.Where(j => j.Title.Contains(request.title));
            if (!string.IsNullOrEmpty(request.description))
                query = query.Where(j => j.Description.Contains(request.description));
            if (!string.IsNullOrEmpty(request.requirements))
                query = query.Where(j => j.Requirements.Contains(request.requirements));
            if (!string.IsNullOrEmpty(request.benefits))
                query = query.Where(j => j.Benefits.Contains(request.benefits));
            if (!string.IsNullOrEmpty(request.location))
                query = query.Where(j => j.Location.Contains(request.location));

            // Xử lý salary filtering
            if (request.salaryMin.HasValue && request.salaryMax.HasValue &&
                request.salaryMin.Value == -1 && request.salaryMax.Value == -1)
            {
                // Thỏa thuận - jobs không có salary hoặc có salary null/0
                query = query.Where(j => (j.SalaryMin == null || j.SalaryMin == 0) && 
                                        (j.SalaryMax == null || j.SalaryMax == 0));
            }
            else
            {
                // Range cụ thể
                if (request.salaryMin.HasValue && request.salaryMin.Value != -1)
                    query = query.Where(j => j.SalaryMax >= request.salaryMin.Value);
                if (request.salaryMax.HasValue && request.salaryMax.Value != -1)
                    query = query.Where(j => j.SalaryMin <= request.salaryMax.Value);
            }

            if (!string.IsNullOrEmpty(request.jobType))
            {
                if (request.jobType.ToLower() == "other")
                {
                    // Other = không phải FullTime, PartTime, Remote
                    query = query.Where(j => !j.JobType.ToLower().Contains("fulltime") && 
                                            !j.JobType.ToLower().Contains("parttime") && 
                                            !j.JobType.ToLower().Contains("remote"));
                }
                else
                {
                    // Exact match cho FullTime, PartTime, Remote
                    query = query.Where(j => j.JobType.ToLower().Contains(request.jobType.ToLower()));
                }
            }

            if (request.status.HasValue)
                query = query.Where(j => j.Status == request.status.Value);
            if (request.positionId.HasValue)
                query = query.Where(j => j.PositionId == request.positionId.Value);

            // Thay đổi logic experience filtering
            if (request.experienceYearMin.HasValue && request.experienceYearMax.HasValue &&
                request.experienceYearMin.Value == -1 && request.experienceYearMax.Value == -1)
            {
                // User chọn "Không yêu cầu kinh nghiệm" - chỉ lấy jobs không yêu cầu
                query = query.Where(j => j.ExperienceYear == null);
            }
            else
            {
                // User chọn khoảng kinh nghiệm cụ thể - chỉ lấy jobs có ExperienceYear trong khoảng đó
                if (request.experienceYearMin.HasValue && request.experienceYearMin.Value != -1)
                    query = query.Where(j => j.ExperienceYear != null && j.ExperienceYear >= request.experienceYearMin.Value);
                if (request.experienceYearMax.HasValue && request.experienceYearMax.Value != -1)
                    query = query.Where(j => j.ExperienceYear != null && j.ExperienceYear <= request.experienceYearMax.Value);
            }

            if (request.companyId.HasValue)
                query = query.Where(j => j.CompanyId == request.companyId.Value);
            if (request.recuiterId.HasValue)
                query = query.Where(j => j.RecuiterId == request.recuiterId.Value);
            
            // Xử lý isDeleted filter
            if (request.isDeleted.HasValue)
            {
                query = query.Where(j => j.IsDeleted == request.isDeleted.Value);
            }
            // Nếu không truyền isDeleted thì hiển thị tất cả (bao gồm cả đã xóa và chưa xóa)

            if (request.taxonomyIds != null && request.taxonomyIds.Any())
            {
                foreach (var taxonomyId in request.taxonomyIds)
                {
                    query = query.Where(j => j.JobTaxonomies.Any(jt => jt.TaxonomyId == taxonomyId));
                }
            }

            // Sắp xếp động
            if (!string.IsNullOrWhiteSpace(request.sortBy))
            {
                var propertyInfo = typeof(Job).GetProperty(request.sortBy);
                if (propertyInfo != null)
                {
                    query = request.isDescending
                        ? query.OrderByDescending(x => EF.Property<object>(x, request.sortBy))
                        : query.OrderBy(x => EF.Property<object>(x, request.sortBy));
                }
                else
                {
                    query = query
                           .OrderByDescending(j => j.IsHighlighted)
                           .ThenByDescending(j => j.JobId);  // default descending
                }
            }
            else
            {
                query = query
                           .OrderByDescending(j => j.IsHighlighted)
                           .ThenByDescending(j => j.JobId); // default descending
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var jobs = await query
                .Skip((request.page - 1) * request.size)
                .Take(request.size)
                .ToListAsync();
                
            return (jobs, totalCount);
        }

        public async Task<List<Job>> GetAllJobsPaged(GetJobPagedRequest request)
        {
            var (jobs, _) = await GetAllJobsPagedWithCount(request);
            return jobs;
        }

        public async Task<List<Job>> GetJobsByRecruiterIdAsync(int recruiterId)
        {
            return await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.CandidateJobs)
                    .ThenInclude(cj => cj.CVUpload)
                .Where(j => j.RecuiterId == recruiterId && !j.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Job>> GetJobsByCompanyIdAsync(int companyId)
        {
            return await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.CandidateJobs)
                    .ThenInclude(cj => cj.CVUpload)
                .Where(j => j.CompanyId == companyId && !j.IsDeleted)
                .ToListAsync();
        }
    }
}