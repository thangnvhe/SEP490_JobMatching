using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class JobService : IJobService
    {
        private readonly IJobRepository _jobRepository;
        private readonly ApplicationDbContext _context;

        public JobService(IJobRepository jobRepository, ApplicationDbContext context)
        {
            _jobRepository = jobRepository;
            _context = context;
        }

        public async Task<JobResponse?> GetJobByIdAsync(int id)
        {
            var job = await _jobRepository.GetByIdAsync(id);
            if (job == null || job.IsDeleted == true)
                throw new AppException(ErrorCode.NotFoundJob());

            return new JobResponse
            {
                JobId = job.JobId,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                Benefits = job.Benefits,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                Location = job.Location,
                WorkInfo = job.WorkInfo,
                JobType = job.JobType,
                Status = job.Status,
                ViewsCount = job.ViewsCount,
                AppliesCount = job.AppliesCount,
                CompanyId = job.CompanyId,
                Poster = job.Poster,
                VerifiedBy = job.VerifiedBy,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                IsDeleted = job.IsDeleted
            };
        }

        public async Task CreateJobAsync(CreateJobRequest request, int recruiterId)
        {
            // Lấy recruiter và công ty của recruiter đó
            var recruiter = await _context.CompanyRecruiters
                .Include(cr => cr.Company)
                .FirstOrDefaultAsync(cr => cr.UserId == recruiterId);

            if (recruiter == null)
                throw new AppException(ErrorCode.NotFoundRecruiter());

            var company = recruiter.Company;
            if (company == null)
                throw new AppException(ErrorCode.NotFoundCompany());

            if (request.SalaryMin >= request.SalaryMax)
                throw new AppException(ErrorCode.SalaryError());

            // Tạo Job mới
            var job = new Job
            {
                Title = request.Title,
                Description = request.Description,
                Requirements = request.Requirements,
                Benefits = request.Benefits,
                SalaryMin = request.SalaryMin,
                SalaryMax = request.SalaryMax,
                Location = request.Location,
                WorkInfo = request.WorkInfo,
                JobType = request.JobType,
                Status = JobStatus.Draft,
                CompanyId = company.CompanyId, // ✅ Tự động lấy
                Poster = recruiterId,          // ✅ Tự động lấy
                CreatedAt = DateTime.Now,
                OpenedAt = request.OpenedAt,
                ExpiredAt = request.ExpiredAt
            };

            await _jobRepository.AddAsync(job);
            await _context.SaveChangesAsync();

            // Thêm taxonomy (Skill, Category)
            if (request.TaxonomyIds != null && request.TaxonomyIds.Any())
            {
                var entityTaxonomies = request.TaxonomyIds.Select(id => new EntityTaxonomy
                {
                    EntityType = EntityType.Job,
                    EntityId = job.JobId,
                    TaxonomyId = id,
                    CreatedAt = DateTime.Now
                }).ToList();

                await _context.EntityTaxonomies.AddRangeAsync(entityTaxonomies);
            }

            // Thêm stage (nếu có)
            if (request.Stages != null && request.Stages.Any())
            {
                var jobStages = request.Stages.Select(s => new JobStage
                {
                    JobId = job.JobId,
                    StageNumber = s.StageNumber,
                    Type = s.Type
                }).ToList();

                await _context.JobStages.AddRangeAsync(jobStages);
            }

            await _context.SaveChangesAsync();
        }

        public async Task ReviewJobAsync(CensorJobRequest request, int staffId)
        {
            var job = await _jobRepository.GetByIdAsync(request.JobId);
            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            if (request.Status != JobStatus.Moderated && request.Status != JobStatus.Rejected)
                throw new AppException(ErrorCode.InvalidStatus());

            job.Status = request.Status;
            job.VerifiedBy = staffId;

            await _jobRepository.UpdateAsync(job);
        }

        public async Task UpdateJobAsync(int jobId, CreateJobRequest request)
        {
            var job = await _jobRepository.GetByIdAsync(jobId);
            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            if (request.SalaryMin >= request.SalaryMax)
                throw new AppException(ErrorCode.SalaryError());

            job.Title = request.Title;
            job.Description = request.Description;
            job.Requirements = request.Requirements;
            job.Benefits = request.Benefits;
            job.SalaryMin = request.SalaryMin;
            job.SalaryMax = request.SalaryMax;
            job.Location = request.Location;
            job.WorkInfo = request.WorkInfo;
            job.JobType = request.JobType;
            job.OpenedAt = request.OpenedAt;
            job.ExpiredAt = request.ExpiredAt;
            job.Status = JobStatus.Draft;
            job.CreatedAt = DateTime.Now;

            await _jobRepository.UpdateAsync(job);

            // Xóa taxonomy và stage cũ
            var oldTaxonomies = _context.EntityTaxonomies.Where(e => e.EntityType == EntityType.Job && e.EntityId == job.JobId);
            _context.EntityTaxonomies.RemoveRange(oldTaxonomies);
            var oldStages = _context.JobStages.Where(s => s.JobId == job.JobId);
            _context.JobStages.RemoveRange(oldStages);

            // Thêm taxonomy mới
            if (request.TaxonomyIds != null && request.TaxonomyIds.Any())
            {
                var entityTaxonomies = request.TaxonomyIds.Select(id => new EntityTaxonomy
                {
                    EntityType = EntityType.Job,
                    EntityId = job.JobId,
                    TaxonomyId = id,
                    CreatedAt = DateTime.Now
                }).ToList();
                await _context.EntityTaxonomies.AddRangeAsync(entityTaxonomies);
            }

            // Thêm stage mới
            if (request.Stages != null && request.Stages.Any())
            {
                var jobStages = request.Stages.Select(s => new JobStage
                {
                    JobId = job.JobId,
                    StageNumber = s.StageNumber,
                    Type = s.Type
                }).ToList();
                await _context.JobStages.AddRangeAsync(jobStages);
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteJobAsync(int jobId)
        {
            var job = await _jobRepository.GetByIdAsync(jobId);
            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            // Không cho xóa nếu đã có ứng tuyển
            if (job.AppliesCount > 0)
                throw new AppException(ErrorCode.CantDelete());

            job.IsDeleted = true;
            await _jobRepository.UpdateAsync(job);
        }


        public async Task<List<JobResponse>> GetAllJobsAsync(string? title, int? salaryMin, int? salaryMax, string? location, JobType? jobType, JobStatus? status, int? companyId, int? poster, List<int>? taxonomyIds)
        {
            var jobs = await _jobRepository.GetAllAsync(title, salaryMin, salaryMax, location, jobType, status, companyId, poster, taxonomyIds);

            return jobs.Select(j => new JobResponse
            {
                JobId = j.JobId,
                Title = j.Title,
                Description = j.Description,
                Requirements = j.Requirements,
                Benefits = j.Benefits,
                SalaryMin = j.SalaryMin,
                SalaryMax = j.SalaryMax,
                Location = j.Location,
                WorkInfo = j.WorkInfo,
                JobType = j.JobType,
                Status = j.Status,
                ViewsCount = j.ViewsCount,
                AppliesCount = j.AppliesCount,
                CompanyId = j.CompanyId,
                Poster = j.Poster,
                VerifiedBy = j.VerifiedBy,
                CreatedAt = j.CreatedAt,
                OpenedAt = j.OpenedAt,
                ExpiredAt = j.ExpiredAt,
                IsDeleted = j.IsDeleted
            }).ToList();
        }

    }
}
