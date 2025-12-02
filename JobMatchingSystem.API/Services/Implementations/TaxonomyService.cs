using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class TaxonomyService : ITaxonomyService
    {
        private readonly ITaxonomyRepository _taxonomyRepository;

        public TaxonomyService(ITaxonomyRepository taxonomyRepository)
        {
            _taxonomyRepository = taxonomyRepository;
        }

        public async Task<List<TaxonomyTreeResponse>> GetAllTaxonomiesAsync()
        {
            var taxonomies = await _taxonomyRepository.GetAllAsync();
            return taxonomies.Select(MapToTaxonomyResponse).ToList();
        }

        public async Task<List<TaxonomyTreeResponse>> GetTaxonomyTreeAsync()
        {
            var allTaxonomies = await _taxonomyRepository.GetAllWithChildrenAsync();
            var rootTaxonomies = allTaxonomies.Where(t => t.ParentId == null).ToList();
            
            return rootTaxonomies.Select(t => MapToTaxonomyTreeResponse(t, allTaxonomies)).ToList();
        }

        public async Task<List<TaxonomyFlatResponse>> GetTaxonomyFlatListAsync()
        {
            var taxonomies = await _taxonomyRepository.GetAllWithParentAsync();
            return taxonomies.Select(MapToTaxonomyFlatResponse).ToList();
        }

        public async Task<List<TaxonomyTreeResponse>> GetChildrenByParentIdAsync(int parentId)
        {
            var children = await _taxonomyRepository.GetChildrenByParentIdAsync(parentId);
            return children.Select(MapToTaxonomyResponse).ToList();
        }

        public async Task<TaxonomyTreeResponse?> GetTaxonomyByIdAsync(int id)
        {
            var taxonomy = await _taxonomyRepository.GetByIdAsync(id);
            return taxonomy != null ? MapToTaxonomyResponse(taxonomy) : null;
        }

        public async Task<List<TaxonomyTreeResponse>> GetRootTaxonomiesAsync()
        {
            return await _taxonomyRepository.GetRootTaxonomiesAsync().ContinueWith(t => 
                t.Result.Select(MapToTaxonomyResponse).ToList());
        }

        private static TaxonomyTreeResponse MapToTaxonomyResponse(Taxonomy taxonomy)
        {
            return new TaxonomyTreeResponse
            {
                Id = taxonomy.Id,
                Name = taxonomy.Name,
                ParentId = taxonomy.ParentId,
                Children = new List<TaxonomyTreeResponse>()
            };
        }

        private static TaxonomyTreeResponse MapToTaxonomyTreeResponse(Taxonomy taxonomy, List<Taxonomy> allTaxonomies)
        {
            var response = MapToTaxonomyResponse(taxonomy);
            
            var children = allTaxonomies.Where(t => t.ParentId == taxonomy.Id).ToList();
            response.Children = children.Select(c => MapToTaxonomyTreeResponse(c, allTaxonomies)).ToList();
            
            return response;
        }

        private static TaxonomyFlatResponse MapToTaxonomyFlatResponse(Taxonomy taxonomy)
        {
            return new TaxonomyFlatResponse
            {
                Id = taxonomy.Id,
                Name = taxonomy.Name,
                ParentId = taxonomy.ParentId,
                ParentName = taxonomy.Parent?.Name,
                HasChildren = taxonomy.Children?.Any() == true
            };
        }
    }
}
