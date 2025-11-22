using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
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
        Task<List<ApplicationUser>> GetAllAsync(string search, string sortBy, bool IsDecending);
        Task ChangeStatus(ApplicationUser user);
        Task<ApplicationUser?> FindUserByCompanyId(int companyId);
        Task<List<UserWithRole>> GetAllWithRolesAsync(string search, string sortBy, bool isDescending);
        Task<UserWithRole?> GetUserWithRoleByIdAsync(int userId);
        Task<List<UserResponseDTO>> GetListHmByCompanyId(int companyId);
    }
}
