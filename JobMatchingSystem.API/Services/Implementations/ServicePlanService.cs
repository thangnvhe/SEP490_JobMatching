using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
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
                Price = x.Price
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
                Price = plan.Price
            };
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

            await _servicePlanRepository.UpdateAsync(plan);
        }
    }
}
