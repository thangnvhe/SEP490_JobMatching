using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CompanyRepository : ICompanyRepository
    {
        protected readonly ApplicationDbContext _context;
        public CompanyRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Company company)
        {
             await _context.AddAsync(company);
        }

        public Task ChangeStatus(Company company)
        {
            company.IsActive = !company.IsActive;
            return Task.CompletedTask;
        }

        public async Task<List<Company>> GetAll(string search, string status, string sortBy, bool IsDescending)
        {
            IQueryable<Company> query = _context.Companies;
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u=>u.Name.Contains(search));
            }
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<CompanyStatus>(status, true, out var statusEnum))
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

        public async Task<Company?> GetByIdAsync(int id)
        {
            return await _context.Companies.FindAsync(id);
        }

        public Task Update(Company company)
        {
            _context.Companies.Update(company);
            return Task.CompletedTask;
        }
    }
}
