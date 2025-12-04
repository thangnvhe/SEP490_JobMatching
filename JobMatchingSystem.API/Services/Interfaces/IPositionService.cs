using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.DTOs.Request;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IPositionService
    {
        Task<IEnumerable<PositionResponse>> GetAllAsync();
        Task<PositionResponse> GetByIdAsync(int id);
        Task<PositionResponse> CreateAsync(int candidateId, int positionId);
        Task UpdateCandidatePositionAsync(int candidateId, int positionId);
    }
}
