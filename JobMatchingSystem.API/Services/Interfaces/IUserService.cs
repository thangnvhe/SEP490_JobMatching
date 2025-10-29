using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<PagedResult<UserResponseDTO>> GetAllUser(int page = 1, int size = 5,string search="",int role=0);
        Task<UserResponseDTO> GetUserById(int userId);
        Task CreateUserByAdminAsync(CreateUserByAdminRequest request);
        Task ChangeStatus(int userId);
        Task<UserResponse?> GetUserByIdAsync(int id);
        Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<UserResponse?> UpdateUserProfileAsync(int userId, UpdateUserProfileRequest request, IWebHostEnvironment env);
    }
}
