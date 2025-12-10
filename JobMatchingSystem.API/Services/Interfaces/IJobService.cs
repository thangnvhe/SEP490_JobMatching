using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobService
    {
        Task CreateJobAsync(CreateJobRequest request, int userId);
        Task UpdateJobAsync(int jobId, UpdateJobRequest request, int userId);
        Task CensorJobAsync(int jobId, CensorJobRequest request, int userId);
        Task<JobDetailResponse> GetJobByIdAsync(int jobId, int? userId);
        Task<PagedResult<JobDetailResponse>> GetJobsPagedAsync(GetJobPagedRequest request);
        Task<PagedResult<JobDetailResponse>> GetJobsPagedAsync(GetJobPagedRequest request, int? userId);
        Task DeleteJobAsync(int jobId, int userId);
        Task<List<int>> ExpandTaxonomyIdsWithHierarchy(List<int> taxonomyIds);
    }
}
