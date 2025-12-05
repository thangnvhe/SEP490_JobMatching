using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IPositionRepository
    {
        Task<IEnumerable<Position>> GetAllAsync();
        Task<Position?> GetByIdAsync(int id);
        Task<Position> CreateAsync(Position position);
        Task<Position> UpdateAsync(Position position);
        Task DeleteAsync(int id);
    }
}
