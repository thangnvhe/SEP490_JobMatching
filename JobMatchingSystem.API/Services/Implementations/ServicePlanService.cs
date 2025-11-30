using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class ServicePlanService : IServicePlanService
    {
        private readonly IServicePlanRepository _servicePlanRepository;

        public ServicePlanService(IServicePlanRepository servicePlanRepository)
        {
            _servicePlanRepository = servicePlanRepository;
        }

        public async Task<List<ServicePlanResponse>> GetAllAsync()
        {
            var list = await _servicePlanRepository.GetAllAsync();
            return list.Select(x => new ServicePlanResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Price = x.Price,
                JobPostAdditional = x.JobPostAdditional,
                HighlightJobDays = x.HighlightJobDays,
                HighlightJobDaysCount = x.HighlightJobDaysCount,
                ExtensionJobDays = x.ExtensionJobDays,
                ExtensionJobDaysCount = x.ExtensionJobDaysCount,
                CVSaveAdditional = x.CVSaveAdditional
            }).ToList();
        }

        public async Task<ServicePlanResponse> GetByIdAsync(int id)
        {
            var plan = await _servicePlanRepository.GetByIdAsync(id);

            if (plan == null)
                throw new AppException(ErrorCode.NotFoundServicePlan());

            return new ServicePlanResponse
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                Price = plan.Price,
                JobPostAdditional = plan.JobPostAdditional,
                HighlightJobDays = plan.HighlightJobDays,
                HighlightJobDaysCount = plan.HighlightJobDaysCount,
                ExtensionJobDays = plan.ExtensionJobDays,
                ExtensionJobDaysCount = plan.ExtensionJobDaysCount,
                CVSaveAdditional = plan.CVSaveAdditional
            };
        }

        public async Task CreateAsync(CreateServicePlanRequest request)
        {
            var newPlan = new ServicePlan
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                JobPostAdditional = request.JobPostAdditional,
                HighlightJobDays = request.HighlightJobDays,
                HighlightJobDaysCount = request.HighlightJobDaysCount,
                ExtensionJobDays = request.ExtensionJobDays,
                ExtensionJobDaysCount = request.ExtensionJobDaysCount,
                CVSaveAdditional = request.CVSaveAdditional
            };

            await _servicePlanRepository.AddAsync(newPlan);
        }

        public async Task UpdateAsync(int id, UpdateServicePlanRequest request)
        {
            var plan = await _servicePlanRepository.GetByIdAsync(id);
            if (plan == null)
                throw new AppException(ErrorCode.NotFoundServicePlan());

            if (!string.IsNullOrEmpty(request.Name))
                plan.Name = request.Name;

            if (!string.IsNullOrEmpty(request.Description))
                plan.Description = request.Description;

            if (request.Price.HasValue && request.Price.Value > 0)
                plan.Price = request.Price.Value;

            if (request.JobPostAdditional.HasValue)
                plan.JobPostAdditional = request.JobPostAdditional;

            if (request.HighlightJobDays.HasValue)
                plan.HighlightJobDays = request.HighlightJobDays;

            if (request.HighlightJobDaysCount.HasValue)
                plan.HighlightJobDaysCount = request.HighlightJobDaysCount;

            if (request.ExtensionJobDays.HasValue)
                plan.ExtensionJobDays = request.ExtensionJobDays;

            if (request.ExtensionJobDaysCount.HasValue)
                plan.ExtensionJobDaysCount = request.ExtensionJobDaysCount;

            if (request.CVSaveAdditional.HasValue)
                plan.CVSaveAdditional = request.CVSaveAdditional;

            await _servicePlanRepository.UpdateAsync(plan);
        }

        public async Task DeleteAsync(int id)
        {
            var plan = await _servicePlanRepository.GetByIdAsync(id);
            if (plan == null)
                throw new AppException(ErrorCode.NotFoundServicePlan());

            await _servicePlanRepository.DeleteAsync(plan);
        }
    }
}
