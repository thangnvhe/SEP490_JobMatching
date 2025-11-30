using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IServicePlanRepository
    {
        Task<List<ServicePlan>> GetAllAsync();
        Task<ServicePlan?> GetByIdAsync(int id);
        Task AddAsync(ServicePlan plan);
        Task DeleteAsync(ServicePlan plan);
        Task UpdateAsync(ServicePlan plan);
    }
}
