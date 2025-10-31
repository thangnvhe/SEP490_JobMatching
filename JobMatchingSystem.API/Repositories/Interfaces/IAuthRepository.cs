using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
        Task<IList<string>> GetRolesAsync(ApplicationUser user);
        Task UpdateUserAsync(ApplicationUser user);
        Task<ApplicationUser?>GetUserByRefreshToken(string refreshToken);
        Task<ApplicationUser?> GetUserById(int id);
        Task<bool> ExistsAsync(string email);
        Task<List<(ApplicationUser User, string RoleName)>> GetAllAsync(string search, int roleId, string sortBy, bool isDescending);
        Task ChangeStatus(ApplicationUser user);
    }
}
