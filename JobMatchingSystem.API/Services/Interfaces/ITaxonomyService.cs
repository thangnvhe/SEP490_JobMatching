using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITaxonomyService
    {
        Task<List<TaxonomyTreeResponse>> GetAllTaxonomiesAsync();
        Task<List<TaxonomyTreeResponse>> GetTaxonomyTreeAsync();
        Task<List<TaxonomyFlatResponse>> GetTaxonomyFlatListAsync();
        Task<List<TaxonomyTreeResponse>> GetChildrenByParentIdAsync(int parentId);
        Task<TaxonomyTreeResponse?> GetTaxonomyByIdAsync(int id);
        Task<List<TaxonomyTreeResponse>> GetRootTaxonomiesAsync();
        
        // CRUD operations for Taxonomy management
        Task<Taxonomy> CreateTaxonomyAsync(CreateTaxonomyRequest request);
        Task<Taxonomy> UpdateTaxonomyAsync(int id, UpdateTaxonomyRequest request);
        Task DeleteTaxonomyAsync(int id);
    }
}
