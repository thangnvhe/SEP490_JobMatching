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
    public class CVController : ControllerBase
    {
        private readonly ICVService _cvService;

        public CVController(ICVService cvService)
        {
            _cvService = cvService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadCV([FromForm] UploadCVRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _cvService.UploadCVAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("CV uploaded successfully")
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCVById(int id)
        {
            var cv = await _cvService.GetCVByIdAsync(id);

            return Ok(APIResponse<CVUpload>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(cv)
                .Build());
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCVsByUserId(int userId)
        {
            var cvs = await _cvService.GetCVsByUserIdAsync(userId);

            return Ok(APIResponse<List<CVUpload>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(cvs)
                .Build());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCV(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _cvService.DeleteCVAsync(id, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("CV deleted successfully")
                .Build());
        }
    }
}
