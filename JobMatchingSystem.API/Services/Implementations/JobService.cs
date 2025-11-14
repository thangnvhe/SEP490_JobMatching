namespace JobMatchingSystem.API.Services.Implementations
{
    using JobMatchingSystem.API.Data;
    using JobMatchingSystem.API.DTOs.Request;
    using JobMatchingSystem.API.Enums;
    using JobMatchingSystem.API.Exceptions;
    using JobMatchingSystem.API.Models;
    using JobMatchingSystem.API.Repositories.Interfaces;
    using JobMatchingSystem.API.Services.Interfaces;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;

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
    }

}
