using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IServicePlanRepository
    {
        Task<List<ServicePlan>> GetAllAsync();
        Task<ServicePlan?> GetByIdAsync(int id);
        Task UpdateAsync(ServicePlan plan);
    }
}
