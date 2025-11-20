using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<PagedResult<UserResponseDTO>> GetAllUser(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false);
        Task<UserResponseDTO> GetUserById(int userId);
        Task ChangeStatus(int userId);
        Task<CurrentUserResponseDTO> GetCurrentUser(string userId);
    }
}
