using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{

    public class AuthRepository : IAuthRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public AuthRepository(UserManager<ApplicationUser> userManager,ApplicationDbContext context)
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

        public async Task UpdateUserAsync(ApplicationUser user)
        {
            _context.ApplicationUsers.Update(user);
            await _context.SaveChangesAsync();  
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

        public async Task<List<(ApplicationUser User, string RoleName)>> GetAllAsync(
        string search,
        int roleId,
        string sortBy = "",
        bool isDescending = false)
        {
            var query = from u in _context.Users
                        join ur in _context.UserRoles on u.Id equals ur.UserId into userRoles
                        from ur in userRoles.DefaultIfEmpty()
                        join r in _context.Roles on ur.RoleId equals r.Id into roles
                        from r in roles.DefaultIfEmpty()
                        select new { User = u, RoleName = r.Name };
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(x => x.User.UserName.Contains(search));
            if (roleId != 0)
            {
                query = query.Where(x =>
                    _context.UserRoles.Any(ur => ur.UserId == x.User.Id && ur.RoleId == roleId));
            }
            if (!string.IsNullOrEmpty(sortBy))
            {
                query = isDescending
                    ? query.OrderByDescending(x => EF.Property<object>(x.User, sortBy))
                    : query.OrderBy(x => EF.Property<object>(x.User, sortBy));
            }

            var result = await query
                .Select(x => new ValueTuple<ApplicationUser, string>(x.User, x.RoleName))
                .ToListAsync();

            return result;
        }


        public async Task ChangeStatus(ApplicationUser user)
        {
            user.IsActive =!user.IsActive;
            await _context.SaveChangesAsync();
        }
    }
}
