using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
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
    public class CVAchievementController : ControllerBase
    {
        private readonly ICVAchievementService _service;

        public CVAchievementController(ICVAchievementService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var achievement = await _service.GetByIdAsync(id);

            return Ok(APIResponse<CVAchievement>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(achievement)
                .Build());
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyAchievements()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var achievements = await _service.GetByCurrentUserAsync(userId);

            return Ok(APIResponse<List<CVAchievement>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(achievements)
                .Build());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CVAchievementRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var achievement = await _service.CreateAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Achievement add successfully")
                .Build());
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CVAchievementRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var achievement = await _service.UpdateAsync(id, request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Achievement update successfully")
                .Build());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _service.DeleteAsync(id, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Achievement deleted successfully")
                .Build());
        }
    }
}
