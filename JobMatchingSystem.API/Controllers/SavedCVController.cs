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
    public class SavedCVController : ControllerBase
    {
        private readonly ISavedCVService _savedCVService;

        public SavedCVController(ISavedCVService savedCVService)
        {
            _savedCVService = savedCVService;
        }

        [HttpGet]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> GetByRecruiter()
        {
            int recruiterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var result = await _savedCVService.GetSavedCVsByRecruiterIdAsync(recruiterId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> GetById(int id)
        {
            int recruiterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var result = await _savedCVService.GetSavedCVByIdAsync(id, recruiterId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        [HttpPost]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> Create(int cvId)
        {
            int recruiterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _savedCVService.CreateSavedCVAsync(cvId, recruiterId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Lưu CV thành công")
                .Build());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> Delete(int id)
        {
            int recruiterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _savedCVService.DeleteSavedCVAsync(id, recruiterId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Xóa CV đã lưu thành công")
                .Build());
        }
    }
}
