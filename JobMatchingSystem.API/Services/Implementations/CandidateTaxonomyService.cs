using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CandidateTaxonomyService : ICandidateTaxonomyService
    {
        private readonly ICandidateTaxonomyRepository _candidateTaxonomyRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public CandidateTaxonomyService(ICandidateTaxonomyRepository repo,
                          UserManager<ApplicationUser> userManager)
        {
            _candidateTaxonomyRepository = repo;
            _userManager = userManager;
        }

        public async Task<CandidateTaxonomyResponse> GetByIdAsync(int id, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var entity = await _candidateTaxonomyRepository.GetByIdAsync(id);

            if (entity == null)
                throw new AppException(ErrorCode.NotFoundCanTaxonomy());

            return new CandidateTaxonomyResponse
            {
                Id = entity.Id,
                CandidateId = entity.CandidateId,
                TaxonomyId = entity.TaxonomyId,
                ExperienceYear = entity.ExperienceYear,
                TaxonomyName = entity.Taxonomy?.Name
            };
        }

        public async Task<List<CandidateTaxonomyResponse>> GetByCandidateIdAsync(int userId)
        {
            var list = await _candidateTaxonomyRepository.GetByCandidateIdAsync(userId);

            return list.Select(x => new CandidateTaxonomyResponse
            {
                Id = x.Id,
                CandidateId = x.CandidateId,
                TaxonomyId = x.TaxonomyId,
                ExperienceYear = x.ExperienceYear,
                TaxonomyName = x.Taxonomy?.Name
            }).ToList();
        }

        public async Task CreateAsync(CreateCandidateTaxonomyRequest request, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            // Kiểm tra taxonomy có tồn tại không
            bool taxonomyExists = await _candidateTaxonomyRepository.TaxonomyExistsAsync(request.TaxonomyId);
            if (!taxonomyExists)
                throw new AppException(ErrorCode.NotFoundCanTaxonomy());

            var entity = new CandidateTaxonomy
            {
                CandidateId = userId,
                TaxonomyId = request.TaxonomyId,
                ExperienceYear = request.ExperienceYear
            };

            await _candidateTaxonomyRepository.CreateAsync(entity);
        }

        public async Task UpdateAsync(int id, UpdateCandidateTaxonomyRequest request, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var entity = await _candidateTaxonomyRepository.GetByIdAsync(id);

            if (entity == null)
                throw new AppException(ErrorCode.NotFoundCanTaxonomy());

            if (entity.CandidateId != userId)
                throw new AppException(ErrorCode.NotFoundCanTaxonomy());

            // Kiểm tra taxonomy có tồn tại không
            bool taxonomyExists = await _candidateTaxonomyRepository.TaxonomyExistsAsync(request.TaxonomyId);
            if (!taxonomyExists)
                throw new AppException(ErrorCode.NotFoundCanTaxonomy());

            entity.TaxonomyId = request.TaxonomyId;
            entity.ExperienceYear = request.ExperienceYear;

            await _candidateTaxonomyRepository.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var entity = await _candidateTaxonomyRepository.GetByIdAsync(id);

            if (entity == null)
                throw new AppException(ErrorCode.NotFoundCanTaxonomy());

            if (entity.CandidateId != userId)
                throw new AppException(ErrorCode.NotFoundCanTaxonomy());

            await _candidateTaxonomyRepository.DeleteAsync(entity);
        }
    }
}
