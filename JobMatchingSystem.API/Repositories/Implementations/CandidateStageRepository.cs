using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CandidateStageRepository : ICandidateStageRepository
    {
        protected readonly ApplicationDbContext _context;
        public CandidateStageRepository(ApplicationDbContext context) {
        _context = context;
        }
        public async Task Add(CandidateStage candidateStage)
        {
            await _context.AddAsync(candidateStage);
        }

        public async Task<List<CandidateStage>> GetAllCandidateStageByJobStageId(int jobstageId, string status, string sortBy, bool IsDescending)
        {
            IQueryable<CandidateStage> query = _context.CandidateStages;
            query = query.Where(x => x.JobStageId==jobstageId);
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<CandidateStageStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(u => u.Status == statusEnum);
                }
            }
            if (!string.IsNullOrEmpty(sortBy))
            {
                query = IsDescending
                    ? query.OrderByDescending(x => EF.Property<object>(x, sortBy))
                    : query.OrderBy(x => EF.Property<object>(x, sortBy));
            }
            return await query.ToListAsync();
        }

        public async Task<CandidateStage?> GetDetailById(int id)
        {
            return await _context.CandidateStages.Include(x=>x.JobStage).FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task Update(CandidateStage candidateStage)
        {
            _context.CandidateStages.Update(candidateStage);
            return Task.CompletedTask;
        }
    }
}
