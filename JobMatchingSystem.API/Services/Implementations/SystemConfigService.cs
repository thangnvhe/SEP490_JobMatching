using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class SystemConfigService : ISystemConfigService
    {
        private readonly ISystemConfigRepository _repository;
        private readonly ApplicationDbContext _context;

        public SystemConfigService(ISystemConfigRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
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

            var oldValue = config.Value;
            config.Value = request.Value;

            if (config.Type == "job" && config.Name == "SaveCV")
            {
                if (int.TryParse(oldValue, out int oldSaveCv) &&
                    int.TryParse(request.Value, out int newSaveCv))
                {
                    var delta = newSaveCv - oldSaveCv;

                    var users = await _context.Users.ToListAsync();

                    foreach (var user in users)
                    {
                        if (user.SaveCVCount.HasValue)
                        {
                            user.SaveCVCount = Math.Max(0, user.SaveCVCount.Value + delta);
                        }
                        else
                        {
                            user.SaveCVCount = Math.Max(0, delta);
                        }
                    }

                    _context.Users.UpdateRange(users);
                }
            }

            await _repository.UpdateAsync(config);
        }
    }
}
