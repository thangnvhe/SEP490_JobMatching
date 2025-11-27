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
            int numberCount = await _unitOfWork.JobStageRepository.GetNumberStageById(candidateJob.JobId);
                int numberCurrent = candidateStage.JobStageId;
                
                if (numberCurrent == numberCount)
                {
                    candidateJob.Status=Enums.CandidateJobStatus.Pass;
                }
                else
                {
                    CandidateStage candidatestagenext=new CandidateStage();
                    candidatestagenext.CandidateJobId=candidateStage.CandidateJobId;
                    candidatestagenext.JobStageId = candidateStage.JobStageId + 1;
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
            
            // Update interview location if provided
            if (!string.IsNullOrEmpty(request.InterviewLocation))
            {
                candidateStage.InterviewLocation = request.InterviewLocation;
            }
            
            // Update Google Meet link if provided
            if (!string.IsNullOrEmpty(request.GoogleMeetLink))
            {
                candidateStage.GoogleMeetLink = request.GoogleMeetLink;
            }
            
            candidateStage.Status=Enums.CandidateStageStatus.Schedule;
            await _unitOfWork.CandidateStageRepository.Update(candidateStage);
            await _unitOfWork.SaveAsync();
        }

        public async Task<List<CandidateStageResponse>> GetAllByJobStageId(int jobStageId, string? status, string? sortBy, bool isDescending)
        {
            var candidateStages = await _unitOfWork.CandidateStageRepository.GetAllCandidateStageByJobStageId(jobStageId, status ?? string.Empty, sortBy ?? string.Empty, isDescending);
            
            var response = new List<CandidateStageResponse>();
            foreach (var stage in candidateStages)
            {
                response.Add(new CandidateStageResponse
                {
                    Id = stage.Id,
                    CandidateJobId = stage.CandidateJobId,
                    JobStageId = stage.JobStageId,
                    Status = stage.Status,
                    ScheduleTime = stage.ScheduleTime,
                    InterviewLocation = stage.InterviewLocation,
                    GoogleMeetLink = stage.GoogleMeetLink,
                    HiringManagerFeedback = stage.HiringManagerFeedback,
                    JobStageTitle = stage.JobStage?.Name
                });
            }
            
            return response;
        }

        public async Task<CandidateStageResponse?> GetDetailById(int id)
        {
            var candidateStage = await _unitOfWork.CandidateStageRepository.GetDetailById(id);
            if (candidateStage == null)
            {
                return null;
            }
            
            return new CandidateStageResponse
            {
                Id = candidateStage.Id,
                CandidateJobId = candidateStage.CandidateJobId,
                JobStageId = candidateStage.JobStageId,
                Status = candidateStage.Status,
                ScheduleTime = candidateStage.ScheduleTime,
                InterviewLocation = candidateStage.InterviewLocation,
                GoogleMeetLink = candidateStage.GoogleMeetLink,
                HiringManagerFeedback = candidateStage.HiringManagerFeedback,
                JobStageTitle = candidateStage.JobStage?.Name
            };
        }
    }
}
