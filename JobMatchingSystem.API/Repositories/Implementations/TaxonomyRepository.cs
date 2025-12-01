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
    }
}
