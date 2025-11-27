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

        public async Task<CandidateStage?> GetDetailById(int id)
        {
            return await _context.CandidateStages
                .Include(x => x.JobStage)
                .Include(x => x.CandidateJob)
                    .ThenInclude(cj => cj!.CVUpload)
                        .ThenInclude(cv => cv!.User)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task Update(CandidateStage candidateStage)
        {
            _context.CandidateStages.Update(candidateStage);
            return Task.CompletedTask;
        }

        public async Task<List<CandidateStage>> GetCandidateDetailsByJobStageId(int jobStageId, string? status = null)
        {
            IQueryable<CandidateStage> query = _context.CandidateStages
                .Include(x => x.CandidateJob)
                    .ThenInclude(cj => cj!.CVUpload)
                        .ThenInclude(cv => cv!.User)
                .Include(x => x.JobStage)
                .Where(x => x.JobStageId == jobStageId);

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<CandidateStageStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(x => x.Status == statusEnum);
                }
            }

            return await query.OrderBy(x => x.Id).ToListAsync();
        }
    }
}
