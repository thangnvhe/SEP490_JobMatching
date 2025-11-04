using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
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

        public async Task<IEnumerable<Taxonomy>> GetAllSkillsAsync()
        {
            return await _taxonomyRepository.GetAllSkillsAsync();
        }

        public async Task<Taxonomy> GetSkillByIdAsync(int id)
        {
            var skill = await _taxonomyRepository.GetSkillByIdAsync(id);
            if (skill == null)
                throw new AppException(ErrorCode.NotFoundSkill());
            return skill;
        }
    }
}
