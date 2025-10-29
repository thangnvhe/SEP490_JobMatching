// File: Repositories/Interfaces/IDataCVRepository.cs
using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IDataCVRepository
    {
        Task AddAsync(DataCV cv);
        Task<DataCV?> GetByIdAsync(int cvId, int userId);
        Task<DataCV?> GetPrimaryCVAsync(int userId);
        Task<List<DataCV>> GetActiveCVsByUserIdAsync(int userId);
        Task UpdateAsync(DataCV cv);
        Task SaveChangesAsync();
    }
}