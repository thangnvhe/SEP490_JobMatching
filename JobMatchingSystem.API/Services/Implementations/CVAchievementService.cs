using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVAchievementService : ICVAchievementService
    {
        private readonly ICVAchievementRepository _repository;
        private readonly UserManager<ApplicationUser> _userManager;

        public CVAchievementService(ICVAchievementRepository repository, UserManager<ApplicationUser> userManager)
        {
            _repository = repository;
            _userManager = userManager;
        }

        public async Task<CVAchievement> GetByIdAsync(int id)
        {
            var achievement = await _repository.GetByIdAsync(id);

            if (achievement == null)
                throw new AppException(ErrorCode.NotFoundCVAchievement());

            return achievement;
        }

        public async Task<List<CVAchievement>> GetByCurrentUserAsync(int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var achievements = await _repository.GetByUserIdAsync(userId);

            if (achievements == null || !achievements.Any())
                throw new AppException(ErrorCode.NotFoundCVAchievement());

            return achievements;
        }
        public async Task<CVAchievement> CreateAsync(CVAchievementRequest request, int userId)
        {
            if (userId == null || userId == 0)
                throw new AppException(ErrorCode.NotFoundUser());

            var achievement = new CVAchievement
            {
                UserId = userId,
                Title = request.Title,
                Organization = request.Organization,
                Description = request.Description,
                AchievedAt = request.AchievedAt
            };

            await _repository.CreateAsync(achievement);
            return achievement;
        }

        public async Task<CVAchievement> UpdateAsync(int id, CVAchievementRequest request, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var achievement = await _repository.GetByIdAsync(id);
            if (achievement == null || achievement.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVAchievement());

            achievement.Title = request.Title;
            achievement.Organization = request.Organization;
            achievement.Description = request.Description;
            achievement.AchievedAt = request.AchievedAt;

            await _repository.UpdateAsync(achievement);
            return achievement;
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var achievement = await _repository.GetByIdAsync(id);
            if (achievement == null || achievement.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVAchievement());

            await _repository.DeleteAsync(achievement);
        }
    }
}
