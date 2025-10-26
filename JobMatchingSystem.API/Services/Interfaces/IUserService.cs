using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<List<UserResponseDTO>> GetAllUser();
        Task<UserResponseDTO> GetUserById(int userId);
        Task CreateUserByAdminAsync(CreateUserByAdminRequest request);
        Task ChangeStatus(int userId);
    }
}
