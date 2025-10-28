// File: Services/Interfaces/IDataCVService.cs
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IDataCVService
    {
        Task<List<DataCV>> GetActiveCVsByUserIdAsync(int userId);
        Task<string> CreateCVAsync(CreateCVRequest request, int userId);
        Task DeleteCVAsync(int cvId, int userId);
        Task SetPrimaryCVAsync(int cvId, int userId);
    }
}