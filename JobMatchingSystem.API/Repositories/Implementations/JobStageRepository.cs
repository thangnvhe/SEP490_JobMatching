using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class JobStageRepository : IJobStageRepository
    {
        private readonly ApplicationDbContext _context;

        public JobStageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<JobStage>> GetByJobIdAsync(int jobId)
        {
            return await _context.JobStages
                .Where(s => s.JobId == jobId)
                .OrderBy(s => s.StageNumber)
                .ToListAsync();
        }

        public async Task<JobStage?> GetByIdAsync(int id)
        {
            return await _context.JobStages
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task CreateAsync(JobStage stage)
        {
            _context.JobStages.Add(stage);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(JobStage stage)
        {
            _context.JobStages.Update(stage);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(JobStage stage)
        {
            _context.JobStages.Remove(stage);
            await _context.SaveChangesAsync();
        }
    }
}
