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
    public class CVEducationController : ControllerBase
    {
        private readonly ICVEducationService _service;

        public CVEducationController(ICVEducationService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var education = await _service.GetByIdAsync(id);
            return Ok(APIResponse<CVEducation>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(education)
                .Build());
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyEducations()
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var educations = await _service.GetByCurrentUserAsync(userId);
                return Ok(APIResponse<List<CVEducationDto>>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(educations ?? new List<CVEducationDto>())
                    .Build());
            }
            catch (Exception)
            {
                return Ok(APIResponse<List<CVEducationDto>>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(new List<CVEducationDto>())
                    .Build());
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CVEducationRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _service.CreateAsync(request, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Thêm trình độ học vấn thành công")
                .Build());
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CVEducationRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _service.UpdateAsync(id, request, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Cập nhật trình độ học vấn thành công")
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
                .WithResult("Xóa trình độ học vấn thành công")
                .Build());
        }
    }
}
