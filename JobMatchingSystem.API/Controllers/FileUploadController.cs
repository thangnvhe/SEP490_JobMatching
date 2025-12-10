using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileUploadController : ControllerBase
    {
        private readonly IBlobStorageService _blobStorageService;

        public FileUploadController(IBlobStorageService blobStorageService)
        {
            _blobStorageService = blobStorageService;
        }

        [HttpPost("upload/{folder}")]
        public async Task<IActionResult> UploadFile(IFormFile file, string folder)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Không có tệp được cung cấp")
                        .WithSuccess(false)
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .Build());
                }

                // Validate file size (e.g., 10MB limit)
                const long maxSize = 10 * 1024 * 1024; // 10MB
                if (file.Length > maxSize)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Kích thước tệp vượt quá giới hạn 10MB")
                        .WithSuccess(false)
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .Build());
                }

                // Validate file types based on folder
                var allowedExtensions = GetAllowedExtensions(folder);
                if (allowedExtensions.Length == 0)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult($"Thư mục không hợp lệ. Các thư mục được phép: avartars, company-logos, cvs, licenses")
                        .WithSuccess(false)
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .Build());
                }
                
                var fileExtension = Path.GetExtension(file.FileName)?.ToLower();
                if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult($"Loại tệp không hợp lệ. Các loại được phép cho {folder}: {string.Join(", ", allowedExtensions)}")
                        .WithSuccess(false)
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .Build());
                }

                var fileUrl = await _blobStorageService.UploadFileAsync(file, folder);

                return Ok(APIResponse<object>.Builder()
                    .WithResult(new { FileUrl = fileUrl, FileName = file.FileName })
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
            }
            catch (ArgumentException ex)
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult(ex.Message)
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithResult("Lỗi máy chủ nội bộ trong quá trình tải tệp lên")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .Build());
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteFile([FromQuery] string fileUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(fileUrl))
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("URL tệp là bắt buộc")
                        .WithSuccess(false)
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .Build());
                }

                var success = await _blobStorageService.DeleteFileAsync(fileUrl);

                return Ok(APIResponse<object>.Builder()
                    .WithResult(new { Deleted = success })
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithResult("Lỗi máy chủ nội bộ trong quá trình xóa tệp")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .Build());
            }
        }

        [HttpGet("url-with-sas")]
        public async Task<IActionResult> GetFileUrlWithSas([FromQuery] string folder, [FromQuery] string fileName, [FromQuery] int expiryHours = 24)
        {
            try
            {
                var urlWithSas = await _blobStorageService.GetFileUrlWithSasTokenAsync(folder, fileName, expiryHours);

                return Ok(APIResponse<object>.Builder()
                    .WithResult(new { FileUrl = urlWithSas })
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
            }
            catch (ArgumentException ex)
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult(ex.Message)
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .Build());
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithResult(ex.Message)
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithResult("Lỗi máy chủ nội bộ")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .Build());
            }
        }

        private static string[] GetAllowedExtensions(string folder)
        {
            return folder.ToLower() switch
            {
                "avartars" => new[] { ".jpg", ".jpeg", ".png", ".gif" },
                "company-logos" => new[] { ".jpg", ".jpeg", ".png", ".gif", ".svg" },
                "cvs" => new[] { ".pdf", ".doc", ".docx" },
                "licenses" => new[] { ".pdf", ".jpg", ".jpeg", ".png" },
                "template-cvs" => new[] { ".html", ".htm" },
                "template-cv-images" => new[] { ".jpg", ".jpeg", ".png", ".gif" },
                _ => new string[] { }
            };
        }
    }
}