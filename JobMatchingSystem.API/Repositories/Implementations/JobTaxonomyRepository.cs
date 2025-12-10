using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class JobTaxonomyRepository : IJobTaxonomyRepository
    {
        private readonly ApplicationDbContext _context;

        public JobTaxonomyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<JobTaxonomy?> GetByIdAsync(int id)
        {
            return await _context.JobTaxonomies
                .Include(x => x.Taxonomy)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<JobTaxonomy>> GetByJobIdAsync(int jobId)
        {
            return await _context.JobTaxonomies
                .Include(x => x.Taxonomy)
                .Where(x => x.JobId == jobId)
                .ToListAsync();
        }

        public async Task CreateAsync(JobTaxonomy entity)
        {
            _context.JobTaxonomies.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(JobTaxonomy entity)
        {
            _context.JobTaxonomies.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> TaxonomyExistsAsync(int taxonomyId)
        {
            return await _context.Taxonomies.AnyAsync(t => t.Id == taxonomyId);
        }

        public async Task<Job?> GetJobAsync(int jobId)
        {
            return await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId);
        }
    }
}
