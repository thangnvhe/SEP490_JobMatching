using JobMatchingSystem.API.DTOs.Request;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateStageService
    {
        Task UpdateSchedule(int id,UpdateCandidateStageRequest request);
        Task UpdateResult(int id,UpdateResultCandidateStage request);
    }
}
