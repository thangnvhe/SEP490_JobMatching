using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ISystemConfigRepository
    {
        Task<SystemConfig?> GetDefaultAsync();
        Task UpdateAsync(SystemConfig config);
    }
}
