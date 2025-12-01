using JobMatchingSystem.API.DTOs.Response;

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
    }
}
