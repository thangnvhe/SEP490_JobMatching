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
            // Kiểm tra xem user có đăng nhập không
            int? userId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int parsedUserId))
                {
                    userId = parsedUserId;
                }
            }

            var job = await _jobService.GetJobByIdAsync(jobId, userId);

            return Ok(APIResponse<JobDetailResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(job)
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _jobService.DeleteJobAsync(id, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Job deleted successfully")
                .Build());
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetJobsPaged([FromQuery] GetJobPagedRequest request)
        {
            // Kiểm tra xem user có đăng nhập không
            int? userId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int parsedUserId))
                {
                    userId = parsedUserId;
                }
            }

            // Gọi service với userId (nếu có)
            var result = userId.HasValue 
                ? await _jobService.GetJobsPagedAsync(request, userId.Value)
                : await _jobService.GetJobsPagedAsync(request);
                
            return Ok(APIResponse<PagedResult<JobDetailResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        [HttpGet("my-jobs")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> GetMyJobs([FromQuery] GetJobPagedRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Tự động set recruiterId từ user đang đăng nhập
            request.recuiterId = userId;

            var result = await _jobService.GetJobsPagedAsync(request, userId);
                
            return Ok(APIResponse<PagedResult<JobDetailResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }
    }
}
