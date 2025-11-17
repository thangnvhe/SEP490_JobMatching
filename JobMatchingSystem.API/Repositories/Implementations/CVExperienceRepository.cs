using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CVExperienceRepository : ICVExperienceRepository
    {
        private readonly ApplicationDbContext _context;

        public CVExperienceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CVExperience?> GetByIdAsync(int id)
        {
            return await _context.CVExperiences.FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<CVExperience>> GetByUserIdAsync(int userId)
        {
            return await _context.CVExperiences
                                 .Where(e => e.UserId == userId)
                                 .ToListAsync();
        }

        public async Task CreateAsync(CVExperience experience)
        {
            _context.CVExperiences.Add(experience);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CVExperience experience)
        {
            _context.CVExperiences.Update(experience);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CVExperience experience)
        {
            _context.CVExperiences.Remove(experience);
            await _context.SaveChangesAsync();
        }
    }
}
