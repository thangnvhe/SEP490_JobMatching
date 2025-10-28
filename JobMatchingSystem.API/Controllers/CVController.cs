// File: Controllers/CVController.cs
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Candidate")] // Chỉ ứng viên được upload CV
    public class CVController : ControllerBase
    {
        private readonly IDataCVService _cvService;

        public CVController(IDataCVService cvService)
        {
            _cvService = cvService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCVs()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var cvs = await _cvService.GetActiveCVsByUserIdAsync(userId);

            var response = cvs.Select(c => new CVResponse
            {
                CVId = c.CVId,
                Title = c.Title,
                FileName = c.FileName,
                FileUrl = c.FileUrl,
                IsPrimary = c.IsPrimary ?? false,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).OrderByDescending(c => c.CreatedAt).ToList();

            return Ok(APIResponse<List<CVResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(response)
                .Build());
        }

        [HttpPost]
        public async Task<IActionResult> CreateCV([FromForm] CreateCVRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var fileUrl = await _cvService.CreateCVAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult(fileUrl)
                .Build());
        }

        [HttpPut("delete/{cvId}")]
        public async Task<IActionResult> DeleteCV(int cvId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _cvService.DeleteCVAsync(cvId, userId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(new { CVId = cvId, Message = "CV deleted successfully" })
                .Build());
        }

        [HttpPut("set-primary/{cvId}")]
        public async Task<IActionResult> SetPrimaryCV(int cvId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _cvService.SetPrimaryCVAsync(cvId, userId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(new { CVId = cvId, Message = "CV set as primary successfully" })
                .Build());
        }
    }
}