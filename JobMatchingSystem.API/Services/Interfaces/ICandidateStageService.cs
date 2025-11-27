using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateStageService
    {
        Task UpdateSchedule(int id, UpdateCandidateStageRequest request);
        Task UpdateResult(int id, UpdateResultCandidateStage request);
        Task<List<CandidateStageDetailResponse>> GetCandidateDetailsByJobStageId(int jobStageId, string? status = null, string? sortBy = null, bool isDescending = false);
        Task<CandidateStageDetailResponse?> GetDetailById(int id);
    }
}
