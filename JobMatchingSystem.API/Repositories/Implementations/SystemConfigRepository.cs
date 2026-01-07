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

        public async Task<SystemConfig?> GetDefaultAsync()
        {
            return await _context.SystemConfigs
                                 .FirstOrDefaultAsync(x => x.Id == 1);
        }
        public async Task UpdateAsync(SystemConfig config)
        {
            _context.SystemConfigs.Update(config);
            await _context.SaveChangesAsync();
        }
    }
}
