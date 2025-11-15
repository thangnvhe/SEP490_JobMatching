using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        [HttpGet("{jobId}")]
        public async Task<IActionResult> GetJob(int jobId)
        {
            var job = await _jobService.GetJobByIdAsync(jobId);

            return Ok(APIResponse<JobDetailResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(job)
                .Build());
        }

        [HttpGet]
        public async Task<IActionResult> GetJobs([FromQuery] GetJobRequest request)
        {
            var jobs = await _jobService.GetJobsAsync(request);

            return Ok(APIResponse<List<JobDetailResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(jobs)
                .Build());
        }

        [HttpPost]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _jobService.CreateJobAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Job created successfully")
                .Build());
        }

        [HttpPut("{jobId}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> UpdateJob(int jobId, [FromBody] UpdateJobRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _jobService.UpdateJobAsync(jobId, request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Job updated successfully")
                .Build());
        }

        [HttpPut("{jobId}/censor")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CensorJob(int jobId, [FromBody] CensorJobRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _jobService.CensorJobAsync(jobId, request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Job censored successfully")
                .Build());
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetJobsPaged([FromQuery] GetJobPagedRequest request)
        {
            var result = await _jobService.GetJobsPagedAsync(request);
            return Ok(APIResponse<PagedResult<JobDetailResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }
    }
}
