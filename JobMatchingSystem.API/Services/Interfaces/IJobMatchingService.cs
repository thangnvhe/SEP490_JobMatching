using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobMatchingService
    {
        /// <summary>
        /// Tìm kiếm các jobs phù hợp với candidate
        /// </summary>
        Task<List<JobMatchingResult>> FindMatchingJobsAsync(int candidateId, int limit = 10);

        /// <summary>
        /// Tìm kiếm các candidates phù hợp với job
        /// </summary>
        Task<List<JobMatchingResult>> FindMatchingCandidatesAsync(int jobId, int limit = 10);

        /// <summary>
        /// Tính điểm matching giữa một candidate và một job cụ thể
        /// </summary>
        Task<JobMatchingResult?> CalculateMatchingScoreAsync(int candidateId, int jobId);

        /// <summary>
        /// Tìm kiếm jobs với filters và sắp xếp theo matching score
        /// </summary>
        Task<List<JobMatchingResult>> SearchJobsWithMatchingAsync(int candidateId, 
            string? location = null, 
            int? minSalary = null, 
            int? maxSalary = null,
            List<int>? requiredSkills = null,
            int page = 1, 
            int size = 10);

        /// <summary>
        /// Tìm kiếm candidates với filters và sắp xếp theo matching score
        /// </summary>
        Task<List<JobMatchingResult>> SearchCandidatesWithMatchingAsync(int jobId,
            int? minExperience = null,
            int? maxExperience = null,
            List<int>? requiredSkills = null,
            int? educationLevelId = null,
            int page = 1,
            int size = 10);
    }
}