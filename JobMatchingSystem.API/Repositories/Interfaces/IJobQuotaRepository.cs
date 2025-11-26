using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobQuotaRepository
    {
        Task<JobQuota?> GetByRecruiterIdAsync(int recruiterId);
    }
}
