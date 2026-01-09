using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class SystemConfigService : ISystemConfigService
    {
        private readonly ISystemConfigRepository _repository;

        public SystemConfigService(ISystemConfigRepository repository)
        {
            _repository = repository;
        }

        public async Task<SystemConfigResponse> GetByIdAsync(int id)
        {
            var config = await _repository.GetByIdAsync(id);

            if (config == null)
                throw new AppException(ErrorCode.NotFoundSystemConfig());

            return new SystemConfigResponse
            {
                Id = config.Id,
                Type = config.Type,
                Name = config.Name,
                Value = config.Value
            };
        }

        public async Task<List<SystemConfigResponse>> GetAllAsync()
        {
            var configs = await _repository.GetAllAsync();

            return configs.Select(x => new SystemConfigResponse
            {
                Id = x.Id,
                Type = x.Type,
                Name = x.Name,
                Value = x.Value
            }).ToList();
        }

        public async Task CreateAsync(CreateSystemConfigRequest request)
        {
            var config = new SystemConfig
            {
                Type = request.Type,
                Name = request.Name,
                Value = request.Value
            };

            await _repository.CreateAsync(config);
        }

        public async Task UpdateAsync(int id, UpdateSystemConfigRequest request)
        {
            var config = await _repository.GetByIdAsync(id);

            if (config == null)
                throw new AppException(ErrorCode.NotFoundSystemConfig());

            config.Value = request.Value;

            await _repository.UpdateAsync(config);
        }
    }
}
