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
    public class JobService : IJobService
    {
        private readonly IJobRepository _jobRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public JobService(IJobRepository jobRepository,
                          UserManager<ApplicationUser> userManager,
                          ApplicationDbContext context)
        {
            _jobRepository = jobRepository;
            _userManager = userManager;
            _context = context;
        }

        public async Task CreateJobAsync(CreateJobRequest request, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            if (user.CompanyId == null)
                throw new AppException(ErrorCode.NotFoundCompany());

            if (request.SalaryMin.HasValue && request.SalaryMax.HasValue &&
                request.SalaryMin >= request.SalaryMax)
            {
                throw new AppException(ErrorCode.SalaryError());
            }

            var job = new Job
            {
                Title = request.Title,
                Description = request.Description,
                Requirements = request.Requirements,
                Benefits = request.Benefits,
                SalaryMin = request.SalaryMin,
                SalaryMax = request.SalaryMax,
                Location = request.Location,
                ExperienceYear = request.ExperienceYear,
                JobType = request.JobType,
                CompanyId = user.CompanyId.Value,
                RecuiterId = user.Id,
                VerifiedBy = null,
                OpenedAt = request.OpenedAt,
                ExpiredAt = request.ExpiredAt,
                Status = JobStatus.Draft
            };

            if (request.JobStages != null)
            {
                foreach (var stage in request.JobStages)
                {
                    job.JobStages.Add(new JobStage
                    {
                        StageNumber = stage.StageNumber,
                        Name = stage.Name,
                        HiringManagerId = stage.HiringManagerId
                    });
                }
            }

            if (request.TaxonomyIds != null)
            {
                foreach (var taxonomyId in request.TaxonomyIds)
                {
                    job.JobTaxonomies.Add(new JobTaxonomy
                    {
                        TaxonomyId = taxonomyId
                    });
                }
            }

            await _jobRepository.CreateAsync(job);
        }

        public async Task UpdateJobAsync(int jobId, UpdateJobRequest request, int userId)
        {
            var job = await _context.Jobs
                .Include(j => j.CandidateJobs)
                .Include(j => j.JobTaxonomies)
                .FirstOrDefaultAsync(j => j.JobId == jobId);

            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            if (job.RecuiterId != userId)
                throw new AppException(ErrorCode.NotFoundRecruiter());

            if (job.CandidateJobs.Any())
                throw new AppException(ErrorCode.CantUpdate());

            if (request.SalaryMin.HasValue && request.SalaryMax.HasValue &&
                request.SalaryMin >= request.SalaryMax)
            {
                throw new AppException(ErrorCode.SalaryError());
            }

            // Update job properties
            job.Title = request.Title ?? job.Title;
            job.Description = request.Description ?? job.Description;
            job.Requirements = request.Requirements ?? job.Requirements;
            job.Benefits = request.Benefits ?? job.Benefits;
            job.SalaryMin = request.SalaryMin ?? job.SalaryMin;
            job.SalaryMax = request.SalaryMax ?? job.SalaryMax;
            job.Location = request.Location ?? job.Location;
            job.ExperienceYear = request.ExperienceYear ?? job.ExperienceYear;
            job.JobType = request.JobType ?? job.JobType;
            job.OpenedAt = request.OpenedAt ?? job.OpenedAt;
            job.ExpiredAt = request.ExpiredAt ?? job.ExpiredAt;

            // Update taxonomy
            if (request.TaxonomyIds != null)
            {
                // Remove old taxonomies
                _context.JobTaxonomies.RemoveRange(job.JobTaxonomies);

                // Add new taxonomies
                foreach (var taxonomyId in request.TaxonomyIds)
                {
                    job.JobTaxonomies.Add(new JobTaxonomy { TaxonomyId = taxonomyId });
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task CensorJobAsync(int jobId, CensorJobRequest request, int userId)
        {
            if (request.Status != JobStatus.Rejected && request.Status != JobStatus.Moderated)
                throw new AppException(ErrorCode.InvalidStatus());

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId);

            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            job.Status = request.Status;
            job.VerifiedBy = userId;

            await _context.SaveChangesAsync();
        }

        public async Task<JobDetailResponse> GetJobByIdAsync(int jobId)
        {
            var job = await _context.Jobs
                .Include(j => j.JobTaxonomies)
                .ThenInclude(jt => jt.Taxonomy)
                .FirstOrDefaultAsync(j => j.JobId == jobId);

            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            job.ViewsCount += 1;

            var response = new JobDetailResponse
            {
                JobId = job.JobId,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                Benefits = job.Benefits,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                Location = job.Location,
                ExperienceYear = job.ExperienceYear,
                JobType = job.JobType,
                Status = job.Status.ToString(),
                ViewsCount = job.ViewsCount,
                CompanyId = job.CompanyId,
                RecuiterId = job.RecuiterId,
                VerifiedBy = job.VerifiedBy,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                Taxonomies = job.JobTaxonomies.Select(t => new TaxonomyResponse
                {
                    Id = t.TaxonomyId,
                    Name = t.Taxonomy != null ? t.Taxonomy.Name : ""
                }).ToList()
            };

            return response;
        }

        public async Task<List<JobDetailResponse>> GetJobsAsync(GetJobRequest request)
        {
            var jobs = await _jobRepository.GetJobsAsync(request);

            return jobs.Select(j => new JobDetailResponse
            {
                JobId = j.JobId,
                Title = j.Title,
                Description = j.Description,
                Requirements = j.Requirements,
                Benefits = j.Benefits,
                SalaryMin = j.SalaryMin,
                SalaryMax = j.SalaryMax,
                Location = j.Location,
                ExperienceYear = j.ExperienceYear,
                JobType = j.JobType,
                Status = j.Status.ToString(),
                ViewsCount = j.ViewsCount,
                CompanyId = j.CompanyId,
                RecuiterId = j.RecuiterId,
                VerifiedBy = j.VerifiedBy,
                CreatedAt = j.CreatedAt,
                OpenedAt = j.OpenedAt,
                ExpiredAt = j.ExpiredAt,
                Taxonomies = j.JobTaxonomies.Select(t => new TaxonomyResponse
                {
                    Id = t.TaxonomyId,
                    Name = t.Taxonomy != null ? t.Taxonomy.Name : ""
                }).ToList()
            }).ToList();
        }

        public async Task<PagedResult<JobDetailResponse>> GetJobsPagedAsync(GetJobPagedRequest request)
        {
            var jobs = await _jobRepository.GetAllJobsPaged(request);

            if (jobs == null || !jobs.Any())
            {
                return new PagedResult<JobDetailResponse>
                {
                    Items = new List<JobDetailResponse>(),
                    pageInfo = new PageInfo(0, request.Page, request.Size, request.SortBy ?? "", request.IsDescending)
                };
            }

            var pagedJobs = jobs
                .Skip((request.Page - 1) * request.Size)
                .Take(request.Size)
                .ToList();

            var jobDtos = pagedJobs.Select(j => new JobDetailResponse
            {
                JobId = j.JobId,
                Title = j.Title,
                Description = j.Description,
                Requirements = j.Requirements,
                Benefits = j.Benefits,
                SalaryMin = j.SalaryMin,
                SalaryMax = j.SalaryMax,
                Location = j.Location,
                ExperienceYear = j.ExperienceYear,
                JobType = j.JobType,
                Status = j.Status.ToString(),
                ViewsCount = j.ViewsCount,
                CompanyId = j.CompanyId,
                RecuiterId = j.RecuiterId,
                VerifiedBy = j.VerifiedBy,
                CreatedAt = j.CreatedAt,
                OpenedAt = j.OpenedAt,
                ExpiredAt = j.ExpiredAt,
                Taxonomies = j.JobTaxonomies.Select(t => new TaxonomyResponse
                {
                    Id = t.TaxonomyId,
                    Name = t.Taxonomy != null ? t.Taxonomy.Name : ""
                }).ToList()
            }).ToList();

            return new PagedResult<JobDetailResponse>
            {
                Items = jobDtos,
                pageInfo = new PageInfo(jobs.Count, request.Page, request.Size, request.SortBy ?? "", request.IsDescending)
            };
        }
    }
}
