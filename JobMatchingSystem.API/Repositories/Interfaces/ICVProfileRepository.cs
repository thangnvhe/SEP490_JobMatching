using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICVProfileRepository
    {
        Task<CVProfile?> GetByIdAsync(int id);
        Task<CVProfile?> GetByUserIdAsync(int userId);
        Task<CVProfile> CreateAsync(CVProfile cvProfile);
        Task UpdateAsync(CVProfile cvProfile);
        Task DeleteAsync(CVProfile cvProfile);
    }
}