using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class ExtensionJobRepository : IExtensionJobRepository
    {
        private readonly ApplicationDbContext _context;

        public ExtensionJobRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ExtensionJob>> GetByRecuiterIdAsync(int recuiterId)
        {
            return await _context.ExtensionJobs
                                 .Where(e => e.RecuiterId == recuiterId)
                                 .ToListAsync();
        }
    }
}
