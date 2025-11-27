using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CandidateJobRepository : ICandidateJobRepository
    {
        protected readonly ApplicationDbContext _context;
        public CandidateJobRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task Add(CandidateJob candidateJob)
        {
            await _context.AddAsync(candidateJob);
        }

        public async Task<List<CandidateJob>> GetByJobIdAsync(int JobId, string status, string sortBy, bool IsDescending)
        {
            IQueryable<CandidateJob> query = _context.CandidateJobs;
            query = query.Where(x => x.JobId == JobId);
            if (!string.IsNullOrEmpty(status)) {
                if (Enum.TryParse<CandidateJobStatus>(status, true, out var statusEnum))
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

        public async Task<List<CandidateJob>> GetByUserIdAsync(int userId, string status, string sortBy, bool isDescending)
        {
            IQueryable<CandidateJob> query = _context.CandidateJobs
                .Include(c => c.Job)
                .Include(c => c.CVUpload)
                .Where(c => c.CVUpload != null && c.CVUpload.UserId == userId);
            
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<CandidateJobStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(u => u.Status == statusEnum);
                }
            }
            
            if (!string.IsNullOrEmpty(sortBy))
            {
                query = isDescending
                    ? query.OrderByDescending(x => EF.Property<object>(x, sortBy))
                    : query.OrderBy(x => EF.Property<object>(x, sortBy));
            }
            else
            {
                // Default sort by AppliedAt descending (newest first)
                query = query.OrderByDescending(x => x.AppliedAt);
            }
            
            return await query.ToListAsync();
        }

        public Task<List<CandidateJob>> GetByCandidateIdAsync(int candidateid)
        {
            throw new NotImplementedException();
        }

        public async Task<CandidateJob?> GetDetail(int id)
        {
            return await _context.CandidateJobs
        .Include(c => c.Job)        
        .FirstOrDefaultAsync(c => c.Id == id);
        }

        public Task Update(CandidateJob candidateJob)
        {
            _context.CandidateJobs.Update(candidateJob);
            return Task.CompletedTask;  
        }

        public async Task<bool> isApplyJob(int jobid, int cvid)
        {
            return await _context.CandidateJobs
            .AnyAsync(x => x.JobId == jobid && x.CVId == cvid);
        }
    }
}
