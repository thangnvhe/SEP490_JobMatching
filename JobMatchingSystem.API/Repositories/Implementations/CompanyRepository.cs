using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CompanyRepository : ICompanyRepository
    {
        protected readonly ApplicationDbContext _context;
        public CompanyRepository(ApplicationDbContext context) {
            _context = context;
        }
        public async Task AddAsync(Company company)
        {
            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();
        }

        public async Task<Company?> GetByIdAsync(int id)
        {
            return await _context.Companies.FirstOrDefaultAsync(c => c.CompanyId == id);
        }
    }
}
