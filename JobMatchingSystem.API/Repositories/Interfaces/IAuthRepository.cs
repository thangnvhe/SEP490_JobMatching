using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
        Task<IList<string>> GetRolesAsync(ApplicationUser user);
        Task UpdateUserAsync(ApplicationUser user);
        Task<ApplicationUser?> GetUserByRefreshToken(string refreshToken);
        Task<ApplicationUser?> GetUserById(int id);
        Task<bool> ExistsAsync(string email);
        Task<List<ApplicationUser>> GetAllAsync(string search, int roleId);
        Task ChangeStatus(ApplicationUser user);
    }
}
