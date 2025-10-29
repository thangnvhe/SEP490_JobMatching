// File: Repositories/Implementations/DataCVRepository.cs
using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class DataCVRepository : IDataCVRepository
    {
        private readonly ApplicationDbContext _context;

        public DataCVRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(DataCV cv)
        {
            await _context.DataCVs.AddAsync(cv);
        }

        public async Task<DataCV?> GetByIdAsync(int cvId, int userId)
        {
            return await _context.DataCVs
                .FirstOrDefaultAsync(c => c.CVId == cvId && c.UserId == userId);
        }

        public async Task<DataCV?> GetPrimaryCVAsync(int userId)
        {
            return await _context.DataCVs
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsPrimary == true && c.IsActive);
        }

        public async Task<List<DataCV>> GetActiveCVsByUserIdAsync(int userId)
        {
            return await _context.DataCVs
                .Where(c => c.UserId == userId && c.IsActive)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateAsync(DataCV cv)
        {
            _context.DataCVs.Update(cv);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}