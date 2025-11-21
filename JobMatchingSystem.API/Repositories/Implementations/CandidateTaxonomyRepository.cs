using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CandidateTaxonomyRepository : ICandidateTaxonomyRepository
    {
        private readonly ApplicationDbContext _context;

        public CandidateTaxonomyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CandidateTaxonomy?> GetByIdAsync(int id)
        {
            return await _context.CandidateTaxonomies
                .Include(x => x.Taxonomy)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<CandidateTaxonomy>> GetByCandidateIdAsync(int candidateId)
        {
            return await _context.CandidateTaxonomies
                .Include(x => x.Taxonomy)
                .Where(x => x.CandidateId == candidateId)
                .ToListAsync();
        }
        public async Task CreateAsync(CandidateTaxonomy entity)
        {
            _context.CandidateTaxonomies.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CandidateTaxonomy entity)
        {
            _context.CandidateTaxonomies.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> TaxonomyExistsAsync(int taxonomyId)
        {
            return await _context.Taxonomies.AnyAsync(t => t.Id == taxonomyId);
        }
    }
}
