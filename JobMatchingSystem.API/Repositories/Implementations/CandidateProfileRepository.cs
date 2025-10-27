using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CandidateProfileRepository : ICandidateProfileRepository
    {
        private readonly ApplicationDbContext _context;

        public CandidateProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CandidateProfile?> GetByUserIdAsync(int userId)
        {
            return await _context.CandidateProfiles
                .Include(cp => cp.EntityTaxonomies)
                .FirstOrDefaultAsync(cp => cp.UserId == userId);
        }

        public async Task AddAsync(CandidateProfile profile)
        {
            await _context.CandidateProfiles.AddAsync(profile);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CandidateProfile profile)
        {
            _context.CandidateProfiles.Update(profile);
            await _context.SaveChangesAsync();
        }
    }
}
