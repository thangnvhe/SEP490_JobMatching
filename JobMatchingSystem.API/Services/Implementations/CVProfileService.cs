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
            // Ensure the request userId matches the authorized user
            if (request.UserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot create CV profile for another user");
            }

            var cvProfile = new CVProfile
            {
                UserId = request.UserId,
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
                throw new KeyNotFoundException($"CV Profile with id {id} not found");
            }

            // Ensure the user can only update their own profile
            if (existingProfile.UserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot update CV profile of another user");
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
                throw new KeyNotFoundException($"CV Profile with id {id} not found");
            }

            // Ensure the user can only delete their own profile
            if (existingProfile.UserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot delete CV profile of another user");
            }

            await _cvProfileRepository.DeleteAsync(existingProfile);
        }

        public async Task<CVProfile> UpdateAboutMeAsync(int userId, string aboutMe)
        {
            var existingProfile = await _cvProfileRepository.GetByUserIdAsync(userId);
            if (existingProfile == null)
            {
                throw new KeyNotFoundException($"CV Profile for user with id {userId} not found");
            }

            existingProfile.AboutMe = aboutMe;
            await _cvProfileRepository.UpdateAsync(existingProfile);
            return existingProfile;
        }
    }
}