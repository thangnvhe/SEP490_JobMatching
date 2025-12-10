using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CVProfileRepository : ICVProfileRepository
    {
        private readonly ApplicationDbContext _context;

        public CVProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CVProfile?> GetByIdAsync(int id)
        {
            return await _context.CVProfiles
                .Include(cp => cp.User)
                .Include(cp => cp.Position)
                .FirstOrDefaultAsync(cp => cp.Id == id);
        }

        public async Task<CVProfile?> GetByUserIdAsync(int userId)
        {
            return await _context.CVProfiles
                .Include(cp => cp.User)
                .Include(cp => cp.Position)
                .FirstOrDefaultAsync(cp => cp.UserId == userId);
        }

        public async Task<CVProfile> CreateAsync(CVProfile cvProfile)
        {
            _context.CVProfiles.Add(cvProfile);
            await _context.SaveChangesAsync();
            
            // Reload with navigation properties
            return await GetByIdAsync(cvProfile.Id) ?? cvProfile;
        }

        public async Task UpdateAsync(CVProfile cvProfile)
        {
            _context.CVProfiles.Update(cvProfile);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CVProfile cvProfile)
        {
            _context.CVProfiles.Remove(cvProfile);
            await _context.SaveChangesAsync();
        }
    }
}