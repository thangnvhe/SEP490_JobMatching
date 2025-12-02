using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Response;
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
        /// Tìm kiếm jobs phù hợp với candidate hiện tại
        /// </summary>
        [HttpGet("jobs-for-me")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMatchingJobsForCurrentUser([FromQuery] int limit = 10)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int candidateId))
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult("Invalid user ID")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .Build());
            }

            var matchingJobs = await _jobMatchingService.FindMatchingJobsAsync(candidateId, limit);

            return Ok(APIResponse<List<JobMatchingResult>>.Builder()
                .WithResult(matchingJobs)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        /// <summary>
        /// Tìm kiếm candidates phù hợp với job cụ thể
        /// </summary>
        [HttpGet("candidates-for-job/{jobId}")]
        [Authorize(Roles = "HiringManager,Recruiter")]
        public async Task<IActionResult> GetMatchingCandidatesForJob(int jobId, [FromQuery] int limit = 10)
        {
            var matchingCandidates = await _jobMatchingService.FindMatchingCandidatesAsync(jobId, limit);

            return Ok(APIResponse<List<JobMatchingResult>>.Builder()
                .WithResult(matchingCandidates)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        /// <summary>
        /// Tính điểm matching giữa candidate và job cụ thể
        /// </summary>
        [HttpGet("score")]
        public async Task<IActionResult> GetMatchingScore([FromQuery] int candidateId, [FromQuery] int jobId)
        {
            var matchingResult = await _jobMatchingService.CalculateMatchingScoreAsync(candidateId, jobId);

            if (matchingResult == null)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithResult("Candidate or Job not found")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .Build());
            }

            return Ok(APIResponse<JobMatchingResult>.Builder()
                .WithResult(matchingResult)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        /// <summary>
        /// Tìm kiếm jobs với filters và matching score
        /// </summary>
        [HttpGet("search-jobs")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> SearchJobsWithMatching(
            [FromQuery] string? location = null,
            [FromQuery] int? minSalary = null,
            [FromQuery] int? maxSalary = null,
            [FromQuery] List<int>? requiredSkills = null,
            [FromQuery] int page = 1,
            [FromQuery] int size = 10)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int candidateId))
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult("Invalid user ID")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .Build());
            }

            var matchingJobs = await _jobMatchingService.SearchJobsWithMatchingAsync(
                candidateId, location, minSalary, maxSalary, requiredSkills, page, size);

            return Ok(APIResponse<List<JobMatchingResult>>.Builder()
                .WithResult(matchingJobs)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        /// <summary>
        /// Tìm kiếm candidates với filters và matching score
        /// </summary>
        [HttpGet("search-candidates")]
        [Authorize(Roles = "HiringManager,Recruiter")]
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

            return Ok(APIResponse<List<JobMatchingResult>>.Builder()
                .WithResult(matchingCandidates)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        /// <summary>
        /// Thống kê matching score distribution cho job
        /// </summary>
        [HttpGet("job-stats/{jobId}")]
        [Authorize(Roles = "HiringManager,Recruiter")]
        public async Task<IActionResult> GetJobMatchingStats(int jobId)
        {
            var matchingCandidates = await _jobMatchingService.FindMatchingCandidatesAsync(jobId, 1000); // Get more for stats

            var stats = new
            {
                TotalCandidates = matchingCandidates.Count,
                ExcellentMatch = matchingCandidates.Count(c => c.TotalScore >= 80),
                GoodMatch = matchingCandidates.Count(c => c.TotalScore >= 60 && c.TotalScore < 80),
                FairMatch = matchingCandidates.Count(c => c.TotalScore >= 40 && c.TotalScore < 60),
                PoorMatch = matchingCandidates.Count(c => c.TotalScore < 40),
                AverageScore = matchingCandidates.Any() ? Math.Round(matchingCandidates.Average(c => c.TotalScore), 2) : 0,
                TopCandidates = matchingCandidates.OrderByDescending(c => c.TotalScore).Take(5).ToList()
            };

            return Ok(APIResponse<object>.Builder()
                .WithResult(stats)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}