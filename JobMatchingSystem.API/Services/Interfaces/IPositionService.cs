using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IPositionService
    {
        Task<IEnumerable<PositionResponse>> GetAllAsync();
        Task<PositionResponse> GetByIdAsync(int id);
    }
}
