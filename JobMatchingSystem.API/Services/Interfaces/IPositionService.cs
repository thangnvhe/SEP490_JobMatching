using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IPositionService
    {
        Task<IEnumerable<PositionResponse>> GetAllAsync();
        Task<PositionResponse> GetByIdAsync(int id);
        Task<PositionResponse> CreateAsync(int candidateId, int positionId);
        Task UpdateCandidatePositionAsync(int candidateId, int positionId);
        
        // CRUD operations for Position management
        Task<Position> CreatePositionAsync(CreatePositionRequest request);
        Task<Position> UpdatePositionAsync(int id, UpdatePositionRequest request);
        Task DeletePositionAsync(int id);
    }
}
