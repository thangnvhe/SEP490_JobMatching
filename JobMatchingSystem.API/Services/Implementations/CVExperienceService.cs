using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVExperienceService : ICVExperienceService
    {
        private readonly ICVExperienceRepository _repository;
        private readonly UserManager<ApplicationUser> _userManager;

        public CVExperienceService(ICVExperienceRepository repository, UserManager<ApplicationUser> userManager)
        {
            _repository = repository;
            _userManager = userManager;
        }

        public async Task<CVExperience> GetByIdAsync(int id)
        {
            var experience = await _repository.GetByIdAsync(id);
            if (experience == null)
                throw new AppException(ErrorCode.NotFoundCVExperience());
            return experience;
        }

        public async Task<List<CVExperience>> GetByCurrentUserAsync(int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var experiences = await _repository.GetByUserIdAsync(userId);
            if (experiences == null || !experiences.Any())
                throw new AppException(ErrorCode.NotFoundCVExperience());

            return experiences;
        }

        public async Task<CVExperience> CreateAsync(CVExperienceRequest request, int userId)
        {
            var experience = new CVExperience
            {
                UserId = userId,
                CompanyName = request.CompanyName,
                Position = request.Position,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Description = request.Description
            };

            await _repository.CreateAsync(experience);
            return experience;
        }

        public async Task<CVExperience> UpdateAsync(int id, CVExperienceRequest request, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var experience = await _repository.GetByIdAsync(id);
            if (experience == null || experience.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVExperience());

            experience.CompanyName = request.CompanyName;
            experience.Position = request.Position;
            experience.StartDate = request.StartDate;
            experience.EndDate = request.EndDate;
            experience.Description = request.Description;

            await _repository.UpdateAsync(experience);
            return experience;
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var experience = await _repository.GetByIdAsync(id);
            if (experience == null || experience.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVExperience());

            await _repository.DeleteAsync(experience);
        }
    }
}
