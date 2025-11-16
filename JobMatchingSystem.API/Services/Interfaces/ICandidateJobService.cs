using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateJobService
    {
        Task Add(CreateCandidateJobRequest request);
        Task<PagedResult<CandidateJobDTO>> GetAllByJobId(int jobid, int page = 1, int size = 5, string status = "", string sortBy = "", bool isDecending = false);
        Task RejectCV(int id);
        Task ApproveCV(int id);
        Task<CandidateJobDTO> GetDetailById(int id);
    }
}
