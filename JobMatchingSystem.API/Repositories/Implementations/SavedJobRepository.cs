using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class SavedJobRepository : ISavedJobRepository
    {
        private readonly ApplicationDbContext _context;

        public SavedJobRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SavedJob>> GetByUserIdAsync(int userId)
        {
            return await _context.SavedJobs
                                 .Where(x => x.UserId == userId)
                                 .OrderByDescending(x => x.Id)
                                 .ToListAsync();
        }

        public async Task<SavedJob?> GetByIdAsync(int id)
        {
            return await _context.SavedJobs
                                 .FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task CreateAsync(SavedJob savedJob)
        {
            _context.SavedJobs.Add(savedJob);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(SavedJob savedJob)
        {
            _context.SavedJobs.Remove(savedJob);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int userId, int jobId)
        {
            return await _context.SavedJobs
                 .AnyAsync(x => x.UserId == userId && x.JobId == jobId);
        }
    }
}
