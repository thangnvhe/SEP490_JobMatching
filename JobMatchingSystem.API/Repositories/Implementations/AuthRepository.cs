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

        public async Task<List<ApplicationUser>> GetAllAsync(string search, string sortBy,bool IsDescending)
        {
            IQueryable<ApplicationUser> query = _context.Users;
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
        public async Task<List<UserWithRole>> GetAllWithRolesAsync(string search, string sortBy, bool isDescending)
        {
            var query = from u in _context.Users
                        join ur in _context.UserRoles on u.Id equals ur.UserId
                        join r in _context.Roles on ur.RoleId equals r.Id
                        select new UserWithRole
                        {
                            User = u,
                            RoleName = r.Name
                        };

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x => x.User.FullName.Contains(search) || x.User.Email.Contains(search));
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                query = isDescending
                    ? query.OrderByDescending(x => EF.Property<object>(x.User, sortBy))
                    : query.OrderBy(x => EF.Property<object>(x.User, sortBy));
            }

            return await query.ToListAsync();
        }
        public async Task<UserWithRole?> GetUserWithRoleByIdAsync(int userId)
        {
            var query = from u in _context.Users
                        join ur in _context.UserRoles on u.Id equals ur.UserId
                        join r in _context.Roles on ur.RoleId equals r.Id
                        where u.Id == userId
                        select new UserWithRole
                        {
                            User = u,
                            RoleName = r.Name
                        };

            return await query.FirstOrDefaultAsync();
        }
        public async Task<List<UserResponseDTO>> GetListHmByCompanyId(int companyId)
        {
            var query = from u in _context.Users
                        join ur in _context.UserRoles on u.Id equals ur.UserId
                        join r in _context.Roles on ur.RoleId equals r.Id
                        where u.CompanyId == companyId
                              && r.Name == Contraints.RoleHiringManager
                        select new UserWithRole
                        {
                            User = u,
                            RoleName = r.Name
                        };

            var list = await query.ToListAsync();

            return list.Select(x => new UserResponseDTO
            {
                Id = x.User.Id,
                FullName = x.User.FullName,
                Email = x.User.Email,
                Gender = x.User.Gender,
                Birthday = x.User.Birthday,
                IsActive = x.User.IsActive,
                Score = x.User.Score,
                Role = x.RoleName
            }).ToList();
        }
    }
}
