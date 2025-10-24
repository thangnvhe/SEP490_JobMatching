using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginDTO> LoginAsync(LoginRequest request);
        Task<LoginDTO> RefreshTokenAsync();
        Task Logout(int userId);
    }
}
