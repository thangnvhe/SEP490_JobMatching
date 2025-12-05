using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class PositionRepository : IPositionRepository
    {
        private readonly ApplicationDbContext _context;

        public PositionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Position>> GetAllAsync()
        {
            return await _context.Positions.ToListAsync();
        }

        public async Task<Position?> GetByIdAsync(int id)
        {
            return await _context.Positions
                                 .FirstOrDefaultAsync(x => x.PositionId == id);
        }

        public async Task<Position> CreateAsync(Position position)
        {
            await _context.Positions.AddAsync(position);
            await _context.SaveChangesAsync();
            return position;
        }

        public async Task<Position> UpdateAsync(Position position)
        {
            _context.Positions.Update(position);
            await _context.SaveChangesAsync();
            return position;
        }

        public async Task DeleteAsync(int id)
        {
            // Set PositionId to null in related Jobs
            var relatedJobs = await _context.Jobs
                .Where(j => j.PositionId == id)
                .ToListAsync();
            
            foreach (var job in relatedJobs)
            {
                job.PositionId = null;
            }

            // Set PositionId to null in related CVProfiles
            var relatedCVProfiles = await _context.CVProfiles
                .Where(cv => cv.PositionId == id)
                .ToListAsync();
            
            foreach (var cvProfile in relatedCVProfiles)
            {
                cvProfile.PositionId = null;
            }

            // Delete the position
            var position = await _context.Positions.FindAsync(id);
            if (position != null)
            {
                _context.Positions.Remove(position);
            }

            await _context.SaveChangesAsync();
        }
    }
}
