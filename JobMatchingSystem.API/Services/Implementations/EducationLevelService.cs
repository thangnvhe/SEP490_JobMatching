using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class EducationLevelService : IEducationLevelService
    {
        private readonly ApplicationDbContext _context;

        public EducationLevelService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EducationLevelDto>> GetAllAsync()
        {
            var educationLevels = await _context.EducationLevels
                .Where(e => e.IsActive)
                .OrderBy(e => e.RankScore)
                .Select(e => new EducationLevelDto
                {
                    Id = e.Id,
                    LevelName = e.LevelName,
                    RankScore = e.RankScore,
                    IsActive = e.IsActive
                })
                .ToListAsync();

            return educationLevels;
        }

        public async Task<EducationLevelDto> GetByIdAsync(int id)
        {
            var educationLevel = await _context.EducationLevels
                .Where(e => e.Id == id && e.IsActive)
                .Select(e => new EducationLevelDto
                {
                    Id = e.Id,
                    LevelName = e.LevelName,
                    RankScore = e.RankScore,
                    IsActive = e.IsActive
                })
                .FirstOrDefaultAsync();

            if (educationLevel == null)
                throw new AppException(ErrorCode.NotFoundUser()); // Sử dụng ErrorCode có sẵn

            return educationLevel;
        }
    }
}