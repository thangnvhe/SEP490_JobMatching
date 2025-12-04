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
            
            // Tìm kiếm theo tên
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u=>u.Name.Contains(search));
            }
            
            // Lọc theo status và isActive
            if (!string.IsNullOrEmpty(status))
            {
                if (status == "-1")
                {
                    // Lấy các company đã bị xóa mềm (isActive = false)
                    query = query.Where(u => u.IsActive == false);
                }
                else if (status.ToLower() != "all")
                {
                    // Lấy các company có trạng thái cụ thể và chưa bị xóa (isActive = true)
                    if (Enum.TryParse<CompanyStatus>(status, true, out var statusEnum))
                    {
                        query = query.Where(u => u.Status == statusEnum && u.IsActive == true);
                    }
                }
                // Nếu status = "all" thì không lọc gì (lấy tất cả)
            }
            else
            {
                // Mặc định chỉ lấy các company chưa bị xóa
                query = query.Where(u => u.IsActive == true);
            }
            
            // Sắp xếp
            if (!string.IsNullOrEmpty(sortBy))
            {
                query = IsDescending
                    ? query.OrderByDescending(x => EF.Property<object>(x, sortBy))
                    : query.OrderBy(x => EF.Property<object>(x, sortBy));
            }
            else
            {
                // Default sorting: CreatedAt descending (mới nhất trước)
                query = query.OrderByDescending(x => x.Id);
            }
            
            return await query.ToListAsync();
        }

        public async Task<Company?> GetByIdAsync(int id)
        {
            return await _context.Companies.FindAsync(id);
        }

        public async Task<Company?> GetByTaxCodeAsync(string taxCode)
        {
            return await _context.Companies.FirstOrDefaultAsync(x => x.TaxCode == taxCode && x.IsActive);
        }

        public async Task<IEnumerable<Company>> GetAllAsync()
        {
            return await _context.Companies
                .Where(c => c.IsActive && c.Status == CompanyStatus.Approved)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public Task Update(Company company)
        {
            _context.Companies.Update(company);
            return Task.CompletedTask;
        }
    }
}
