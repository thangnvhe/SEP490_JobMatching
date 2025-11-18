using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
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
            var candidateJob = await _unitOfWork.CandidateJobRepository.GetDetail(candidateStage.CandidateJobId);
            if (candidateStage == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateStage());
            }
            if (request.Equals("Pass"))
            {
            candidateStage.Status=Enums.CandidateStageStatus.Passed;
            int numberCount = await _unitOfWork.JobStageRepository.GetNumberStageById(candidateStage.JobStage.JobId);
            int numberCurrent = candidateStage.JobStage.StageNumber;
                if (numberCurrent == numberCount)
                {
                    candidateJob.Status=Enums.CandidateJobStatus.Pass;
                }
            }else if (request.Equals("Fail"))
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
            candidateStage.Status=Enums.CandidateStageStatus.Schedule;
            await _unitOfWork.CandidateStageRepository.Update(candidateStage);
            await _unitOfWork.SaveAsync();
        }
    }
}
