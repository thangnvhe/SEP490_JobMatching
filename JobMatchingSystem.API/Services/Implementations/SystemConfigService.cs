using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
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

        public async Task<SystemConfig> GetDefaultAsync()
        {
            var config = await _repository.GetDefaultAsync();

            if (config == null)
                throw new AppException(ErrorCode.NotFoundSystemConfig());

            return config;
        }
        public async Task UpdateDefaultAsync(UpdateSystemConfigRequest request)
        {
            var config = await _repository.GetDefaultAsync();

            if (config == null)
                throw new AppException(ErrorCode.NotFoundSystemConfig());

            int oldSaveCV = config.SaveCV;
            int newSaveCV = request.SaveCV;

            // Lấy danh sách user cần update (ví dụ Candidate)
            var users = await _context.Users
                .Where(x => x.SaveCVCount >= 0)
                .ToListAsync();

            foreach (var user in users)
            {
                int? used = oldSaveCV - user.SaveCVCount;
                if (used < 0) used = 0; // phòng trường hợp dữ liệu lỗi

                user.SaveCVCount = newSaveCV - used;

                if (user.SaveCVCount < 0)
                    user.SaveCVCount = 0;
            }

            // Update config
            config.JobQuota = request.JobQuota;
            config.SaveCV = request.SaveCV;

            config.CompanyFraudulentPenalty = request.CompanyFraudulentPenalty;
            config.CompanySpamPenalty = request.CompanySpamPenalty;
            config.CompanyInappropriatePenalty = request.CompanyInappropriatePenalty;
            config.CompanyOtherPenalty = request.CompanyOtherPenalty;

            config.ReporterFraudulentPenalty = request.ReporterFraudulentPenalty;
            config.ReporterSpamPenalty = request.ReporterSpamPenalty;
            config.ReporterInappropriatePenalty = request.ReporterInappropriatePenalty;
            config.ReporterOtherPenalty = request.ReporterOtherPenalty;

            await _context.SaveChangesAsync();
        }

    }
}
