using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobService
    {
        Task CreateJobAsync(CreateJobRequest request, int userId);
        Task UpdateJobAsync(int jobId, UpdateJobRequest request, int userId);
        Task CensorJobAsync(int jobId, CensorJobRequest request, int userId);
        Task<JobDetailResponse> GetJobByIdAsync(int jobId);
        Task<List<JobDetailResponse>> GetJobsAsync(GetJobRequest request);
    }
}
