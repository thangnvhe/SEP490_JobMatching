using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Extensions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CandidateStageService : ICandidateStageService
    {
        protected readonly IUnitOfWork _unitOfWork;
        private readonly IBlobStorageService _blobStorageService;
        private readonly IEmailService _emailService;

        public CandidateStageService(IUnitOfWork unitOfWork, IBlobStorageService blobStorageService, IEmailService emailService) 
        {
            _unitOfWork = unitOfWork;
            _blobStorageService = blobStorageService;
            _emailService = emailService;
        }

        public async Task<CandidateStageDetailResponse?> UpdateResult(int id,UpdateResultCandidateStage request)
        {
            var candidateStage = await _unitOfWork.CandidateStageRepository.GetDetailById(id);
            if (candidateStage == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateStage());
            }
            
            var candidateJob = await _unitOfWork.CandidateJobRepository.GetDetail(candidateStage.CandidateJobId);
            if (candidateJob == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateJob());
            }
            
            // Validate trạng thái của candidate stage
            // Chỉ cho phép cập nhật result khi status là Schedule
            if (candidateStage.Status != Enums.CandidateStageStatus.Schedule)
            {
                throw new AppException(ErrorCode.InvalidCandidateStageStatus());
            }
            
            // Update hiring manager feedback if provided
            if (!string.IsNullOrEmpty(request.HiringManagerFeedback))
            {
                candidateStage.HiringManagerFeedback = request.HiringManagerFeedback;
            }
            
            // Validate Result value
            if (!request.Result.Equals("Pass", StringComparison.OrdinalIgnoreCase) && 
                !request.Result.Equals("Fail", StringComparison.OrdinalIgnoreCase))
            {
                throw new AppException(ErrorCode.InvalidResultValue());
            }
            
            // Lấy tất cả các JobStage của Job này để validation
            var jobStages = await _unitOfWork.JobStageRepository.GetByJobIdAsync(candidateJob.JobId);
            var orderedStages = jobStages.OrderBy(x => x.StageNumber).ToList();
            
            // Tìm stage hiện tại trong danh sách
            var currentStageIndex = orderedStages.FindIndex(x => x.Id == candidateStage.JobStageId);
            if (currentStageIndex == -1)
            {
                throw new AppException(ErrorCode.NotFoundJobStage());
            }
            
            CandidateStage? nextCandidateStage = null;
            
            if (request.Result.Equals("Pass", StringComparison.OrdinalIgnoreCase))
            {
                candidateStage.Status = Enums.CandidateStageStatus.Passed;
                
                // Nếu có JobStageId từ request (drag & drop)
                if (request.JobStageId.HasValue)
                {
                    // Validate JobStageId có tồn tại và thuộc về Job này không
                    var targetStage = orderedStages.FirstOrDefault(x => x.Id == request.JobStageId.Value);
                    if (targetStage == null)
                    {
                        throw new AppException(ErrorCode.JobStageNotBelongToJob());
                    }
                    
                    var targetStageIndex = orderedStages.FindIndex(x => x.Id == request.JobStageId.Value);
                    
                    // Validate không được kéo về stage trước đó
                    if (targetStageIndex < currentStageIndex)
                    {
                        throw new AppException(ErrorCode.CannotMoveToPreviousStage());
                    }
                    
                    // Validate chỉ được chuyển đến stage tiếp theo (không nhảy cóc)
                    if (targetStageIndex != currentStageIndex + 1)
                    {
                        throw new AppException(ErrorCode.InvalidStageProgression());
                    }
                    
                    // Tạo CandidateStage mới cho stage được chỉ định
                    nextCandidateStage = new CandidateStage
                    {
                        CandidateJobId = candidateStage.CandidateJobId,
                        JobStageId = request.JobStageId.Value,
                        Status = Enums.CandidateStageStatus.Draft
                    };
                    await _unitOfWork.CandidateStageRepository.Add(nextCandidateStage);
                }
                else
                {
                    // Logic cũ - tự động chuyển đến stage tiếp theo
                    if (currentStageIndex == orderedStages.Count - 1)
                    {
                        // Đây là stage cuối cùng
                        candidateJob.Status = Enums.CandidateJobStatus.Pass;
                    }
                    else
                    {
                        // Tạo stage tiếp theo
                        var nextStage = orderedStages[currentStageIndex + 1];
                        nextCandidateStage = new CandidateStage
                        {
                            CandidateJobId = candidateStage.CandidateJobId,
                            JobStageId = nextStage.Id,
                            Status = Enums.CandidateStageStatus.Draft
                        };
                        await _unitOfWork.CandidateStageRepository.Add(nextCandidateStage);
                    }
                }
            }
            else if (request.Result.Equals("Fail", StringComparison.OrdinalIgnoreCase))
            {
                candidateStage.Status = Enums.CandidateStageStatus.Failed;
                candidateJob.Status = Enums.CandidateJobStatus.Fail;
            }
            
            await _unitOfWork.CandidateStageRepository.Update(candidateStage);
            await _unitOfWork.SaveAsync();
            
            // Trả về thông tin của stage mới được tạo (nếu có), hoặc stage hiện tại
            if (nextCandidateStage != null)
            {
                return await GetDetailById(nextCandidateStage.Id);
            }
            else
            {
                return await GetDetailById(candidateStage.Id);
            }
        }

        public async Task UpdateSchedule(int id,UpdateCandidateStageRequest request)
        {
            var candidateStage = await _unitOfWork.CandidateStageRepository.GetDetailById(id);
            if (candidateStage == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateStage());
            }
            
            // Validate trạng thái của candidate stage
            // Chỉ cho phép cập nhật lịch khi status là Draft hoặc Schedule
            if (candidateStage.Status != Enums.CandidateStageStatus.Draft && 
                candidateStage.Status != Enums.CandidateStageStatus.Schedule)
            {
                throw new AppException(ErrorCode.InvalidCandidateStageStatus("Không thể cập nhật lịch khi ứng viên đã hoàn thành hoặc thất bại"));
            }
            
            // Update interview date and time fields
            candidateStage.InterviewDate = request.InterviewDate;
            candidateStage.InterviewStartTime = request.InterviewStartTime;
            candidateStage.InterviewEndTime = request.InterviewEndTime;
            
            // Update interview location (allow empty string to clear the field)
            candidateStage.InterviewLocation = request.InterviewLocation;
            
            // Update Google Meet link (allow empty string to clear the field)
            candidateStage.GoogleMeetLink = request.GoogleMeetLink;
            
            candidateStage.Status=Enums.CandidateStageStatus.Schedule;
            await _unitOfWork.CandidateStageRepository.Update(candidateStage);
            await _unitOfWork.SaveAsync();

            // Send email notification to candidate
            try
            {
                Console.WriteLine($"[EMAIL DEBUG] Starting to send interview schedule email for CandidateStage ID: {id}");
                
                // Reload with all includes to get related data
                var candidateStageWithIncludes = await _unitOfWork.CandidateStageRepository.GetDetailById(id);
                Console.WriteLine($"[EMAIL DEBUG] CandidateStage loaded: {candidateStageWithIncludes != null}");
                
                var candidateJob = candidateStageWithIncludes?.CandidateJob;
                Console.WriteLine($"[EMAIL DEBUG] CandidateJob loaded: {candidateJob != null}");
                
                var cv = candidateJob?.CVUpload;
                Console.WriteLine($"[EMAIL DEBUG] CV loaded: {cv != null}");
                
                var user = cv?.User;
                Console.WriteLine($"[EMAIL DEBUG] User loaded: {user != null}, Email: {user?.Email}");
                
                var job = candidateJob?.Job;
                Console.WriteLine($"[EMAIL DEBUG] Job loaded: {job != null}, Title: {job?.Title}");
                
                var company = job?.Company;
                Console.WriteLine($"[EMAIL DEBUG] Company loaded: {company != null}, Name: {company?.Name}");

                if (user?.Email != null && job != null && company != null)
                {
                    Console.WriteLine($"[EMAIL DEBUG] All conditions met. Sending email to: {user.Email}");
                    
                    // Convert DateOnly to DateTime for email
                    var interviewDateTime = candidateStage.InterviewDate.HasValue 
                        ? candidateStage.InterviewDate.Value.ToDateTime(TimeOnly.MinValue)
                        : DateTime.UtcNow;

                    await _emailService.SendInterviewScheduleNotificationAsync(
                        user.Email,
                        user.FullName,
                        job.Title,
                        company.Name,
                        interviewDateTime,
                        candidateStage.InterviewStartTime,
                        candidateStage.InterviewEndTime,
                        candidateStage.InterviewLocation,
                        candidateStage.GoogleMeetLink,
                        candidateStage.Id
                    );
                    
                    Console.WriteLine($"[EMAIL DEBUG] Email sent successfully!");
                    
                    // Lưu thời điểm gửi email
                    candidateStage.NotificationSentAt = DateTime.Now;
                    await _unitOfWork.CandidateStageRepository.Update(candidateStage);
                    await _unitOfWork.SaveAsync();
                    Console.WriteLine($"[EMAIL DEBUG] NotificationSentAt saved: {candidateStage.NotificationSentAt}");
                }
                else
                {
                    Console.WriteLine($"[EMAIL DEBUG] Email NOT sent. Missing data - User Email: {user?.Email != null}, Job: {job != null}, Company: {company != null}");
                }
            }
            catch (Exception ex)
            {
                // Log email error but don't throw to avoid disrupting the main process
                Console.WriteLine($"[EMAIL ERROR] Failed to send interview schedule email: {ex.Message}");
                Console.WriteLine($"[EMAIL ERROR] Stack trace: {ex.StackTrace}");
            }
        }

        public async Task<List<CandidateStageDetailResponse>> GetCandidateDetailsByJobStageId(int jobStageId)
        {
            // Chỉ lấy các candidate stage có status khác "Passed"
            var candidateStages = await _unitOfWork.CandidateStageRepository.GetCandidateDetailsByJobStageId(jobStageId, null);
            
            // Lọc ra các stage có status khác "Passed"
            var filteredStages = candidateStages.Where(stage => 
                stage.Status == null || 
                !stage.Status.Value.ToString().Equals("Passed", StringComparison.OrdinalIgnoreCase)
            ).ToList();
            
            var response = new List<CandidateStageDetailResponse>();
            
            foreach (var stage in filteredStages)
            {
                var candidateJob = stage.CandidateJob;
                var cv = candidateJob?.CVUpload;
                var user = cv?.User; // Get user from CV instead of CandidateJob
                
                // Generate secure URLs with SAS tokens for files
                var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(user?.AvatarUrl);
                var secureCVUrl = await _blobStorageService.GetSecureFileUrlAsync(cv?.FileUrl);
                
                response.Add(new CandidateStageDetailResponse
                {
                    Id = stage.Id,
                    CandidateJobId = stage.CandidateJobId,
                    JobStageId = stage.JobStageId,
                    Status = stage.Status?.ToString(),
                    InterviewDate = stage.InterviewDate,
                    InterviewStartTime = stage.InterviewStartTime,
                    InterviewEndTime = stage.InterviewEndTime,
                    InterviewLocation = stage.InterviewLocation,
                    GoogleMeetLink = stage.GoogleMeetLink,
                    HiringManagerFeedback = stage.HiringManagerFeedback,
                    User = new UserInfo
                    {
                        FullName = user?.FullName ?? "Unknown",
                        Email = user?.Email ?? "Unknown",
                        PhoneNumber = user?.PhoneNumber,
                        Address = user?.Address,
                        AvatarUrl = secureAvatarUrl,
                        Birthday = user?.Birthday,
                        Gender = user?.Gender
                    },
                    CV = new CVInfo
                    {
                        Id = cv?.Id ?? 0,
                        Name = cv?.Name ?? "Unknown",
                        FileUrl = secureCVUrl ?? ""
                    },
                    JobStageTitle = stage.JobStage?.Name
                });
            }
            
            return response;
        }

        public async Task<CandidateStageDetailResponse?> GetDetailById(int id)
        {
            var candidateStage = await _unitOfWork.CandidateStageRepository.GetDetailById(id);
            if (candidateStage == null)
            {
                return null;
            }

            var candidateJob = candidateStage.CandidateJob;
            var cv = candidateJob?.CVUpload;
            var user = cv?.User;

            // Generate secure URLs with SAS tokens for files
            var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(user?.AvatarUrl);
            var secureCVUrl = await _blobStorageService.GetSecureFileUrlAsync(cv?.FileUrl);

            return new CandidateStageDetailResponse
            {
                Id = candidateStage.Id,
                CandidateJobId = candidateStage.CandidateJobId,
                JobStageId = candidateStage.JobStageId,
                Status = candidateStage.Status?.ToString(),
                InterviewDate = candidateStage.InterviewDate,
                InterviewStartTime = candidateStage.InterviewStartTime,
                InterviewEndTime = candidateStage.InterviewEndTime,
                InterviewLocation = candidateStage.InterviewLocation,
                GoogleMeetLink = candidateStage.GoogleMeetLink,
                HiringManagerFeedback = candidateStage.HiringManagerFeedback,
                JobStageTitle = candidateStage.JobStage?.Name,
                User = new UserInfo
                {
                    FullName = user?.FullName ?? "Unknown",
                    Email = user?.Email ?? "Unknown",
                    PhoneNumber = user?.PhoneNumber,
                    Address = user?.Address,
                    AvatarUrl = secureAvatarUrl,
                    Birthday = user?.Birthday,
                    Gender = user?.Gender
                },
                CV = new CVInfo
                {
                    Id = cv?.Id ?? 0,
                    Name = cv?.Name ?? "Unknown",
                    FileUrl = secureCVUrl ?? ""
                }
            };
        }

        public async Task<PagedResult<CandidateStageDetailResponse>> GetCandidatesForHiringManagerAsync(
            int hiringManagerId, int page = 1, int size = 5, string search = "", 
            string sortBy = "", bool isDecending = false, string status = "", bool isHistory = false)
        {
            // Get all candidate stages for this hiring manager (all statuses)
            var candidateStages = await _unitOfWork.CandidateStageRepository.GetAllAsync();
            
            // Filter by hiring manager
            var filteredCandidates = candidateStages
                .Where(cs => cs.JobStage != null && cs.JobStage.HiringManagerId == hiringManagerId)
                .ToList();

            // If isHistory is true, only get candidates with Passed or Failed status
            if (isHistory)
            {
                filteredCandidates = filteredCandidates
                    .Where(cs => cs.Status == Enums.CandidateStageStatus.Passed || 
                                cs.Status == Enums.CandidateStageStatus.Failed)
                    .ToList();
            }

            var candidateResponses = new List<CandidateStageDetailResponse>();

            foreach (var candidateStage in filteredCandidates)
            {
                var candidateJob = candidateStage.CandidateJob;
                var cv = candidateJob?.CVUpload;
                var user = cv?.User;

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    var searchLower = search.ToLower();
                    if (!(user?.FullName?.ToLower().Contains(searchLower) == true ||
                          user?.Email?.ToLower().Contains(searchLower) == true ||
                          cv?.Name?.ToLower().Contains(searchLower) == true ||
                          candidateStage.JobStage?.Name?.ToLower().Contains(searchLower) == true))
                    {
                        continue;
                    }
                }

                // Apply status filter if provided
                if (!string.IsNullOrEmpty(status) && 
                    !candidateStage.Status?.ToString()?.Equals(status, StringComparison.OrdinalIgnoreCase) == true)
                {
                    continue;
                }

                // Generate secure URLs with SAS tokens for files
                var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(user?.AvatarUrl);
                var secureCVUrl = await _blobStorageService.GetSecureFileUrlAsync(cv?.FileUrl);

                var response = new CandidateStageDetailResponse
                {
                    Id = candidateStage.Id,
                    CandidateJobId = candidateStage.CandidateJobId,
                    JobStageId = candidateStage.JobStageId,
                    Status = candidateStage.Status.ToString(),
                    InterviewDate = candidateStage.InterviewDate,
                    InterviewStartTime = candidateStage.InterviewStartTime,
                    InterviewEndTime = candidateStage.InterviewEndTime,
                    InterviewLocation = candidateStage.InterviewLocation,
                    GoogleMeetLink = candidateStage.GoogleMeetLink,
                    HiringManagerFeedback = candidateStage.HiringManagerFeedback,
                    JobStageTitle = candidateStage.JobStage?.Name,
                    User = new UserInfo
                    {
                        FullName = user?.FullName ?? "Unknown",
                        Email = user?.Email ?? "Unknown",
                        PhoneNumber = user?.PhoneNumber,
                        Address = user?.Address,
                        AvatarUrl = secureAvatarUrl,
                        Birthday = user?.Birthday,
                        Gender = user?.Gender
                    },
                    CV = new CVInfo
                    {
                        Id = cv?.Id ?? 0,
                        Name = cv?.Name ?? "Unknown",
                        FileUrl = secureCVUrl ?? ""
                    }
                };

                candidateResponses.Add(response);
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "fullname":
                        candidateResponses = isDecending 
                            ? candidateResponses.OrderByDescending(x => x.User.FullName).ToList()
                            : candidateResponses.OrderBy(x => x.User.FullName).ToList();
                        break;
                    case "interviewdate":
                        candidateResponses = isDecending 
                            ? candidateResponses.OrderByDescending(x => x.InterviewDate).ToList()
                            : candidateResponses.OrderBy(x => x.InterviewDate).ToList();
                        break;
                    case "jobstagetitle":
                        candidateResponses = isDecending 
                            ? candidateResponses.OrderByDescending(x => x.JobStageTitle).ToList()
                            : candidateResponses.OrderBy(x => x.JobStageTitle).ToList();
                        break;
                    default:
                        candidateResponses = isDecending 
                            ? candidateResponses.OrderByDescending(x => x.Id).ToList()
                            : candidateResponses.OrderBy(x => x.Id).ToList();
                        break;
                }
            }
            else
            {
                // Default sort by InterviewDate descending
                candidateResponses = candidateResponses.OrderByDescending(x => x.InterviewDate).ToList();
            }

            // Apply pagination
            var totalCount = candidateResponses.Count;
            var paginatedItems = candidateResponses
                .Skip((page - 1) * size)
                .Take(size)
                .ToList();

            return new PagedResult<CandidateStageDetailResponse>
            {
                Items = paginatedItems,
                pageInfo = new PageInfo(totalCount, page, size, sortBy, isDecending)
            };
        }

        public async Task<bool> ConfirmInterview(int candidateStageId)
        {
            var candidateStage = await _unitOfWork.CandidateStageRepository.GetDetailById(candidateStageId);
            
            if (candidateStage == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateStage());
            }

            // Kiểm tra xem email đã được gửi chưa
            if (!candidateStage.NotificationSentAt.HasValue)
            {
                return false; // Link không hợp lệ
            }

            // Kiểm tra link có hết hạn sau 24h không
            if (DateTime.Now > candidateStage.NotificationSentAt.Value.AddHours(24))
            {
                return false; // Link đã hết hạn
            }

            // Chỉ cho phép confirm khi status là Schedule
            if (candidateStage.Status != Enums.CandidateStageStatus.Schedule)
            {
                return false; // Trạng thái không hợp lệ
            }

            // Cập nhật status hoặc thêm flag để đánh dấu candidate đã confirm
            // Có thể thêm field ConfirmedAt vào model nếu cần track
            Console.WriteLine($"[INTERVIEW] Candidate confirmed interview for CandidateStage ID: {candidateStageId}");
            
            return true;
        }

        public async Task<bool> RejectInterview(int candidateStageId)
        {
            var candidateStage = await _unitOfWork.CandidateStageRepository.GetDetailById(candidateStageId);
            
            if (candidateStage == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateStage());
            }

            // Kiểm tra xem email đã được gửi chưa
            if (!candidateStage.NotificationSentAt.HasValue)
            {
                return false; // Link không hợp lệ
            }

            // Kiểm tra link có hết hạn sau 24h không
            if (DateTime.Now > candidateStage.NotificationSentAt.Value.AddHours(24))
            {
                return false; // Link đã hết hạn
            }

            // Chỉ cho phép reject khi status là Schedule
            if (candidateStage.Status != Enums.CandidateStageStatus.Schedule)
            {
                return false; // Trạng thái không hợp lệ
            }

            // Cập nhật status thành Rejected hoặc Draft
            candidateStage.Status = Enums.CandidateStageStatus.Draft;
            await _unitOfWork.CandidateStageRepository.Update(candidateStage);
            await _unitOfWork.SaveAsync();
            
            Console.WriteLine($"[INTERVIEW] Candidate rejected interview for CandidateStage ID: {candidateStageId}");
            
            return true;
        }
    }
}
