using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JobMatchingController : ControllerBase
    {
        private readonly IJobMatchingService _jobMatchingService;

        public JobMatchingController(IJobMatchingService jobMatchingService)
        {
            _jobMatchingService = jobMatchingService;
        }

        /// <summary>
        /// Tìm kiếm jobs với filters và matching score
        /// </summary>
        [HttpGet("jobs-for-me")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> SearchJobsWithMatching(
            [FromQuery] string? location = null,
            [FromQuery] int? minSalary = null,
            [FromQuery] int? maxSalary = null,
            [FromQuery] List<int>? requiredSkills = null,
            [FromQuery] int page = 1,
            [FromQuery] int size = 10,
            [FromQuery] string sortBy = "",
            [FromQuery] bool isDescending = false)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int candidateId))
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult("ID người dùng không hợp lệ")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .Build());
            }

            var matchingJobs = await _jobMatchingService.SearchJobsWithMatchingDetailAsync(
                candidateId, location, minSalary, maxSalary, requiredSkills, page, size, sortBy, isDescending);

            return Ok(APIResponse<PagedResult<JobDetailResponse>>.Builder()
                .WithResult(matchingJobs)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        /// <summary>
        /// Tìm kiếm candidates với filters và matching score
        /// </summary>
        [HttpGet("candidates-for-job")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> SearchCandidatesWithMatching(
            [FromQuery] int jobId,
            [FromQuery] int? minExperience = null,
            [FromQuery] int? maxExperience = null,
            [FromQuery] List<int>? requiredSkills = null,
            [FromQuery] int? educationLevelId = null,
            [FromQuery] int page = 1,
            [FromQuery] int size = 10)
        {
            var matchingCandidates = await _jobMatchingService.SearchCandidatesWithMatchingAsync(
                jobId, minExperience, maxExperience, requiredSkills, educationLevelId, page, size);

            return Ok(APIResponse<PagedResult<CandidateMatchingResult>>.Builder()
                .WithResult(matchingCandidates)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}