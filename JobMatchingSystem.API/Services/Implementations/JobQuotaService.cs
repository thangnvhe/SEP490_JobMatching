using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class JobQuotaService : IJobQuotaService
    {
        private readonly IJobQuotaRepository _jobQuotaRepository;

        public JobQuotaService(IJobQuotaRepository jobQuotaRepository)
        {
            _jobQuotaRepository = jobQuotaRepository;
        }

        public async Task<JobQuotaResponse> GetByUserIdAsync(int userId)
        {
            var quota = await _jobQuotaRepository.GetByRecruiterIdAsync(userId);

            if (quota == null)
                throw new AppException(ErrorCode.NotFoundJobQuota());

            return new JobQuotaResponse
            {
                Id = quota.Id,
                MonthlyQuota = quota.MonthlyQuota,
                ExtraQuota = quota.ExtraQuota
            };
        }

    }
}
