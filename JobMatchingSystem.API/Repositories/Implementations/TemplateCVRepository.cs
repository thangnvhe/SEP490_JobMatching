using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class TemplateCVRepository : ITemplateCVRepository
    {
        private readonly ApplicationDbContext _context;

        public TemplateCVRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(TemplateCV templateCV)
        {
            await _context.TemplateCVs.AddAsync(templateCV);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TemplateCV>> GetAllAsync()
        {
            return await _context.TemplateCVs.ToListAsync();
        }

        public async Task<TemplateCV?> GetByIdAsync(int id)
        {
            return await _context.TemplateCVs.FindAsync(id);
        }

        public async Task UpdateAsync(TemplateCV templateCV)
        {
            _context.TemplateCVs.Update(templateCV);
            await _context.SaveChangesAsync();
        }
    }
}