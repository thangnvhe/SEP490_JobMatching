using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobStageService
    {
        Task<List<JobStageResponse>> GetByJobIdAsync(int jobId);
        Task<JobStageResponse?> GetByIdAsync(int id);
        Task CreateAsync(JobStageRequest request);
        Task UpdateAsync(int id, UpdateJobStageRequest request);
        Task DeleteAsync(int id);
    }
}
