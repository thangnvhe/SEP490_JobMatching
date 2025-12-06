using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITaxonomyService
    {
        Task<IEnumerable<TaxonomyResponse>> GetAllTaxonomiesAsync();
        Task<PagedResult<TaxonomyResponse>> GetAllPagedAsync(int page, int pageSize, string sortBy, bool isDescending, string search);
        Task<TaxonomyResponse?> GetByIdAsync(int id);
        Task<IEnumerable<TaxonomyResponse>> GetChildrenByParentIdAsync(int parentId);
        
        // CRUD operations for Taxonomy management
        Task<Taxonomy> CreateTaxonomyAsync(CreateTaxonomyRequest request);
        Task<Taxonomy> UpdateTaxonomyAsync(int id, UpdateTaxonomyRequest request);
        Task DeleteTaxonomyAsync(int id);
    }
}
