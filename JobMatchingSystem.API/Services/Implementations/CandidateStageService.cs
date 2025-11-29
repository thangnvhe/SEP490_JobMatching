using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CandidateStageService : ICandidateStageService
    {
        protected readonly IUnitOfWork _unitOfWork;
        public CandidateStageService(IUnitOfWork unitOfWork) {
        _unitOfWork = unitOfWork;
        }

        public async Task UpdateResult(int id,UpdateResultCandidateStage request)
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
            
            // Update hiring manager feedback if provided
            if (!string.IsNullOrEmpty(request.HiringManagerFeedback))
            {
                candidateStage.HiringManagerFeedback = request.HiringManagerFeedback;
            }
            
            if (request.Result.Equals("Pass"))
            {
            candidateStage.Status=Enums.CandidateStageStatus.Passed;
            
                // Lấy tất cả các JobStage của Job này
                var jobStages = await _unitOfWork.JobStageRepository.GetByJobIdAsync(candidateJob.JobId);
                var orderedStages = jobStages.OrderBy(x => x.StageNumber).ToList();
                
                // Tìm stage hiện tại trong danh sách
                var currentStageIndex = orderedStages.FindIndex(x => x.Id == candidateStage.JobStageId);
                
                if (currentStageIndex == -1)
                {
                    throw new AppException(ErrorCode.NotFoundJobStage());
                }
                
                // Kiểm tra xem đây có phải là stage cuối cùng không
                if (currentStageIndex == orderedStages.Count - 1)
                {
                    // Đây là stage cuối cùng
                    candidateJob.Status=Enums.CandidateJobStatus.Pass;
                }
                else
                {
                    // Tạo stage tiếp theo
                    var nextStage = orderedStages[currentStageIndex + 1];
                    CandidateStage candidatestagenext=new CandidateStage();
                    candidatestagenext.CandidateJobId=candidateStage.CandidateJobId;
                    candidatestagenext.JobStageId = nextStage.Id;
                    candidatestagenext.Status=Enums.CandidateStageStatus.Draft;
                    await _unitOfWork.CandidateStageRepository.Add(candidatestagenext);
                }
            }else if (request.Result.Equals("Fail"))
            {
                candidateStage.Status = Enums.CandidateStageStatus.Failed;
                candidateJob.Status=Enums.CandidateJobStatus.Fail;
            }
            await _unitOfWork.CandidateStageRepository.Update(candidateStage);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateSchedule(int id,UpdateCandidateStageRequest request)
        {
            var candidateStage = await _unitOfWork.CandidateStageRepository.GetDetailById(id);
            if (candidateStage == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateStage());
            }
            candidateStage.ScheduleTime = request.Schedule;
            
            // Update interview location (allow empty string to clear the field)
            candidateStage.InterviewLocation = request.InterviewLocation;
            
            // Update Google Meet link (allow empty string to clear the field)
            candidateStage.GoogleMeetLink = request.GoogleMeetLink;
            
            candidateStage.Status=Enums.CandidateStageStatus.Schedule;
            await _unitOfWork.CandidateStageRepository.Update(candidateStage);
            await _unitOfWork.SaveAsync();
        }

        public async Task<List<CandidateStageDetailResponse>> GetCandidateDetailsByJobStageId(int jobStageId, string? status = null, string? sortBy = null, bool isDescending = false)
        {
            var candidateStages = await _unitOfWork.CandidateStageRepository.GetCandidateDetailsByJobStageId(jobStageId, status);
            
            var response = new List<CandidateStageDetailResponse>();
            
            foreach (var stage in candidateStages)
            {
                var candidateJob = stage.CandidateJob;
                var cv = candidateJob?.CVUpload;
                var user = cv?.User; // Get user from CV instead of CandidateJob
                
                response.Add(new CandidateStageDetailResponse
                {
                    Id = stage.Id,
                    CandidateJobId = stage.CandidateJobId,
                    JobStageId = stage.JobStageId,
                    Status = stage.Status?.ToString(),
                    ScheduleTime = stage.ScheduleTime,
                    InterviewLocation = stage.InterviewLocation,
                    GoogleMeetLink = stage.GoogleMeetLink,
                    HiringManagerFeedback = stage.HiringManagerFeedback,
                    User = new UserInfo
                    {
                        FullName = user?.FullName ?? "Unknown",
                        Email = user?.Email ?? "Unknown",
                        PhoneNumber = user?.PhoneNumber,
                        Address = user?.Address,
                        AvatarUrl = user?.AvatarUrl,
                        Birthday = user?.Birthday,
                        Gender = user?.Gender
                    },
                    CV = new CVInfo
                    {
                        Id = cv?.Id ?? 0,
                        Name = cv?.Name ?? "Unknown",
                        FileUrl = cv?.FileUrl ?? ""
                    },
                    JobStageTitle = stage.JobStage?.Name
                });
            }
            
            // Apply sorting if specified
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "name":
                        response = isDescending 
                            ? response.OrderByDescending(x => x.User.FullName).ToList()
                            : response.OrderBy(x => x.User.FullName).ToList();
                        break;
                    case "email":
                        response = isDescending 
                            ? response.OrderByDescending(x => x.User.Email).ToList()
                            : response.OrderBy(x => x.User.Email).ToList();
                        break;
                    case "status":
                        response = isDescending 
                            ? response.OrderByDescending(x => x.Status).ToList()
                            : response.OrderBy(x => x.Status).ToList();
                        break;
                    case "scheduletime":
                        response = isDescending 
                            ? response.OrderByDescending(x => x.ScheduleTime).ToList()
                            : response.OrderBy(x => x.ScheduleTime).ToList();
                        break;
                    default:
                        break;
                }
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

            return new CandidateStageDetailResponse
            {
                Id = candidateStage.Id,
                CandidateJobId = candidateStage.CandidateJobId,
                JobStageId = candidateStage.JobStageId,
                Status = candidateStage.Status?.ToString(),
                ScheduleTime = candidateStage.ScheduleTime,
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
                    AvatarUrl = user?.AvatarUrl,
                    Birthday = user?.Birthday,
                    Gender = user?.Gender
                },
                CV = new CVInfo
                {
                    Id = cv?.Id ?? 0,
                    Name = cv?.Name ?? "Unknown",
                    FileUrl = cv?.FileUrl ?? ""
                }
            };
        }
    }
}
