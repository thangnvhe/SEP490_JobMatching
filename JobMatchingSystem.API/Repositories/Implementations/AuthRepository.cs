using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class AuthRepository : IAuthRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public AuthRepository(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);           
        }

        public async Task<IList<string>> GetRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        public  Task UpdateUserAsync(ApplicationUser user)
        {
            _context.ApplicationUsers.Update(user);
            return Task.CompletedTask;
            
        }

        public async Task<ApplicationUser?> GetUserByRefreshToken(string refreshToken)
        {
            return await _context.ApplicationUsers.FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);

        }

        public async Task<ApplicationUser?> GetUserById(int id)
        {
            return await _context.ApplicationUsers.FindAsync(id);
        }

        public async Task<bool> ExistsAsync(string email)
        {
            return await _context.ApplicationUsers.AnyAsync(x => x.Email == email);
        }

        public async Task<List<ApplicationUser>> GetAllAsync(string search, string sortBy, bool IsDescending, bool? status = null)
        {
            IQueryable<ApplicationUser> query = _context.Users;
            
            // Filter by status (IsActive)
            if (status.HasValue)
            {
                query = query.Where(u => u.IsActive == status.Value);
            }
            
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u => u.UserName != null && u.UserName.Contains(search));
            }
            
            if (!string.IsNullOrEmpty(sortBy))
            {
                query = IsDescending
                    ? query.OrderByDescending(x => EF.Property<object>(x, sortBy))
                    : query.OrderBy(x => EF.Property<object>(x, sortBy));
            }
            
            return await query.ToListAsync();
        }

        public  Task ChangeStatus(ApplicationUser user)
        {
            user.IsActive = !user.IsActive;
            return Task.CompletedTask;
        }

        public async Task<ApplicationUser?> FindUserByCompanyId(int companyId)
        {
            return await _context.Users.FirstOrDefaultAsync(x=>x.CompanyId == companyId);
        }

        public async Task<List<ApplicationUser>> GetAllWithCompanyAsync(string search, string sortBy, bool IsDescending)
        {
            IQueryable<ApplicationUser> query = _context.Users
                .Include(u => u.CompanyRecruiter); // Include company information

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u => 
                    (u.UserName != null && u.UserName.Contains(search)) ||
                    (u.FullName != null && u.FullName.Contains(search)) ||
                    (u.Email != null && u.Email.Contains(search)) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(search))
                );
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "fullname":
                        query = IsDescending 
                            ? query.OrderByDescending(x => x.FullName) 
                            : query.OrderBy(x => x.FullName);
                        break;
                    case "email":
                        query = IsDescending 
                            ? query.OrderByDescending(x => x.Email) 
                            : query.OrderBy(x => x.Email);
                        break;
                    case "createdat":
                        query = IsDescending 
                            ? query.OrderByDescending(x => x.CreatedAt) 
                            : query.OrderBy(x => x.CreatedAt);
                        break;
                    case "isactive":
                        query = IsDescending 
                            ? query.OrderByDescending(x => x.IsActive) 
                            : query.OrderBy(x => x.IsActive);
                        break;
                    default:
                        query = query.OrderBy(x => x.FullName);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(x => x.FullName);
            }

            return await query.ToListAsync();
        }

        public async Task<ApplicationUser?> GetUserByIdWithCompanyAsync(int id)
        {
            return await _context.ApplicationUsers
                .Include(u => u.CompanyRecruiter)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<List<ApplicationUser>> GetUsersByCompanyIdAsync(int companyId)
        {
            return await _context.ApplicationUsers
                .Where(u => u.CompanyId == companyId && u.IsActive)
                .ToListAsync();
        }
    }
}
