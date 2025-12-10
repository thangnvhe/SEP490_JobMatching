using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class TemplateCvRepository : ITemplateCvRepository
    {
        private readonly ApplicationDbContext _context;
        public TemplateCvRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(TemplateCV template)
        {
            _context.TemplateCVs.Add(template);
            await _context.SaveChangesAsync();
        }
        public async Task<List<TemplateCV>> GetAllAsync()
        {
            return await _context.TemplateCVs.ToListAsync();
        }

        public async Task<TemplateCV?> GetByIdAsync(int id)
        {
            return await _context.TemplateCVs.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task DeleteAsync(TemplateCV template)
        {
            _context.TemplateCVs.Remove(template);
            await _context.SaveChangesAsync();
        }
    }
}
