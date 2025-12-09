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
    public class CandidateTaxonomyController : ControllerBase
    {
        private readonly ICandidateTaxonomyService _service;

        public CandidateTaxonomyController(ICandidateTaxonomyService service)
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
            int userId = GetCurrentUserId();

            var result = await _service.GetByIdAsync(id, userId);

            return Ok(APIResponse<CandidateTaxonomyResponse>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .WithResult(result)
                .Build());
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMine()
        {
            int userId = GetCurrentUserId();

            var result = await _service.GetByCandidateIdAsync(userId);

            return Ok(APIResponse<List<CandidateTaxonomyResponse>>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .WithResult(result)
                .Build());
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Create([FromBody] CreateCandidateTaxonomyRequest request)
        {
            int userId = GetCurrentUserId();

            await _service.CreateAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.Created)
                .WithResult("Create successfully")
                .Build());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCandidateTaxonomyRequest request)
        {
            int userId = GetCurrentUserId();

            await _service.UpdateAsync(id, request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .WithResult("Updated successfully")
                .Build());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = GetCurrentUserId();

            await _service.DeleteAsync(id, userId);

            return Ok(APIResponse<string>.Builder()
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .WithResult("Deleted successfully")
                .Build());
        }
    }
}
