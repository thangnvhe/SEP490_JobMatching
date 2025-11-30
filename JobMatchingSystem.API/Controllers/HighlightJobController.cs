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
    public class HighlightJobController : ControllerBase
    {
        private readonly IHighlightJobService _highlightJobService;

        public HighlightJobController(IHighlightJobService highlightJobService)
        {
            _highlightJobService = highlightJobService;
        }

        [HttpGet]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> GetMyHighlightJobs()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var highlightJobs = await _highlightJobService.GetHighlightJobsByUserAsync(userId);

            if (highlightJobs == null || !highlightJobs.Any())
                return NotFound(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithResult("No highlight jobs found")
                    .Build());

            return Ok(APIResponse<List<HighlightJob>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(highlightJobs)
                .Build());
        }
    }
}
