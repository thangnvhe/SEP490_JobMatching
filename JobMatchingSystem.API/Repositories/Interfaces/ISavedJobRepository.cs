using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ISavedJobRepository
    {
        Task<IEnumerable<SavedJob>> GetByUserIdAsync(int userId);
        Task<SavedJob?> GetByIdAsync(int id);
        Task CreateAsync(SavedJob savedJob);
        Task DeleteAsync(SavedJob savedJob);
        Task<bool> ExistsAsync(int userId, int jobId);
    }
}
