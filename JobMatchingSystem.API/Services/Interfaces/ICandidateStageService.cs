using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateStageService
    {
        Task UpdateSchedule(int id, UpdateCandidateStageRequest request);
        Task UpdateResult(int id, UpdateResultCandidateStage request);
        Task<List<CandidateStageResponse>> GetAllByJobStageId(int jobStageId, string? status, string? sortBy, bool isDescending);
        Task<CandidateStageResponse?> GetDetailById(int id);
    }
}
