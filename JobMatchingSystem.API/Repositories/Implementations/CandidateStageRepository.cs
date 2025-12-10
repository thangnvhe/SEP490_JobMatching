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
            var candidateStage = await _context.CandidateStages
                .Include(x => x.JobStage)
                .Include(x => x.CandidateJob)
                    .ThenInclude(cj => cj!.CVUpload)
                        .ThenInclude(cv => cv!.User)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (candidateStage?.CandidateJob != null)
            {
                Console.WriteLine($"[REPO DEBUG] CandidateJob.JobId: {candidateStage.CandidateJob.JobId}");
                
                // Manually load Job and Company by querying directly
                var job = await _context.Jobs
                    .Include(j => j.Company)
                    .FirstOrDefaultAsync(j => j.JobId == candidateStage.CandidateJob.JobId);
                
                Console.WriteLine($"[REPO DEBUG] Job query result: {job != null}, Title: {job?.Title}");
                Console.WriteLine($"[REPO DEBUG] Company in Job: {job?.Company != null}, Name: {job?.Company?.Name}");
                
                if (job != null)
                {
                    candidateStage.CandidateJob.Job = job;
                    Console.WriteLine($"[REPO DEBUG] Job assigned to CandidateJob. Job.Title: {candidateStage.CandidateJob.Job?.Title}");
                }
                else
                {
                    Console.WriteLine($"[REPO DEBUG] Job NOT found for JobId: {candidateStage.CandidateJob.JobId}");
                }
            }
            else
            {
                Console.WriteLine($"[REPO DEBUG] CandidateJob is NULL!");
            }

            return candidateStage;
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

        public async Task<List<CandidateStage>> GetAllAsync()
        {
            return await _context.CandidateStages
                .Include(x => x.JobStage)
                .Include(x => x.CandidateJob)
                    .ThenInclude(cj => cj!.CVUpload)
                        .ThenInclude(cv => cv!.User)
                .ToListAsync();
        }

        public async Task<CandidateStage?> GetByConfirmationToken(string token)
        {
            return await _context.CandidateStages
                .Include(x => x.JobStage)
                .Include(x => x.CandidateJob)
                    .ThenInclude(cj => cj!.Job)
                        .ThenInclude(j => j!.Company)
                .Include(x => x.CandidateJob)
                    .ThenInclude(cj => cj!.CVUpload)
                        .ThenInclude(cv => cv!.User)
                .FirstOrDefaultAsync(x => x.ConfirmationToken == token);
        }
    }
}
