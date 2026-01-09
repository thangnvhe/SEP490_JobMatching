using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class SystemConfigRepository : ISystemConfigRepository
    {
        private readonly ApplicationDbContext _context;

        public SystemConfigRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SystemConfig?> GetByIdAsync(int id)
        {
            return await _context.SystemConfigs
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<SystemConfig>> GetAllAsync()
        {
            return await _context.SystemConfigs.ToListAsync();
        }
        public async Task CreateAsync(SystemConfig config)
        {
            _context.SystemConfigs.Add(config);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(SystemConfig config)
        {
            _context.SystemConfigs.Update(config);
            await _context.SaveChangesAsync();
        }
    }
}
