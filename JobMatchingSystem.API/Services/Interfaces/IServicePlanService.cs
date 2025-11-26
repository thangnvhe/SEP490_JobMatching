using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IServicePlanService
    {
        Task<List<ServicePlanResponse>> GetAllAsync();
        Task<ServicePlanResponse> GetByIdAsync(int id);
        Task UpdateAsync(int id, UpdateServicePlanRequest request);
    }
}
