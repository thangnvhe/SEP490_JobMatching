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
        [Authorize]
        [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit for PDF/DOCX files
        [ProducesResponseType(typeof(APIResponse<string>), 201)]
        [ProducesResponseType(typeof(APIResponse<string>), 400)]
        public async Task<IActionResult> UploadCV([FromForm] UploadCVRequest request)
        {
            try
            {
                // Validate CV file before upload
                var validationError = ValidateCVFile(request.File);
                if (!string.IsNullOrEmpty(validationError))
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithResult(validationError)
                        .Build());
                }

                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                await _cvService.UploadCVAsync(request, userId);

                return Ok(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.Created)
                    .WithSuccess(true)
                    .WithResult("Upload CV thành công")
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithResult($"Upload thất bại: {ex.Message}")
                    .Build());
            }
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

        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllCVs()
        {
            try
            {
                var cvs = await _cvService.GetAllCVsAsync();

                return Ok(APIResponse<List<CVDetailResponse>>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(cvs)
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithResult($"Lỗi server khi lấy danh sách CV: {ex.Message}")
                    .Build());
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyCVs()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(APIResponse<string>.Builder()
                        .WithStatusCode(HttpStatusCode.Unauthorized)
                        .WithSuccess(false)
                        .WithResult("Không tìm thấy thông tin người dùng trong token")
                        .Build());
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithResult("User ID không hợp lệ")
                        .Build());
                }

                var cvs = await _cvService.GetCVsByUserIdAsync(userId);

                return Ok(APIResponse<List<CVUpload>>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(cvs)
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithResult($"Lỗi server khi lấy danh sách CV: {ex.Message}")
                    .Build());
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCV(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _cvService.DeleteCVAsync(id, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Xóa CV thành công")
                .Build());
        }

        [HttpPut("{id}/set-primary")]
        [Authorize]
        public async Task<IActionResult> SetPrimaryCV(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _cvService.SetPrimaryCVAsync(id, userId);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Đặt CV làm chính thành công")
                .Build());
        }

        /// <summary>
        /// Validate if uploaded file is a valid CV using AI
        /// </summary>
        /// <param name="file">PDF, DOCX, or Image file to validate</param>
        /// <returns>CV validation result with confidence score</returns>
        [HttpPost("validate")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit for multiple file types
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
                        .WithResult("File là bắt buộc")
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
                    .WithResult($"Validation thất bại: {ex.Message}")
                    .Build());
            }
        }

        /// <summary>
        /// Validate CV file type and size
        /// </summary>
        /// <param name="file">File to validate</param>
        /// <returns>Error message if invalid, null if valid</returns>
        private static string? ValidateCVFile(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return "File CV là bắt buộc";

            // Check file size (10MB limit)
            const long maxSize = 10 * 1024 * 1024; // 10MB
            if (file.Length > maxSize)
                return "Kích thước file phải nhỏ hơn 10MB";

            // Check file type
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var fileExtension = Path.GetExtension(file.FileName)?.ToLower();
            
            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                return $"Loại file không hợp lệ. Các loại được phép: {string.Join(", ", allowedExtensions)}";

            return null; // Valid file
        }
    }
}
