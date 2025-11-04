using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;
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

        public async Task<IEnumerable<Taxonomy>> GetAllSkillsAsync()
        {
            return await _context.Taxonomies
                .Where(t => t.Type == TaxonomyType.Skill)
                .ToListAsync();
        }

        public async Task<Taxonomy?> GetSkillByIdAsync(int id)
        {
            return await _context.Taxonomies
                .FirstOrDefaultAsync(t => t.TaxonomyId == id && t.Type == TaxonomyType.Skill);
        }
    }
}
