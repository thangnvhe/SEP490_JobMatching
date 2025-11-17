using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CVAchievementRepository : ICVAchievementRepository
    {
        private readonly ApplicationDbContext _context;

        public CVAchievementRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CVAchievement?> GetByIdAsync(int id)
        {
            return await _context.CVAchievements
                                 .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<CVAchievement>> GetByUserIdAsync(int userId)
        {
            return await _context.CVAchievements
                                 .Where(c => c.UserId == userId)
                                 .ToListAsync();
        }
        public async Task CreateAsync(CVAchievement achievement)
        {
            _context.CVAchievements.Add(achievement);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CVAchievement achievement)
        {
            _context.CVAchievements.Update(achievement);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CVAchievement achievement)
        {
            _context.CVAchievements.Remove(achievement);
            await _context.SaveChangesAsync();
        }
    }
}
