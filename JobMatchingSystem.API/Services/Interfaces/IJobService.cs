using JobMatchingSystem.API.DTOs.Request;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobService
    {
        Task CreateJobAsync(CreateJobRequest request, int recruiterId);
        Task ReviewJobAsync(CensorJobRequest request, int staffId);
    }
}
