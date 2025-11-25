using JobMatchingSystem.API.DTOs;
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
    public class JobQuotaController : ControllerBase
    {
        private readonly IJobQuotaService _jobQuotaService;

        public JobQuotaController(IJobQuotaService jobQuotaService)
        {
            _jobQuotaService = jobQuotaService;
        }

        [HttpGet("me")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> Get()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var result = await _jobQuotaService.GetByUserIdAsync(userId);

            return Ok(APIResponse<JobQuotaResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }
    }
}
