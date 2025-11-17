using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVEducationService : ICVEducationService
    {
        private readonly ICVEducationRepository _repository;
        private readonly UserManager<ApplicationUser> _userManager;

        public CVEducationService(ICVEducationRepository repository, UserManager<ApplicationUser> userManager)
        {
            _repository = repository;
            _userManager = userManager;
        }

        public async Task<CVEducation> GetByIdAsync(int id)
        {
            var education = await _repository.GetByIdAsync(id);
            if (education == null)
                throw new AppException(ErrorCode.NotFoundCVEducation());
            return education;
        }

        public async Task<List<CVEducation>> GetByCurrentUserAsync(int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var educations = await _repository.GetByUserIdAsync(userId);
            if (educations == null || !educations.Any())
                throw new AppException(ErrorCode.NotFoundCVEducation());
            return educations;
        }

        public async Task<CVEducation> CreateAsync(CVEducationRequest request, int userId)
        {
            var education = new CVEducation
            {
                UserId = userId,
                SchoolName = request.SchoolName,
                Degree = request.Degree,
                Major = request.Major,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Description = request.Description
            };

            await _repository.CreateAsync(education);
            return education;
        }

        public async Task<CVEducation> UpdateAsync(int id, CVEducationRequest request, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var education = await _repository.GetByIdAsync(id);

            if (education == null || education.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVEducation());

            education.SchoolName = request.SchoolName;
            education.Degree = request.Degree;
            education.Major = request.Major;
            education.StartDate = request.StartDate;
            education.EndDate = request.EndDate;
            education.Description = request.Description;

            await _repository.UpdateAsync(education);
            return education;
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var education = await _repository.GetByIdAsync(id);

            if (education == null || education.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVEducation());

            await _repository.DeleteAsync(education);
        }
    }
}
