using JobMatchingSystem.API.DTOs;
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
    public class SavedJobController : ControllerBase
    {
        private readonly ISavedJobService _savedJobService;

        public SavedJobController(ISavedJobService savedJobService)
        {
            _savedJobService = savedJobService;
        }

        // GET api/savedjob
        [HttpGet]
        public async Task<IActionResult> GetByUser()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var result = await _savedJobService.GetSavedJobsByUserIdAsync(userId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        // GET api/savedjob/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var result = await _savedJobService.GetSavedJobByIdAsync(id, userId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Create(int jobId)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _savedJobService.CreateSavedJobAsync(jobId, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Saved job created successfully")
                .Build());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _savedJobService.DeleteSavedJobAsync(id, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Saved job deleted successfully")
                .Build());
        }
    }
}
