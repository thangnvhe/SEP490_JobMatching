using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CompanyRecruiterRepository : ICompanyRecruiterRepository
    {
        protected readonly ApplicationDbContext _context;
        public CompanyRecruiterRepository(ApplicationDbContext context) { 
        _context = context;
        }
        public async Task AddAsync(CompanyRecruiter companyRecruiter)
        {
            await _context.CompanyRecruiters.AddAsync(companyRecruiter);
            await _context.SaveChangesAsync();

        }
    }
}
