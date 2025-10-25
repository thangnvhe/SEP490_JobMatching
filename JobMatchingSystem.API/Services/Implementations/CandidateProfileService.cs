using Azure.Core;
using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CandidateProfileService : ICandidateProfileService
    {
        private readonly ICandidateProfileRepository _profileRepository;
        private readonly ApplicationDbContext _context;

        public CandidateProfileService(ICandidateProfileRepository profileRepository, ApplicationDbContext context)
        {
            _profileRepository = profileRepository;
            _context = context;
        }

        public async Task<CandidateProfileResponse?> GetProfileByUserIdAsync(int userId)
        {
            var profile = await _profileRepository.GetByUserIdAsync(userId);

            if (profile == null)
                throw new AppException(ErrorCode.NotFoundCandidateProfile());

            var taxonomyIds = await _context.EntityTaxonomies
                .Where(e => e.EntityType == EntityType.CandidateProfile && e.EntityId == profile.ProfileId)
                .Select(e => e.TaxonomyId)
                .ToListAsync();

            return new CandidateProfileResponse
            {
                ProfileId = profile.ProfileId,
                UserId = profile.UserId,
                ExperienceYears = profile.ExperienceYears,
                SalaryExpect = profile.SalaryExpect,
                Location = profile.Location,
                JobType = profile.JobType,
                CreatedAt = profile.CreatedAt,
                UpdatedAt = profile.UpdatedAt,
                TaxonomyIds = taxonomyIds
            };
        }

        public async Task CreateOrUpdateProfileAsync(CreateOrUpdateCandidateProfileRequest request, int userId)
        {
            var existingProfile = await _profileRepository.GetByUserIdAsync(userId);

            if (existingProfile == null)
            {
                // ✅ Tạo mới
                var newProfile = new CandidateProfile
                {
                    UserId = userId,
                    ExperienceYears = request.ExperienceYears,
                    SalaryExpect = request.SalaryExpect,
                    Location = request.Location,
                    JobType = request.JobType,
                    CreatedAt = DateTime.Now
                };

                await _profileRepository.AddAsync(newProfile);

                // Thêm taxonomy
                if (request.TaxonomyIds != null && request.TaxonomyIds.Any())
                {
                    var entityTaxonomies = request.TaxonomyIds.Select(id => new EntityTaxonomy
                    {
                        EntityType = EntityType.CandidateProfile,
                        EntityId = newProfile.ProfileId,
                        TaxonomyId = id,
                        CreatedAt = DateTime.Now
                    }).ToList();

                    await _context.EntityTaxonomies.AddRangeAsync(entityTaxonomies);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                // ✅ Cập nhật
                existingProfile.ExperienceYears = request.ExperienceYears;
                existingProfile.SalaryExpect = request.SalaryExpect;
                existingProfile.Location = request.Location;
                existingProfile.JobType = request.JobType;
                existingProfile.UpdatedAt = DateTime.Now;

                await _profileRepository.UpdateAsync(existingProfile);

                // Cập nhật taxonomy (xóa cũ, thêm mới)
                var oldTaxonomies = await _context.EntityTaxonomies
                    .Where(e => e.EntityType == EntityType.CandidateProfile && e.EntityId == existingProfile.ProfileId)
                    .ToListAsync();

                _context.EntityTaxonomies.RemoveRange(oldTaxonomies);

                if (request.TaxonomyIds != null && request.TaxonomyIds.Any())
                {
                    var newTaxonomies = request.TaxonomyIds.Select(id => new EntityTaxonomy
                    {
                        EntityType = EntityType.CandidateProfile,
                        EntityId = existingProfile.ProfileId,
                        TaxonomyId = id,
                        CreatedAt = DateTime.Now
                    }).ToList();

                    await _context.EntityTaxonomies.AddRangeAsync(newTaxonomies);
                }

                await _context.SaveChangesAsync();
            }
        }
    }
}
