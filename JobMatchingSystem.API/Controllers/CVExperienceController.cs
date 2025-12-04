using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CVExperienceController : ControllerBase
    {
        private readonly ICVExperienceService _service;

        public CVExperienceController(ICVExperienceService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var experience = await _service.GetByIdAsync(id);
            return Ok(APIResponse<CVExperience>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(experience)
                .Build());
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyExperiences()
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var experiences = await _service.GetByCurrentUserAsync(userId);
                return Ok(APIResponse<List<CVExperienceDto>>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(experiences ?? new List<CVExperienceDto>())
                    .Build());
            }
            catch (Exception)
            {
                return Ok(APIResponse<List<CVExperienceDto>>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(new List<CVExperienceDto>())
                    .Build());
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CVExperienceRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _service.CreateAsync(request, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Experience added successfully")
                .Build());
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CVExperienceRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _service.UpdateAsync(id, request, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Experience updated successfully")
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
                .WithResult("Experience deleted successfully")
                .Build());
        }
    }
}
