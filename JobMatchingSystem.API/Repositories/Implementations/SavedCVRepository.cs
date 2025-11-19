using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class SavedCVRepository : ISavedCVRepository
    {
        private readonly ApplicationDbContext _context;

        public SavedCVRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SavedCV>> GetByRecruiterIdAsync(int recruiterId)
        {
            return await _context.SavedCVs
                                 .Where(x => x.RecruiterId == recruiterId)
                                 .OrderByDescending(x => x.Id)
                                 .ToListAsync();
        }

        public async Task<SavedCV?> GetByIdAsync(int id)
        {
            return await _context.SavedCVs.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task CreateAsync(SavedCV savedCV)
        {
            _context.SavedCVs.Add(savedCV);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(SavedCV savedCV)
        {
            _context.SavedCVs.Remove(savedCV);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int recruiterId, int cvId)
        {
            return await _context.SavedCVs.AnyAsync(x => x.RecruiterId == recruiterId && x.CVId == cvId);
        }
    }
}
