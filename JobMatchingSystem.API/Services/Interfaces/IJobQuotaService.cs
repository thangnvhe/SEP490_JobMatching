using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobQuotaService
    {
        Task<JobQuotaResponse> GetByUserIdAsync(int userId);
    }
}
