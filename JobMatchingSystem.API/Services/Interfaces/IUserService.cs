using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<PagedResult<UserDetailResponseDTO>> GetAllUser(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false, int? companyId = null, string? role = null);
        Task<UserDetailResponseDTO> GetUserById(int userId);
        Task ChangeStatus(int userId);
        Task<UserDetailResponseDTO> GetCurrentUser(string userId);
        Task<UserDetailResponseDTO> UpdateCurrentUser(string userId, UpdateCurrentUserRequest request);
        Task<UserDetailResponseDTO> CreateHiringManager(CreateHiringManagerRequest request);
        Task CleanupUserAvatarAsync(int userId);
    }
}
