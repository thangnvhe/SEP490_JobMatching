using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.DTOs;
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
    public class CandidateJobController : ControllerBase
    {
        private readonly ICandidateJobService _candidateJobService;

        public CandidateJobController(ICandidateJobService candidateJobService)
        {
            _candidateJobService = candidateJobService;
        }
        [HttpGet("job/{jobId}")]
        public async Task<IActionResult> GetAllByJobId(
    int jobId,
    int page = 1,
    int size = 5,
    string status = "",
    string sortBy = "",
    bool isDescending = false)
        {
            var result = await _candidateJobService.GetAllByJobId(jobId, page, size, status, sortBy, isDescending);

            return Ok(APIResponse<PagedResult<CandidateJobDTO>>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        
        [HttpGet("me")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMyApplications(
            int page = 1,
            int size = 10,
            string status = "",
            string sortBy = "",
            bool isDescending = false)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(APIResponse<object>.Builder()
                    .WithResult(new { message = "Không thể xác thực người dùng" })
                    .WithSuccess(false)
                    .WithMessage("Unauthorized")
                    .WithStatusCode(HttpStatusCode.Unauthorized)
                    .Build());
            }

            var result = await _candidateJobService.GetAllByUserId(userId, page, size, status, sortBy, isDescending);

            return Ok(APIResponse<PagedResult<CandidateJobDTO>>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetailById(int id)
        {
            var candidateJob = await _candidateJobService.GetDetailById(id);

            return Ok(APIResponse<CandidateJobDTO>.Builder()
                .WithResult(candidateJob)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateCandidateJobRequest request)
        {
            await _candidateJobService.Add(request);
            return Ok(APIResponse<object>.Builder()
                .WithResult(new { message = "Apply CV thành công" })
                .WithSuccess(true)
                .WithMessage("Apply CV thành công")
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveCV(int id)
        {
            await _candidateJobService.ApproveCV(id);
            return Ok(APIResponse<object>.Builder()
                .WithResult(new { message = "CV đã được duyệt" })
                .WithSuccess(true)
                .WithMessage("CV đã được duyệt")
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectCV(int id)
        {
            await _candidateJobService.RejectCV(id);
            return Ok(APIResponse<object>.Builder()
                .WithResult(new { message = "CV đã bị từ chối" })
                .WithSuccess(true)
                .WithMessage("CV đã bị từ chối")
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}
