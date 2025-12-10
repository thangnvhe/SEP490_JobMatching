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
        private readonly ICandidateJobRepository _candidateJobRepository;

        public JobService(IJobRepository jobRepository,
                          UserManager<ApplicationUser> userManager,
                          ApplicationDbContext context,
                          IEmailService emailService,
                          ICandidateJobRepository candidateJobRepository)
        {
            _jobRepository = jobRepository;
            _userManager = userManager;
            _context = context;
            _emailService = emailService;
            _candidateJobRepository = candidateJobRepository;
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

            int extensionDays = 0;

            // XỬ LÝ EXTENSION JOB
            if (request.ExtensionJobId.HasValue && request.ExtensionJobId.Value > 0)
            {
                var extension = await _context.ExtensionJobs
                    .FirstOrDefaultAsync(e => e.Id == request.ExtensionJobId.Value);

                if (extension == null)
                    throw new AppException(ErrorCode.NotFoundExtensionJob());

                if (extension.RecuiterId != userId)
                    throw new AppException(ErrorCode.NotFoundExtensionJob());

                if (extension.ExtensionJobDaysCount == 0)
                {
                    throw new AppException(ErrorCode.NotFoundExtensionJob());
                }

                if (extension.ExtensionJobDaysCount.HasValue && extension.ExtensionJobDaysCount > 0)
                {
                    extensionDays = extension.ExtensionJobDays ?? 0;
                    extension.ExtensionJobDaysCount -= 1;
                    _context.ExtensionJobs.Update(extension);
                }
            }

            if (request.OpenedAt.HasValue && request.ExpiredAt.HasValue)
            {
                var duration = request.ExpiredAt.Value - request.OpenedAt.Value;

                if (request.ExpiredAt.Value <= request.OpenedAt.Value)
                {
                    throw new AppException(ErrorCode.DayError());
                }

                if (duration.TotalDays > 30 + extensionDays)
                {
                    throw new AppException(ErrorCode.DayError());
                }
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
                PositionId = request.PositionId,
                CompanyId = user.CompanyId.Value,
                RecuiterId = user.Id,
                VerifiedBy = null,
                OpenedAt = request.OpenedAt,
                ExpiredAt = request.ExpiredAt,
                Status = JobStatus.Draft
            };

            // XỬ LÝ HIGHLIGHT JOB
            if (request.HighlightJobId.HasValue && request.HighlightJobId.Value > 0)
            {
                var highlight = await _context.HighlightJobs
                    .FirstOrDefaultAsync(h => h.Id == request.HighlightJobId);

                if (highlight == null)
                    throw new AppException(ErrorCode.NotFoundHighlightJob());

                if (highlight.RecuiterId != userId)
                    throw new AppException(ErrorCode.NotFoundHighlightJob());

                if (highlight.HighlightJobDaysCount == 0)
                    throw new AppException(ErrorCode.NotFoundHighlightJob());

                if (highlight.HighlightJobDaysCount.HasValue && highlight.HighlightJobDaysCount > 0)
                {
                    job.IsHighlighted = true;

                    if (highlight.HighlightJobDays.HasValue)
                    {
                        // Create: HighlightedUntil = OpenedAt + Days
                        var baseDate = request.OpenedAt ?? DateTime.UtcNow;
                        job.HighlightedUntil = baseDate.AddDays(highlight.HighlightJobDays.Value);
                    }

                    highlight.HighlightJobDaysCount -= 1;
                    _context.HighlightJobs.Update(highlight);
                }
            }

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

            int extensionDays = 0;

            // XỬ LÝ EXTENSION JOB
            if (request.ExtensionJobId.HasValue)
            {
                var extension = await _context.ExtensionJobs
                    .FirstOrDefaultAsync(e => e.Id == request.ExtensionJobId.Value);

                if (extension == null)
                    throw new AppException(ErrorCode.NotFoundExtensionJob());

                if (extension.RecuiterId != userId)
                    throw new AppException(ErrorCode.NotFoundExtensionJob());

                if (extension.ExtensionJobDaysCount == 0)
                {
                    throw new AppException(ErrorCode.NotFoundExtensionJob());
                }

                if (extension.ExtensionJobDaysCount.HasValue && extension.ExtensionJobDaysCount > 0)
                {
                    extensionDays = extension.ExtensionJobDays ?? 0;
                    extension.ExtensionJobDaysCount -= 1;
                    _context.ExtensionJobs.Update(extension);
                }
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
            job.PositionId = request.PositionId ?? job.PositionId;

            // Lấy giá trị hiện tại để tính toán
            DateTime currentOpenedAt = job.OpenedAt ?? DateTime.UtcNow;
            DateTime newOpenedAt = currentOpenedAt;
            DateTime newExpiredAt = job.ExpiredAt ?? currentOpenedAt.AddDays(1);

            // Nếu job đang Draft → có thể update OpenedAt
            if (job.Status == JobStatus.Draft && request.OpenedAt.HasValue)
            {
                newOpenedAt = request.OpenedAt.Value;
            }

            // ExpiredAt luôn có thể update nếu request có
            if (request.ExpiredAt.HasValue)
            {
                newExpiredAt = request.ExpiredAt.Value;
            }

            // Validation khoảng thời gian
            if (newExpiredAt <= newOpenedAt)
                throw new AppException(ErrorCode.DayError());

            if ((newExpiredAt - newOpenedAt).TotalDays > 30 + extensionDays)
                throw new AppException(ErrorCode.DayError());

            // Gán lại vào entity
            job.OpenedAt = newOpenedAt;
            job.ExpiredAt = newExpiredAt;


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

            // XỬ LÝ HIGHLIGHT JOB KHI UPDATE
            if (request.HighlightJobId.HasValue)
            {
                var highlight = await _context.HighlightJobs
                    .FirstOrDefaultAsync(h => h.Id == request.HighlightJobId);

                if (highlight == null)
                    throw new AppException(ErrorCode.NotFoundHighlightJob());

                if (highlight.RecuiterId != userId)
                    throw new AppException(ErrorCode.NotFoundHighlightJob());

                if (highlight.HighlightJobDaysCount == 0)
                    throw new AppException(ErrorCode.NotFoundHighlightJob());

                if (highlight.HighlightJobDaysCount.HasValue && highlight.HighlightJobDaysCount > 0)
                {
                    job.IsHighlighted = true;

                    if (highlight.HighlightJobDays.HasValue)
                    {
                        var now = DateTime.UtcNow;

                        // Lấy ngày mở để tính HighlightedUntil
                        DateTime openDate;

                        if (job.Status == JobStatus.Draft && request.OpenedAt.HasValue)
                        {
                            // Job đang Draft → dùng OpenedAt mới từ request
                            openDate = request.OpenedAt.Value;
                        }
                        else
                        {
                            // Job không phải Draft → dùng OpenedAt hiện tại của job
                            openDate = job.OpenedAt ?? now;
                        }

                        if (now > openDate)
                        {
                            // Nếu hiện tại > OpenedAt → dùng hiện tại
                            job.HighlightedUntil = now.AddDays(highlight.HighlightJobDays.Value);
                        }
                        else
                        {
                            // Nếu hiện tại <= OpenedAt → dùng OpenedAt
                            job.HighlightedUntil = openDate.AddDays(highlight.HighlightJobDays.Value);
                        }
                    }

                    highlight.HighlightJobDaysCount -= 1;
                    _context.HighlightJobs.Update(highlight);
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
                .Include(j => j.Company)
                .Include(j => j.Position)
                .FirstOrDefaultAsync(j => j.JobId == jobId);

            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            // Optimize: Load all related data first before updating view count
            var applyCount = await _context.CandidateJobs.CountAsync(cj => cj.JobId == jobId);
            
            bool isApply = false, isSave = false, isReport = false;
            
            if (userId.HasValue)
            {
                // Execute user-specific queries sequentially to avoid concurrency issues
                isApply = await _context.CandidateJobs
                    .Include(cj => cj.CVUpload)
                    .AnyAsync(cj => cj.JobId == jobId && cj.CVUpload != null && cj.CVUpload.UserId == userId.Value);

                isSave = await _context.SavedJobs
                    .AnyAsync(sj => sj.JobId == jobId && sj.UserId == userId.Value);

                isReport = await _context.Reports
                    .AnyAsync(jr => jr.JobId == jobId && jr.ReporterId == userId.Value);
            }

            // Only increment view count after all read operations are completed
            job.ViewsCount += 1;
            await _context.SaveChangesAsync();

            return new JobDetailResponse
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
                PositionId = job.PositionId,
                ViewsCount = job.ViewsCount,
                CompanyId = job.CompanyId,
                RecuiterId = job.RecuiterId,
                VerifiedBy = job.VerifiedBy,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                IsDeleted = job.IsDeleted,
                IsHighlight = job.IsHighlighted,
                Taxonomies = job.JobTaxonomies.Select(t => new TaxonomyResponse
                {
                    Id = t.TaxonomyId,
                    Name = t.Taxonomy?.Name ?? ""
                }).ToList(),
                ApplyCount = applyCount,
                IsApply = isApply,
                IsSave = isSave,
                IsReport = isReport
            };
        }

        public async Task DeleteJobAsync(int jobId, int userId)
        {
            var job = await _context.Jobs
                .Include(j => j.Company)
                .FirstOrDefaultAsync(j => j.JobId == jobId);

            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            // Chỉ Admin mới được xóa mềm job (không cần check RecuiterId)
            // Authorization đã được xử lý ở Controller level với [Authorize(Roles = "Admin")]
            
            // Handle cascade effects when job is deleted
            await HandleJobDeletionAsync(jobId, job.Title, job.Company?.Name ?? "Unknown Company");
            
            job.IsDeleted = true;

            // Sử dụng _context.SaveChangesAsync() thay vì _jobRepository.UpdateAsync() để tránh double save
            _context.Jobs.Update(job);
            await _context.SaveChangesAsync();
        }

        private async Task HandleJobDeletionAsync(int jobId, string jobTitle, string companyName)
        {
            // Get all candidate applications for this job
            var candidateApplications = await _candidateJobRepository.GetCandidateJobsByJobIdAsync(jobId);

            // Update candidate application statuses and send notifications
            foreach (var application in candidateApplications)
            {
                // Only update applications that are in pending/processing states
                if (application.Status == CandidateJobStatus.Pending || 
                    application.Status == CandidateJobStatus.Processing)
                {
                    application.Status = CandidateJobStatus.Fail;
                    await _candidateJobRepository.UpdateAsync(application);

                    // Send notification email to candidate
                    if (application.CVUpload?.User != null && !string.IsNullOrEmpty(application.CVUpload.User.Email))
                    {
                        try
                        {
                            await _emailService.SendJobDeletedNotificationAsync(
                                application.CVUpload.User.Email,
                                application.CVUpload.User.FullName ?? "Candidate",
                                jobTitle,
                                companyName);
                        }
                        catch (Exception ex)
                        {
                            // Log email sending error but don't throw to avoid disrupting the main process
                            // In a production environment, you would log this properly
                            Console.WriteLine($"Failed to send job deletion notification to {application.CVUpload.User.Email}: {ex.Message}");
                        }
                    }
                }
            }
        }

        public async Task<PagedResult<JobDetailResponse>> GetJobsPagedAsync(GetJobPagedRequest request)
        {
            // Expand taxonomy IDs with hierarchy before filtering
            if (request.taxonomyIds != null && request.taxonomyIds.Any())
            {
                request.taxonomyIds = await ExpandTaxonomyIdsWithHierarchy(request.taxonomyIds);
            }

            var (jobs, totalCount) = await _jobRepository.GetAllJobsPagedWithCount(request);

            if (jobs == null || !jobs.Any())
            {
                return new PagedResult<JobDetailResponse>
                {
                    Items = new List<JobDetailResponse>(),
                    pageInfo = new PageInfo(0, request.page, request.size, request.sortBy ?? "", request.isDescending)
                };
            }

            // Batch load all related data to avoid N+1 queries
            var jobIds = jobs.Select(j => j.JobId).ToList();
            
            // Batch load apply counts
            var applyCounts = await _context.CandidateJobs
                .Where(cj => jobIds.Contains(cj.JobId))
                .GroupBy(cj => cj.JobId)
                .Select(g => new { JobId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.JobId, x => x.Count);

            var jobDtos = jobs.Select(job => new JobDetailResponse
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
                PositionId = job.PositionId,
                ViewsCount = job.ViewsCount,
                CompanyId = job.CompanyId,
                RecuiterId = job.RecuiterId,
                VerifiedBy = job.VerifiedBy,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                IsDeleted = job.IsDeleted,
                IsHighlight = job.IsHighlighted,
                Taxonomies = job.JobTaxonomies.Select(t => new TaxonomyResponse
                {
                    Id = t.TaxonomyId,
                    Name = t.Taxonomy?.Name ?? ""
                }).ToList(),
                ApplyCount = applyCounts.GetValueOrDefault(job.JobId, 0),
                IsApply = false,
                IsSave = false,
                IsReport = false
            }).ToList();

            return new PagedResult<JobDetailResponse>
            {
                Items = jobDtos,
                pageInfo = new PageInfo(totalCount, request.page, request.size, request.sortBy ?? "", request.isDescending)
            };
        }

        public async Task<PagedResult<JobDetailResponse>> GetJobsPagedAsync(GetJobPagedRequest request, int? userId)
        {
            // Expand taxonomy IDs with hierarchy before filtering
            if (request.taxonomyIds != null && request.taxonomyIds.Any())
            {
                request.taxonomyIds = await ExpandTaxonomyIdsWithHierarchy(request.taxonomyIds);
            }

            var (jobs, totalCount) = await _jobRepository.GetAllJobsPagedWithCount(request);

            if (jobs == null || !jobs.Any())
            {
                return new PagedResult<JobDetailResponse>
                {
                    Items = new List<JobDetailResponse>(),
                    pageInfo = new PageInfo(0, request.page, request.size, request.sortBy ?? "", request.isDescending)
                };
            }

            // Batch load all related data to avoid N+1 queries
            var jobIds = jobs.Select(j => j.JobId).ToList();
            
            // Batch load apply counts
            var applyCounts = await _context.CandidateJobs
                .Where(cj => jobIds.Contains(cj.JobId))
                .GroupBy(cj => cj.JobId)
                .Select(g => new { JobId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.JobId, x => x.Count);

            // Batch load user-specific data if userId is provided
            Dictionary<int, bool> userApplied = new();
            Dictionary<int, bool> userSaved = new();
            Dictionary<int, bool> userReported = new();

            if (userId.HasValue)
            {
                // Batch check user applications
                var appliedJobIds = await _context.CandidateJobs
                    .Include(cj => cj.CVUpload)
                    .Where(cj => jobIds.Contains(cj.JobId) && 
                                cj.CVUpload != null && 
                                cj.CVUpload.UserId == userId.Value)
                    .Select(cj => cj.JobId)
                    .ToListAsync();
                userApplied = appliedJobIds.ToDictionary(id => id, _ => true);

                // Batch check user saved jobs
                var savedJobIds = await _context.SavedJobs
                    .Where(sj => jobIds.Contains(sj.JobId) && sj.UserId == userId.Value)
                    .Select(sj => sj.JobId)
                    .ToListAsync();
                userSaved = savedJobIds.ToDictionary(id => id, _ => true);

                // Batch check user reports
                var reportedJobIds = await _context.Reports
                    .Where(r => jobIds.Contains(r.JobId) && r.ReporterId == userId.Value)
                    .Select(r => r.JobId)
                    .ToListAsync();
                userReported = reportedJobIds.ToDictionary(id => id, _ => true);
            }

            var jobDtos = jobs.Select(job => new JobDetailResponse
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
                PositionId = job.PositionId,
                ViewsCount = job.ViewsCount,
                CompanyId = job.CompanyId,
                RecuiterId = job.RecuiterId,
                VerifiedBy = job.VerifiedBy,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                IsDeleted = job.IsDeleted,
                IsHighlight = job.IsHighlighted,
                Taxonomies = job.JobTaxonomies.Select(t => new TaxonomyResponse
                {
                    Id = t.TaxonomyId,
                    Name = t.Taxonomy?.Name ?? ""
                }).ToList(),
                ApplyCount = applyCounts.GetValueOrDefault(job.JobId, 0),
                IsApply = userId.HasValue ? userApplied.GetValueOrDefault(job.JobId, false) : false,
                IsSave = userId.HasValue ? userSaved.GetValueOrDefault(job.JobId, false) : false,
                IsReport = userId.HasValue ? userReported.GetValueOrDefault(job.JobId, false) : false
            }).ToList();

            return new PagedResult<JobDetailResponse>
            {
                Items = jobDtos,
                pageInfo = new PageInfo(totalCount, request.page, request.size, request.sortBy ?? "", request.isDescending)
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
                PositionId = job.PositionId,
                ViewsCount = job.ViewsCount,
                CompanyId = job.CompanyId,
                RecuiterId = job.RecuiterId,
                VerifiedBy = job.VerifiedBy,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                IsDeleted = job.IsDeleted,
                IsHighlight = job.IsHighlighted,
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

        // Taxonomy hierarchy helper methods
        private async Task<Taxonomy?> GetTaxonomyWithHierarchyAsync(int taxonomyId)
        {
            return await _context.Taxonomies
                .Include(t => t.Parent)
                .Include(t => t.Children)
                .FirstOrDefaultAsync(t => t.Id == taxonomyId);
        }

        private async Task<bool> IsParentOfAsync(int parentId, int childId)
        {
            var child = await _context.Taxonomies
                .FirstOrDefaultAsync(t => t.Id == childId);
            
            while (child?.ParentId != null)
            {
                if (child.ParentId == parentId)
                    return true;
                    
                child = await _context.Taxonomies
                    .FirstOrDefaultAsync(t => t.Id == child.ParentId);
            }
            
            return false;
        }

        private async Task<bool> AreSiblingsAsync(int taxonomyId1, int taxonomyId2)
        {
            var taxonomy1 = await _context.Taxonomies
                .FirstOrDefaultAsync(t => t.Id == taxonomyId1);
            var taxonomy2 = await _context.Taxonomies
                .FirstOrDefaultAsync(t => t.Id == taxonomyId2);

            return taxonomy1?.ParentId != null && 
                   taxonomy2?.ParentId != null && 
                   taxonomy1.ParentId == taxonomy2.ParentId;
        }

        public async Task<List<int>> ExpandTaxonomyIdsWithHierarchy(List<int> taxonomyIds)
        {
            var expandedIds = new HashSet<int>(taxonomyIds);
            
            foreach (var taxonomyId in taxonomyIds)
            {
                var taxonomy = await GetTaxonomyWithHierarchyAsync(taxonomyId);
                if (taxonomy == null) continue;

                // Add parent
                if (taxonomy.ParentId.HasValue)
                {
                    expandedIds.Add(taxonomy.ParentId.Value);
                }

                // Add all children
                if (taxonomy.Children != null)
                {
                    foreach (var child in taxonomy.Children)
                    {
                        expandedIds.Add(child.Id);
                    }
                }

                // Add siblings (by finding parent's children)
                if (taxonomy.ParentId.HasValue)
                {
                    var parentTaxonomy = await GetTaxonomyWithHierarchyAsync(taxonomy.ParentId.Value);
                    if (parentTaxonomy?.Children != null)
                    {
                        foreach (var sibling in parentTaxonomy.Children)
                        {
                            expandedIds.Add(sibling.Id);
                        }
                    }
                }
            }

            return expandedIds.ToList();
        }
    }
}
