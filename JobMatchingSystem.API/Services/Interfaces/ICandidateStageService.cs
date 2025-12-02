using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateStageService
    {
        Task UpdateSchedule(int id, UpdateCandidateStageRequest request);
        Task<CandidateStageDetailResponse?> UpdateResult(int id, UpdateResultCandidateStage request);
        Task<List<CandidateStageDetailResponse>> GetCandidateDetailsByJobStageId(int jobStageId);
        Task<CandidateStageDetailResponse?> GetDetailById(int id);
        Task<PagedResult<CandidateStageDetailResponse>> GetCandidatesForHiringManagerAsync(
            int hiringManagerId, int page = 1, int size = 5, string search = "", 
            string sortBy = "", bool isDecending = false, string status = "", bool isHistory = false);
    }
}
