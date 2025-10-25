using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
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
                CreatedAt = DateTime.UtcNow,
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
                    CreatedAt = DateTime.UtcNow
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
    }
}
