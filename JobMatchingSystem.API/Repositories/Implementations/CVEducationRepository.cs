using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CVEducationRepository : ICVEducationRepository
    {
        private readonly ApplicationDbContext _context;

        public CVEducationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CVEducation?> GetByIdAsync(int id)
        {
            return await _context.CVEducations.FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<CVEducation>> GetByUserIdAsync(int userId)
        {
            return await _context.CVEducations
                                 .Where(e => e.UserId == userId)
                                 .ToListAsync();
        }

        public async Task CreateAsync(CVEducation education)
        {
            _context.CVEducations.Add(education);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CVEducation education)
        {
            _context.CVEducations.Update(education);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CVEducation education)
        {
            _context.CVEducations.Remove(education);
            await _context.SaveChangesAsync();
        }
    }
}
