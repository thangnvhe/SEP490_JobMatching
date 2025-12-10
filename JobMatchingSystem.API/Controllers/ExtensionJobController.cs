using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Models;
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
    public class ExtensionJobController : ControllerBase
    {
        private readonly IExtensionJobService _extensionJobService;

        public ExtensionJobController(IExtensionJobService extensionJobService)
        {
            _extensionJobService = extensionJobService;
        }

        [HttpGet]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> GetMyExtensionJobs()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var extensionJobs = await _extensionJobService.GetExtensionJobsByUserAsync(userId);

            if (extensionJobs == null || !extensionJobs.Any())
                return NotFound(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithResult("Không tìm thấy tiện ích mở rộng nào")
                    .Build());

            return Ok(APIResponse<List<ExtensionJob>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(extensionJobs)
                .Build());
        }
    }
}
