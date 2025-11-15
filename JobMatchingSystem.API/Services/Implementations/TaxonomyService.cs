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

        public async Task<List<Taxonomy>> GetAllTaxonomiesAsync()
        {
            return await _taxonomyRepository.GetAllAsync();
        }
    }
}
