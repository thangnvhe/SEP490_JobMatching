using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ISavedCVRepository
    {
        Task<IEnumerable<SavedCV>> GetByRecruiterIdAsync(int recruiterId);
        Task<SavedCV?> GetByIdAsync(int id);
        Task CreateAsync(SavedCV savedCV);
        Task DeleteAsync(SavedCV savedCV);
        Task<bool> ExistsAsync(int recruiterId, int cvId);
    }
}
