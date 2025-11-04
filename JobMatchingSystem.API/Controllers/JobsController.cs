using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobController : ControllerBase
    {
        private readonly IJobService _jobService;

        public JobController(IJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpPost]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
        {
            var recruiterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _jobService.CreateJobAsync(request, recruiterId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Job created successfully")
                .Build());
        }

        [HttpPut("censor")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> ReviewJob([FromBody] CensorJobRequest request)
        {
            var staffId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _jobService.ReviewJobAsync(request, staffId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(new
                {
                    request.JobId,
                    Status = request.Status.ToString(),
                    VerifiedBy = staffId
                })
                .Build());
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJobs([FromQuery] string? title, [FromQuery] int? salaryMin, [FromQuery] int? salaryMax,
                                            [FromQuery] string? location, [FromQuery] JobType? jobType, [FromQuery] JobStatus? status,
                                            [FromQuery] int? companyId, [FromQuery] int? poster, [FromQuery] List<int>? taxonomyIds)
        {
            var result = await _jobService.GetAllJobsAsync(title, salaryMin, salaryMax, location, jobType, status, companyId, poster, taxonomyIds);
            return Ok(APIResponse<List<JobResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

    }
}
