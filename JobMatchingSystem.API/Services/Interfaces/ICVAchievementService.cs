using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVAchievementService
    {
        Task<CVAchievement?> GetByIdAsync(int id);
        Task<List<CVAchievement>> GetByCurrentUserAsync(int userId);
        Task<CVAchievement> CreateAsync(CVAchievementRequest request, int userId);
        Task<CVAchievement> UpdateAsync(int id, CVAchievementRequest request, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
