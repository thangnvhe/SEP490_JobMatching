using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVProfileService : ICVProfileService
    {
        private readonly ICVProfileRepository _cvProfileRepository;

        public CVProfileService(ICVProfileRepository cvProfileRepository)
        {
            _cvProfileRepository = cvProfileRepository;
        }

        public async Task<CVProfile?> GetByIdAsync(int id)
        {
            return await _cvProfileRepository.GetByIdAsync(id);
        }

        public async Task<CVProfile?> GetByUserIdAsync(int userId)
        {
            return await _cvProfileRepository.GetByUserIdAsync(userId);
        }

        public async Task<CVProfile> CreateAsync(CVProfileRequest request, int userId)
        {
            var cvProfile = new CVProfile
            {
                UserId = userId,
                PositionId = request.PositionId,
                AboutMe = request.AboutMe
            };

            return await _cvProfileRepository.CreateAsync(cvProfile);
        }

        public async Task<CVProfile> UpdateAsync(int id, CVProfileRequest request, int userId)
        {
            var existingProfile = await _cvProfileRepository.GetByIdAsync(id);
            if (existingProfile == null)
            {
                throw new KeyNotFoundException($"Hồ sơ CV với id {id} không tìm thấy");
            }

            // Ensure the user can only update their own profile
            if (existingProfile.UserId != userId)
            {
                throw new UnauthorizedAccessException("Không thể cập nhật hồ sơ CV của người dùng khác");
            }

            existingProfile.PositionId = request.PositionId;
            existingProfile.AboutMe = request.AboutMe;

            await _cvProfileRepository.UpdateAsync(existingProfile);
            return existingProfile;
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var existingProfile = await _cvProfileRepository.GetByIdAsync(id);
            if (existingProfile == null)
            {
                throw new KeyNotFoundException($"Hồ sơ CV với id {id} không tìm thấy");
            }

            // Ensure the user can only delete their own profile
            if (existingProfile.UserId != userId)
            {
                throw new UnauthorizedAccessException("Không thể xóa hồ sơ CV của người dùng khác");
            }

            await _cvProfileRepository.DeleteAsync(existingProfile);
        }

        public async Task<CVProfile> UpdateAboutMeAsync(int userId, string aboutMe)
        {
            var existingProfile = await _cvProfileRepository.GetByUserIdAsync(userId);
            if (existingProfile == null)
            {
                throw new KeyNotFoundException($"Hồ sơ CV của người dùng với id {userId} không tìm thấy");
            }

            existingProfile.AboutMe = aboutMe;
            await _cvProfileRepository.UpdateAsync(existingProfile);
            return existingProfile;
        }
    }
}