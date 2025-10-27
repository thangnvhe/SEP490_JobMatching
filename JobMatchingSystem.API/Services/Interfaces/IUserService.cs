using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserResponse?> GetUserByIdAsync(int id);
        Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<UserResponse?> UpdateUserProfileAsync(int userId, UpdateUserProfileRequest request, IWebHostEnvironment env);

    }
}
