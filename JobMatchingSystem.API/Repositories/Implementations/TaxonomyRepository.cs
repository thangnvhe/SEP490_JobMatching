using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class TaxonomyRepository : ITaxonomyRepository
    {
        private readonly ApplicationDbContext _context;

        public TaxonomyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Taxonomy>> GetAllAsync()
        {
            return await _context.Taxonomies.ToListAsync();
        }
    }
}
