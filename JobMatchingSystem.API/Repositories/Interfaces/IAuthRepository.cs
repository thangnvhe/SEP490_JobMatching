using JobMatchingSystem.API.Models;
using Microsoft.AspNetCore.Identity;

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
        Task<List<ApplicationUser>> GetAllAsync(string search, string sortBy, bool IsDecending);
        Task ChangeStatus(ApplicationUser user);
        Task<ApplicationUser?> FindUserByCompanyId(int companyId);
    }
}
