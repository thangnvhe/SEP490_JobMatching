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
            return await _context.Taxonomies
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public IQueryable<Taxonomy> GetQueryable()
        {
            return _context.Taxonomies.Include(t => t.Parent).AsQueryable();
        }

        public async Task<List<Taxonomy>> GetAllWithChildrenAsync()
        {
            return await _context.Taxonomies
                .Include(t => t.Children)
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public async Task<List<Taxonomy>> GetAllWithParentAsync()
        {
            return await _context.Taxonomies
                .Include(t => t.Parent)
                .Include(t => t.Children)
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public async Task<List<Taxonomy>> GetChildrenByParentIdAsync(int parentId)
        {
            return await _context.Taxonomies
                .Where(t => t.ParentId == parentId)
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public async Task<Taxonomy?> GetByIdAsync(int id)
        {
            return await _context.Taxonomies
                .Include(t => t.Parent)
                .Include(t => t.Children)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<Taxonomy>> GetRootTaxonomiesAsync()
        {
            return await _context.Taxonomies
                .Where(t => t.ParentId == null)
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public async Task<bool> ExistsByNameAndParentAsync(string name, int? parentId, int? excludeId = null)
        {
            var query = _context.Taxonomies
                .Where(t => t.Name.ToLower() == name.ToLower() && t.ParentId == parentId);
            
            if (excludeId.HasValue)
            {
                query = query.Where(t => t.Id != excludeId.Value);
            }
            
            return await query.AnyAsync();
        }

        public async Task<Taxonomy> CreateAsync(Taxonomy taxonomy)
        {
            await _context.Taxonomies.AddAsync(taxonomy);
            await _context.SaveChangesAsync();
            return taxonomy;
        }

        public async Task<Taxonomy> UpdateAsync(Taxonomy taxonomy)
        {
            _context.Taxonomies.Update(taxonomy);
            await _context.SaveChangesAsync();
            return taxonomy;
        }

        public async Task DeleteAsync(int id)
        {
            // Set ParentId to null for children taxonomies
            var children = await _context.Taxonomies
                .Where(t => t.ParentId == id)
                .ToListAsync();
            
            foreach (var child in children)
            {
                child.ParentId = null;
            }

            // Remove related CandidateTaxonomy and JobTaxonomy records
            var candidateTaxonomies = await _context.CandidateTaxonomies
                .Where(ct => ct.TaxonomyId == id)
                .ToListAsync();
            _context.CandidateTaxonomies.RemoveRange(candidateTaxonomies);

            var jobTaxonomies = await _context.JobTaxonomies
                .Where(jt => jt.TaxonomyId == id)
                .ToListAsync();
            _context.JobTaxonomies.RemoveRange(jobTaxonomies);

            // Delete the taxonomy
            var taxonomy = await _context.Taxonomies.FindAsync(id);
            if (taxonomy != null)
            {
                _context.Taxonomies.Remove(taxonomy);
            }

            await _context.SaveChangesAsync();
        }
    }
}
