using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobMatchingService
    {
        /// <summary>
        /// Tìm kiếm jobs với filters, pagination và trả về JobDetailResponse
        /// </summary>
        Task<List<JobDetailResponse>> SearchJobsWithMatchingDetailAsync(int candidateId, 
            string? location = null, 
            int? minSalary = null, 
            int? maxSalary = null,
            List<int>? requiredSkills = null,
            int page = 1, 
            int size = 10,
            string sortBy = "",
            bool isDescending = false);

        /// <summary>
        /// Tìm kiếm candidates với filters và sắp xếp theo matching score
        /// </summary>
        Task<List<CandidateMatchingResult>> SearchCandidatesWithMatchingAsync(int jobId,
            int? minExperience = null,
            int? maxExperience = null,
            List<int>? requiredSkills = null,
            int? educationLevelId = null,
            int page = 1,
            int size = 10);
    }
}