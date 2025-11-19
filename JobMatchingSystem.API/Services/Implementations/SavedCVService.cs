using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class SavedCVService : ISavedCVService
    {
        private readonly ISavedCVRepository _savedCVRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public SavedCVService(ISavedCVRepository savedCVRepository, UserManager<ApplicationUser> userManager,
                          ApplicationDbContext context)
        {
            _savedCVRepository = savedCVRepository;
            _userManager = userManager;
            _context = context;
        }

        public async Task<IEnumerable<SavedCVResponse>> GetSavedCVsByRecruiterIdAsync(int recruiterId)
        {
            var recruiter = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == recruiterId);
            if (recruiter == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var data = await _savedCVRepository.GetByRecruiterIdAsync(recruiterId);

            return data.Select(x => new SavedCVResponse
            {
                Id = x.Id,
                RecruiterId = x.RecruiterId,
                CVId = x.CVId
            }).ToList();
        }

        public async Task<SavedCVResponse> GetSavedCVByIdAsync(int savedCVId, int recruiterId)
        {
            var recruiter = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == recruiterId);
            if (recruiter == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var savedCV = await _savedCVRepository.GetByIdAsync(savedCVId);
            if (savedCV == null || savedCV.RecruiterId != recruiterId)
                throw new AppException(ErrorCode.NotFoundSaveCV());

            return new SavedCVResponse
            {
                Id = savedCV.Id,
                RecruiterId = savedCV.RecruiterId,
                CVId = savedCV.CVId
            };
        }

        public async Task CreateSavedCVAsync(int cvId, int recruiterId)
        {
            var recruiter = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == recruiterId);
            if (recruiter == null)
                throw new AppException(ErrorCode.NotFoundUser());

            // Kiểm tra CV có tồn tại không
            var cvExists = await _context.CVUploads.AnyAsync(x => x.Id == cvId);
            if (!cvExists)
                throw new AppException(ErrorCode.NotFoundCV());

            bool exists = await _savedCVRepository.ExistsAsync(recruiterId, cvId);
            if (exists)
                throw new AppException(ErrorCode.CantCreate());

            var savedCV = new SavedCV
            {
                RecruiterId = recruiterId,
                CVId = cvId
            };

            await _savedCVRepository.CreateAsync(savedCV);
        }

        public async Task DeleteSavedCVAsync(int savedCVId, int recruiterId)
        {
            var recruiter = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == recruiterId);
            if (recruiter == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var savedCV = await _savedCVRepository.GetByIdAsync(savedCVId);
            if (savedCV == null || savedCV.RecruiterId != recruiterId)
                throw new AppException(ErrorCode.NotFoundSaveCV());

            await _savedCVRepository.DeleteAsync(savedCV);
        }
    }
}
