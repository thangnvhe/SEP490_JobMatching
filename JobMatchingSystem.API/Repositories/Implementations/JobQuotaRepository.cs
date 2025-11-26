using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class JobQuotaRepository : IJobQuotaRepository
    {
        private readonly ApplicationDbContext _context;
        public JobQuotaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<JobQuota?> GetByRecruiterIdAsync(int recruiterId)
        {
            return await _context.JobQuotas
                .FirstOrDefaultAsync(x => x.RecruiterId == recruiterId);
        }
    }
}
