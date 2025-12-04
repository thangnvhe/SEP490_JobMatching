using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CVRepository : ICVRepository
    {
        private readonly ApplicationDbContext _context;

        public CVRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(CVUpload cvUpload)
        {
            _context.CVUploads.Add(cvUpload);
            await _context.SaveChangesAsync();
        }

        public async Task<List<CVUpload>> GetCVsByUserIdAsync(int userId)
        {
            return await _context.CVUploads.Where(x => x.UserId == userId).ToListAsync();
        }

        public async Task UpdateAsync(CVUpload cvUpload)
        {
            _context.CVUploads.Update(cvUpload);
            await _context.SaveChangesAsync();
        }
        public async Task<CVUpload?> GetByIdAsync(int id)
        {
            return await _context.CVUploads.FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task DeleteAsync(int id)
        {
            var cv = await _context.CVUploads
                .Include(c => c.SavedCVs)
                .Include(c => c.CandidateJobs)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cv != null)
            {
                _context.SavedCVs.RemoveRange(cv.SavedCVs);
                _context.CandidateJobs.RemoveRange(cv.CandidateJobs);
                _context.CVUploads.Remove(cv);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<CVUpload?> GetCVByIdWithUserAsync(int id)
        {
            return await _context.CVUploads
                .Include(c => c.User)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<CVUpload>> GetAllCVsWithUsersAsync()
        {
            return await _context.CVUploads
                .Include(c => c.User)
                .OrderByDescending(c => c.Id)
                .ToListAsync();
        }
    }
}
