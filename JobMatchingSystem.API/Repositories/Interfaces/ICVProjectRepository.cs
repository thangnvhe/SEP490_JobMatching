using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICVProjectRepository
    {
        Task<CVProject?> GetByIdAsync(int id);
        Task<List<CVProject>> GetByUserIdAsync(int userId);
        Task CreateAsync(CVProject project);
        Task UpdateAsync(CVProject project);
        Task DeleteAsync(CVProject project);
    }
}
