using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICVAchievementRepository
    {
        Task<CVAchievement?> GetByIdAsync(int id);
        Task<List<CVAchievement>> GetByUserIdAsync(int userId);
        Task CreateAsync(CVAchievement achievement);
        Task UpdateAsync(CVAchievement achievement);
        Task DeleteAsync(CVAchievement achievement);
    }
}
