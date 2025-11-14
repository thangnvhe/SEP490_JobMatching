using JobMatchingSystem.API.DTOs.Request;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobService
    {
        Task CreateJobAsync(CreateJobRequest request, int userId);
        Task UpdateJobAsync(int jobId, UpdateJobRequest request, int userId);
        Task CensorJobAsync(int jobId, CensorJobRequest request, int userId);
    }
}
