using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
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
    public class JobTaxonomyController : ControllerBase
    {
        private readonly IJobTaxonomyService _service;

        public JobTaxonomyController(IJobTaxonomyService service)
        {
            _service = service;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            return Ok(APIResponse<JobTaxonomyResponse>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .WithResult(result)
                .Build());
        }

        [HttpGet("job/{jobId}")]
        public async Task<IActionResult> GetByJob(int jobId)
        {
            var result = await _service.GetByJobIdAsync(jobId);

            return Ok(APIResponse<List<JobTaxonomyResponse>>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .WithResult(result)
                .Build());
        }

        [HttpPost]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> Create([FromBody] CreateJobTaxonomyRequest request)
        {
            int userId = GetCurrentUserId();

            await _service.CreateAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.Created)
                .WithResult("Thêm thành công")
                .Build());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = GetCurrentUserId();

            await _service.DeleteAsync(id, userId);

            return Ok(APIResponse<string>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .WithResult("Xóa thành công")
                .Build());
        }
    }
}
