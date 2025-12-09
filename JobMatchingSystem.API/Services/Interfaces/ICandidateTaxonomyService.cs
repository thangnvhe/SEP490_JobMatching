using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateTaxonomyService
    {
        Task<CandidateTaxonomyResponse> GetByIdAsync(int id, int userId);
        Task<List<CandidateTaxonomyResponse>> GetByCandidateIdAsync(int userId);
        Task CreateAsync(CreateCandidateTaxonomyRequest request, int userId);
        Task UpdateAsync(int id, UpdateCandidateTaxonomyRequest request, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
