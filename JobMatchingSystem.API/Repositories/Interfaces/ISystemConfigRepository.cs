using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ISystemConfigRepository
    {
        Task<SystemConfig?> GetByIdAsync(int id);
        Task<List<SystemConfig>> GetAllAsync();
        Task CreateAsync(SystemConfig config);
        Task UpdateAsync(SystemConfig config);
    }
}
