using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICandidateTaxonomyRepository
    {
        Task<CandidateTaxonomy?> GetByIdAsync(int id);
        Task<List<CandidateTaxonomy>> GetByCandidateIdAsync(int candidateId);
        Task CreateAsync(CandidateTaxonomy entity);
        Task DeleteAsync(CandidateTaxonomy entity);
        Task<bool> TaxonomyExistsAsync(int taxonomyId);
    }
}
