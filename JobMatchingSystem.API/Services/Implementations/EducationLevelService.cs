using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
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

        public async Task<PagedResult<EducationLevelDto>> GetAllPagedAsync(int page, int pageSize, string sortBy, bool isDescending, string search)
        {
            try
            {
                var query = _context.EducationLevels.AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(e => e.LevelName.Contains(search));
                }

                // Apply sorting
                if (!string.IsNullOrEmpty(sortBy))
                {
                    switch (sortBy.ToLower())
                    {
                        case "levelname":
                            query = isDescending ? query.OrderByDescending(e => e.LevelName) : query.OrderBy(e => e.LevelName);
                            break;
                        case "rankscore":
                            query = isDescending ? query.OrderByDescending(e => e.RankScore) : query.OrderBy(e => e.RankScore);
                            break;
                        case "id":
                            query = isDescending ? query.OrderByDescending(e => e.Id) : query.OrderBy(e => e.Id);
                            break;
                        default:
                            query = query.OrderBy(e => e.RankScore);
                            break;
                    }
                }
                else
                {
                    query = query.OrderBy(e => e.RankScore);
                }

                var totalCount = await query.CountAsync();
                var educationLevels = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var educationLevelDtos = educationLevels.Select(e => new EducationLevelDto
                {
                    Id = e.Id,
                    LevelName = e.LevelName,
                    RankScore = e.RankScore,
                    IsActive = e.IsActive
                }).ToList();

                return new PagedResult<EducationLevelDto>
                {
                    Items = educationLevelDtos,
                    pageInfo = new PageInfo(totalCount, page, pageSize, sortBy, isDescending)
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<EducationLevel> CreateAsync(CreateEducationLevelRequest request)
        {
            try
            {
                // Check if education level with same name already exists
                var existingLevel = await _context.EducationLevels
                    .FirstOrDefaultAsync(e => e.LevelName.ToLower() == request.LevelName.ToLower());

                if (existingLevel != null)
                    throw new AppException(ErrorCode.BadRequest("Trình độ học vấn đã tồn tại"));

                var educationLevel = new EducationLevel
                {
                    LevelName = request.LevelName,
                    RankScore = request.RankScore,
                    IsActive = true
                };

                _context.EducationLevels.Add(educationLevel);
                await _context.SaveChangesAsync();

                return educationLevel;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<EducationLevel> UpdateAsync(int id, UpdateEducationLevelRequest request)
        {
            try
            {
                var educationLevel = await _context.EducationLevels.FindAsync(id);

                if (educationLevel == null)
                    throw new AppException(ErrorCode.NotFoundUser());

                // Check if another education level with same name already exists
                var existingLevel = await _context.EducationLevels
                    .FirstOrDefaultAsync(e => e.LevelName.ToLower() == request.LevelName.ToLower() && e.Id != id);

                if (existingLevel != null)
                    throw new AppException(ErrorCode.BadRequest("Trình độ học vấn đã tồn tại"));

                educationLevel.LevelName = request.LevelName;
                educationLevel.RankScore = request.RankScore;

                _context.EducationLevels.Update(educationLevel);
                await _context.SaveChangesAsync();

                return educationLevel;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}