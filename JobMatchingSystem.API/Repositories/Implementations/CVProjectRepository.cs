using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CVProjectRepository : ICVProjectRepository
    {
        private readonly ApplicationDbContext _context;

        public CVProjectRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CVProject?> GetByIdAsync(int id)
        {
            return await _context.CVProjects.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<CVProject>> GetByUserIdAsync(int userId)
        {
            return await _context.CVProjects
                                 .Where(p => p.UserId == userId)
                                 .ToListAsync();
        }

        public async Task CreateAsync(CVProject project)
        {
            _context.CVProjects.Add(project);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CVProject project)
        {
            _context.CVProjects.Update(project);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CVProject project)
        {
            _context.CVProjects.Remove(project);
            await _context.SaveChangesAsync();
        }
    }
}
