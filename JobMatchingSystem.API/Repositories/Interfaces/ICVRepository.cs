using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICVRepository
    {
        Task CreateAsync(CVUpload cvUpload);
        Task<List<CVUpload>> GetCVsByUserIdAsync(int userId);
        Task UpdateAsync(CVUpload cvUpload);
        Task<CVUpload?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
