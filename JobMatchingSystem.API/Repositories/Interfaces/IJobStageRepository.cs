using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobStageRepository
    {
        Task<List<JobStage>> GetByJobIdAsync(int jobId);
        Task<JobStage?> GetByIdAsync(int id);
        Task CreateAsync(JobStage stage);
        Task UpdateAsync(JobStage stage);
        Task DeleteAsync(JobStage stage);
        Task<int> GetNumberStageById(int id);
    }
}
