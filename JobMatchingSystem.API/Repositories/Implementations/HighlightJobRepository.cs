using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class HighlightJobRepository : IHighlightJobRepository
    {
        private readonly ApplicationDbContext _context;

        public HighlightJobRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<HighlightJob>> GetByRecuiterIdAsync(int recuiterId)
        {
            return await _context.HighlightJobs
                                 .Where(h => h.RecuiterId == recuiterId && h.HighlightJobDaysCount > 0)
                                 .ToListAsync();
        }
    }
}
