using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
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
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB limit
        [ProducesResponseType(typeof(APIResponse<string>), 201)]
        [ProducesResponseType(typeof(APIResponse<string>), 400)]
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

        [HttpPut("{id}/set-primary")]
        public async Task<IActionResult> SetPrimaryCV(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _cvService.SetPrimaryCVAsync(id, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("CV set as primary successfully")
                .Build());
        }

        /// <summary>
        /// Validate if uploaded file is a valid CV using AI
        /// </summary>
        /// <param name="file">PDF file to validate</param>
        /// <returns>CV validation result with confidence score</returns>
        [HttpPost("validate")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB limit
        [ProducesResponseType(typeof(APIResponse<CVValidationResponse>), 200)]
        [ProducesResponseType(typeof(APIResponse<string>), 400)]
        [ProducesResponseType(typeof(APIResponse<string>), 500)]
        public async Task<ActionResult<APIResponse<CVValidationResponse>>> ValidateCV(IFormFile file)
        {
            try
            {
                if (file == null)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithResult("File is required")
                        .Build());
                }

                var result = await _cvService.ValidateCVAsync(file);
                return Ok(APIResponse<CVValidationResponse>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(result)
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithResult($"Validation failed: {ex.Message}")
                    .Build());
            }
        }
    }
}
