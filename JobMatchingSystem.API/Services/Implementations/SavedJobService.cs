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
    public class SavedJobService : ISavedJobService
    {
        private readonly ISavedJobRepository _savedJobRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public SavedJobService(
            ISavedJobRepository savedJobRepository,
            UserManager<ApplicationUser> userManager,
                          ApplicationDbContext context)
        {
            _savedJobRepository = savedJobRepository;
            _userManager = userManager;
            _context = context;
        }

        public async Task<IEnumerable<SavedJobResponse>> GetSavedJobsByUserIdAsync(int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var data = await _savedJobRepository.GetByUserIdAsync(userId);

            return data.Select(x => new SavedJobResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                JobId = x.JobId
            }).ToList();
        }

        public async Task<SavedJobResponse> GetSavedJobByIdAsync(int savedJobId, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var savedJob = await _savedJobRepository.GetByIdAsync(savedJobId);

            if (savedJob == null || savedJob.UserId != userId)
                throw new AppException(ErrorCode.NotFoundSaveJob());

            return new SavedJobResponse
            {
                Id = savedJob.Id,
                UserId = savedJob.UserId,
                JobId = savedJob.JobId
            };
        }

        public async Task CreateSavedJobAsync(int jobId, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            // Kiểm tra Job có tồn tại không
            var jobExists = await _context.Jobs.AnyAsync(x => x.JobId == jobId);
            if (!jobExists)
                throw new AppException(ErrorCode.NotFoundJob());

            // Check if already saved
            bool exists = await _savedJobRepository.ExistsAsync(userId, jobId);
            if (exists)
                throw new AppException(ErrorCode.CantCreate());

            var savedJob = new SavedJob
            {
                UserId = userId,
                JobId = jobId
            };

            await _savedJobRepository.CreateAsync(savedJob);
        }

        public async Task DeleteSavedJobAsync(int savedJobId, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var savedJob = await _savedJobRepository.GetByIdAsync(savedJobId);

            if (savedJob == null || savedJob.UserId != userId)
                throw new AppException(ErrorCode.NotFoundSaveJob());

            await _savedJobRepository.DeleteAsync(savedJob);
        }

    }
}
