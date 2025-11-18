using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICVExperienceRepository
    {
        Task<CVExperience?> GetByIdAsync(int id);
        Task<List<CVExperience>> GetByUserIdAsync(int userId);
        Task CreateAsync(CVExperience experience);
        Task UpdateAsync(CVExperience experience);
        Task DeleteAsync(CVExperience experience);
    }
}
