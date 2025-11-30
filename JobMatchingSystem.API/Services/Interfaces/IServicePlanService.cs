using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IServicePlanService
    {
        Task<List<ServicePlanResponse>> GetAllAsync();
        Task<ServicePlanResponse> GetByIdAsync(int id);
        Task CreateAsync(CreateServicePlanRequest request);
        Task UpdateAsync(int id, UpdateServicePlanRequest request);
        Task DeleteAsync(int id);
    }
}
