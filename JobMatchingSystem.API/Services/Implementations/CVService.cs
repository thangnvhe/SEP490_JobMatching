using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVService : ICVService, IDisposable
    {
        private readonly ICVRepository _cvRepository;
        private readonly IWebHostEnvironment _env;
        private readonly HttpClient _httpClient;
        private readonly string _aiServiceUrl;

        public CVService(ICVRepository cvRepository, IWebHostEnvironment env)
        {
            _cvRepository = cvRepository;
            _env = env;
            _httpClient = new HttpClient();
            _aiServiceUrl = "http://localhost:8000"; // AI Service URL
        }

        public async Task UploadCVAsync(UploadCVRequest request, int userId)
        {
            // Validate CV using AI service first (optional)
            try
            {
                var validationResult = await ValidateCVAsync(request.File);
                // You can add logic here to check if CV is valid before uploading
                // For now, we'll continue with upload regardless of validation result
            }
            catch (Exception ex)
            {
                // Log the validation error but continue with upload
                Console.WriteLine($"CV validation warning: {ex.Message}");
            }

            // Lấy danh sách CV cũ của user
            var existingCVs = await _cvRepository.GetCVsByUserIdAsync(userId);

            if (request.File == null)
                throw new AppException(ErrorCode.InvalidFile());

            // Nếu chọn isPrimary = true thì set tất cả cv khác = false
            if (request.IsPrimary == true)
            {
                foreach (var cv in existingCVs)
                {
                    cv.IsPrimary = false;
                    await _cvRepository.UpdateAsync(cv);
                }
            }

            // Lưu file vào wwwroot/cv với tên mã hóa
            var cvFolder = Path.Combine(_env.WebRootPath, "cv");
            if (!Directory.Exists(cvFolder))
                Directory.CreateDirectory(cvFolder);

            var fileExtension = Path.GetExtension(request.File.FileName);
            var hashedFileName = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(Guid.NewGuid() + request.File.FileName))) + fileExtension;
            var filePath = Path.Combine(cvFolder, hashedFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            // Tạo CVUpload entity
            var cvUpload = new CVUpload
            {
                UserId = userId,
                Name = request.Name,
                IsPrimary = request.IsPrimary ?? false,
                FileName = request.File.FileName,
                FileUrl = $"cv/{hashedFileName}"
            };

            await _cvRepository.CreateAsync(cvUpload);
        }

        public async Task<CVUpload> GetCVByIdAsync(int id)
        {
            var cv = await _cvRepository.GetByIdAsync(id);
            if (cv == null)
                throw new AppException(ErrorCode.NotFoundCV());
            return cv;
        }

        public async Task<List<CVUpload>> GetCVsByUserIdAsync(int userId)
        {
            var cvs = await _cvRepository.GetCVsByUserIdAsync(userId);
            if (cvs == null || !cvs.Any())
                throw new AppException(ErrorCode.NotFoundCV());
            return cvs;
        }

        public async Task DeleteCVAsync(int cvId, int userId)
        {
            var cv = await _cvRepository.GetByIdAsync(cvId);
            if (cv == null || cv.UserId != userId)
                throw new AppException(ErrorCode.CantDelete());

            // Nếu CV bị xóa là Primary → tìm CV khác
            if (cv.IsPrimary == true)
            {
                var otherCVs = await _cvRepository.GetCVsByUserIdAsync(userId);
                var remainingCVs = otherCVs.Where(c => c.Id != cvId).ToList();

                // Nếu còn CV khác → chọn CV có Id lớn nhất (tức là mới nhất)
                if (remainingCVs.Any())
                {
                    var newestCV = remainingCVs.OrderByDescending(c => c.Id).First();
                    newestCV.IsPrimary = true;
                    await _cvRepository.UpdateAsync(newestCV);
                }
            }

            await _cvRepository.DeleteAsync(cvId);

            // Xóa file vật lý
            var filePath = Path.Combine(_env.WebRootPath, cv.FileUrl);
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
        }

        public async Task SetPrimaryCVAsync(int cvId, int userId)
        {
            var cv = await _cvRepository.GetByIdAsync(cvId);
            if (cv == null || cv.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCV());

            // Set tất cả CV khác của user thành không phải primary
            var userCVs = await _cvRepository.GetCVsByUserIdAsync(userId);
            foreach (var userCV in userCVs)
            {
                userCV.IsPrimary = false;
                await _cvRepository.UpdateAsync(userCV);
            }

            // Set CV được chọn thành primary
            cv.IsPrimary = true;
            await _cvRepository.UpdateAsync(cv);
        }

        public async Task<CVValidationResponse> ValidateCVAsync(IFormFile file)
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                    throw new AppException(ErrorCode.InvalidFile());

                var fileName = file.FileName.ToLower();
                var allowedExtensions = new[] { ".pdf", ".docx", ".doc" };
                if (!allowedExtensions.Any(ext => fileName.EndsWith(ext)))
                    throw new AppException(ErrorCode.InvalidFile("Only PDF, DOCX, and DOC files are allowed"));

                if (file.Length > 10 * 1024 * 1024) // 10MB limit
                    throw new AppException(ErrorCode.InvalidFile("File size must be less than 10MB"));

                // Prepare request to AI service
                using var form = new MultipartFormDataContent();
                using var stream = file.OpenReadStream();
                using var content = new StreamContent(stream);
                
                // Set appropriate Content-Type based on file extension
                var contentType = fileName.EndsWith(".pdf") ? "application/pdf" :
                                fileName.EndsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
                                fileName.EndsWith(".doc") ? "application/msword" :
                                "application/octet-stream";
                
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
                form.Add(content, "file", file.FileName);

                // Call AI service
                var response = await _httpClient.PostAsync($"{_aiServiceUrl}/validate_cv", form);
                
                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var validationResult = JsonSerializer.Deserialize<CVValidationResponse>(jsonResponse, options);
                    return validationResult ?? new CVValidationResponse
                    {
                        IsCV = false,
                        Confidence = 0.0,
                        Reason = "Invalid response from AI service",
                        FileInfo = null
                    };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return new CVValidationResponse
                    {
                        IsCV = false,
                        Confidence = 0.0,
                        Reason = $"AI validation failed: {errorContent}",
                        FileInfo = new CVFileInfo
                        {
                            FileName = file.FileName,
                            FileSizeMB = file.Length / (1024.0 * 1024.0),
                            Error = "AI service error"
                        }
                    };
                }
            }
            catch (HttpRequestException ex)
            {
                return new CVValidationResponse
                {
                    IsCV = false,
                    Confidence = 0.0,
                    Reason = $"AI service unavailable: {ex.Message}",
                    FileInfo = new CVFileInfo
                    {
                        FileName = file.FileName,
                        FileSizeMB = file.Length / (1024.0 * 1024.0),
                        Error = "Service connection failed"
                    }
                };
            }
            catch (TaskCanceledException ex)
            {
                return new CVValidationResponse
                {
                    IsCV = false,
                    Confidence = 0.0,
                    Reason = "AI service timeout",
                    FileInfo = new CVFileInfo
                    {
                        FileName = file.FileName,
                        FileSizeMB = file.Length / (1024.0 * 1024.0),
                        Error = "Request timeout"
                    }
                };
            }
            catch (Exception ex)
            {
                return new CVValidationResponse
                {
                    IsCV = false,
                    Confidence = 0.0,
                    Reason = $"Validation error: {ex.Message}",
                    FileInfo = new CVFileInfo
                    {
                        FileName = file.FileName,
                        FileSizeMB = file.Length / (1024.0 * 1024.0),
                        Error = "Processing failed"
                    }
                };
            }
        }

        // Dispose HttpClient when service is disposed
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}
