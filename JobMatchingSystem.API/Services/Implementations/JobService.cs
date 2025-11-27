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
        private readonly IEmailService _emailService;

        public JobService(IJobRepository jobRepository,
                          UserManager<ApplicationUser> userManager,
                          ApplicationDbContext context,
                          IEmailService emailService)
        {
            _jobRepository = jobRepository;
            _userManager = userManager;
            _context = context;
            _emailService = emailService;
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

            // 3. KIỂM TRA VÀ TRỪ QUOTA MỚI THÊM
            var jobQuota = await _context.JobQuotas
                                         .FirstOrDefaultAsync(q => q.RecruiterId == userId);

            if (jobQuota == null)
            {
                throw new AppException(ErrorCode.NotFoundRecruiter()); 
            }

            bool quotaDeducted = false;

            if (jobQuota.MonthlyQuota > 0)
            {
                jobQuota.MonthlyQuota -= 1;
                quotaDeducted = true;
            }
            else if (jobQuota.ExtraQuota > 0)
            {
                jobQuota.ExtraQuota -= 1;
                quotaDeducted = true;
            }

            if (!quotaDeducted)
            {
                throw new AppException(ErrorCode.NotEnoughJobQuota()); 
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
            _context.JobQuotas.Update(jobQuota);
            await _context.SaveChangesAsync(); // Lưu thay đổi của JobQuota vào DB
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

            if (job.CandidateJobs.Any() || job.IsDeleted == true)
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

            if (job == null || job.IsDeleted == true)
                throw new AppException(ErrorCode.NotFoundJob());

            job.Status = request.Status;
            job.VerifiedBy = userId;

            await _context.SaveChangesAsync();

            // Sau await _context.SaveChangesAsync(); hoặc trước cũng được
            if (job.Recruiter != null)
            {
                string recruiterEmail = job.Recruiter.Email!;
                string recruiterName = job.Recruiter.FullName!;
                string companyName = job.Company?.Name ?? "your company";

                if (job.Status == JobStatus.Moderated)
                {
                    await _emailService.SendEmailAsync(
                        recruiterEmail,
                        "Job Approved - JobMatching System",
                        $"Chúc mừng {recruiterName}, công việc \"{job.Title}\" của công ty {companyName} đã được duyệt."
                    );
                }
                else if (job.Status == JobStatus.Rejected)
                {
                    await _emailService.SendEmailAsync(
                        recruiterEmail,
                        "Job Rejected - JobMatching System",
                        $"Xin lỗi {recruiterName}, công việc \"{job.Title}\" của công ty {companyName} đã bị từ chối."
                    );
                }
            }
        }

        public async Task<JobDetailResponse> GetJobByIdAsync(int jobId, int? userId = null)
        {
            var job = await _context.Jobs
                .Include(j => j.JobTaxonomies)
                .ThenInclude(jt => jt.Taxonomy)
                .FirstOrDefaultAsync(j => j.JobId == jobId);

            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            job.ViewsCount += 1;
            await _context.SaveChangesAsync();

            return await CreateJobDetailResponseAsync(job, userId);
        }

        public async Task DeleteJobAsync(int jobId, int userId)
        {
            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.JobId == jobId);

            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            // Chỉ Admin mới được xóa mềm job (không cần check RecuiterId)
            // Authorization đã được xử lý ở Controller level với [Authorize(Roles = "Admin")]
            job.IsDeleted = true;

            // Sử dụng _context.SaveChangesAsync() thay vì _jobRepository.UpdateAsync() để tránh double save
            _context.Jobs.Update(job);
            await _context.SaveChangesAsync();
        }

        public async Task<PagedResult<JobDetailResponse>> GetJobsPagedAsync(GetJobPagedRequest request)
        {
            var jobs = await _jobRepository.GetAllJobsPaged(request);

            if (jobs == null || !jobs.Any())
            {
                return new PagedResult<JobDetailResponse>
                {
                    Items = new List<JobDetailResponse>(),
                    pageInfo = new PageInfo(0, request.page, request.size, request.sortBy ?? "", request.isDescending)
                };
            }

            var pagedJobs = jobs
                .Skip((request.page - 1) * request.size)
                .Take(request.size)
                .ToList();

            var jobDtos = new List<JobDetailResponse>();
            
            foreach (var job in pagedJobs)
            {
                var dto = await CreateJobDetailResponseAsync(job, null);
                jobDtos.Add(dto);
            }

            return new PagedResult<JobDetailResponse>
            {
                Items = jobDtos,
                pageInfo = new PageInfo(jobs.Count, request.page, request.size, request.sortBy ?? "", request.isDescending)
            };
        }

        public async Task<PagedResult<JobDetailResponse>> GetJobsPagedAsync(GetJobPagedRequest request, int? userId)
        {
            var jobs = await _jobRepository.GetAllJobsPaged(request);

            if (jobs == null || !jobs.Any())
            {
                return new PagedResult<JobDetailResponse>
                {
                    Items = new List<JobDetailResponse>(),
                    pageInfo = new PageInfo(0, request.page, request.size, request.sortBy ?? "", request.isDescending)
                };
            }

            var pagedJobs = jobs
                .Skip((request.page - 1) * request.size)
                .Take(request.size)
                .ToList();

            var jobDtos = new List<JobDetailResponse>();
            
            foreach (var job in pagedJobs)
            {
                var dto = await CreateJobDetailResponseAsync(job, userId);
                jobDtos.Add(dto);
            }

            return new PagedResult<JobDetailResponse>
            {
                Items = jobDtos,
                pageInfo = new PageInfo(jobs.Count, request.page, request.size, request.sortBy ?? "", request.isDescending)
            };
        }

        private async Task<JobDetailResponse> CreateJobDetailResponseAsync(Job job, int? userId)
        {
            // Tính toán ApplyCount
            var applyCount = await _context.CandidateJobs.CountAsync(cj => cj.JobId == job.JobId);

            // Khởi tạo response cơ bản
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
                IsDeleted = job.IsDeleted,
                Taxonomies = job.JobTaxonomies.Select(t => new TaxonomyResponse
                {
                    Id = t.TaxonomyId,
                    Name = t.Taxonomy != null ? t.Taxonomy.Name : ""
                }).ToList(),
                
                // Các trường mới
                ApplyCount = applyCount
            };

            // Nếu có userId, tính toán các trường dựa trên user
            if (userId.HasValue)
            {
                // Kiểm tra user đã apply chưa (thông qua CV của user)
                response.IsApply = await _context.CandidateJobs
                    .Include(cj => cj.CVUpload)
                    .AnyAsync(cj => cj.JobId == job.JobId && cj.CVUpload != null && cj.CVUpload.UserId == userId.Value);

                // Kiểm tra user đã save chưa (giả sử có bảng SavedJobs hoặc tương tự)
                response.IsSave = await _context.SavedJobs
                    .AnyAsync(sj => sj.JobId == job.JobId && sj.UserId == userId.Value);

                // Kiểm tra user đã report chưa (giả sử có bảng JobReports hoặc tương tự)
                response.IsReport = await _context.Reports
                    .AnyAsync(jr => jr.JobId == job.JobId && jr.ReporterId == userId.Value);
            }

            return response;
        }
    }
}
