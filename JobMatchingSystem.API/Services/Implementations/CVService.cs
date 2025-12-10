using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Extensions;
using JobMatchingSystem.API.Helpers;
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
        private readonly IBlobStorageService _blobStorageService;
        private readonly string _aiServiceUrl;

        public CVService(ICVRepository cvRepository, IWebHostEnvironment env, IBlobStorageService blobStorageService)
        {
            _cvRepository = cvRepository;
            _env = env;
            _httpClient = new HttpClient();
            _blobStorageService = blobStorageService;
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

            // Upload CV file to Azure Blob Storage
            var fileExtension = Path.GetExtension(request.File.FileName);
            var hashedFileName = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(Guid.NewGuid() + request.File.FileName))) + fileExtension;
            var cvFileUrl = await _blobStorageService.UploadFileAsync(request.File, "cvs", hashedFileName);

            // Tạo CVUpload entity
            var cvUpload = new CVUpload
            {
                UserId = userId,
                Name = request.Name,
                IsPrimary = request.IsPrimary ?? false,
                FileName = request.File.FileName,
                FileUrl = cvFileUrl
            };

            await _cvRepository.CreateAsync(cvUpload);
        }

        public async Task<CVUpload> GetCVByIdAsync(int id)
        {
            var cv = await _cvRepository.GetCVByIdWithUserAsync(id);
            if (cv == null)
                throw new AppException(ErrorCode.NotFoundCV());
            
            // Generate secure URL with SAS token for file access
            cv.FileUrl = await _blobStorageService.GetSecureFileUrlAsync(cv.FileUrl) ?? cv.FileUrl;
            
            return cv;
        }

        public async Task<List<CVUpload>> GetCVsByUserIdAsync(int userId)
        {
            var cvs = await _cvRepository.GetCVsByUserIdAsync(userId);
            if (cvs == null || !cvs.Any())
                throw new AppException(ErrorCode.NotFoundCV());
            
            // Generate secure URLs with SAS tokens for all CVs
            foreach (var cv in cvs)
            {
                cv.FileUrl = await _blobStorageService.GetSecureFileUrlAsync(cv.FileUrl) ?? cv.FileUrl;
            }
            
            return cvs;
        }

        public async Task<List<CVDetailResponse>> GetAllCVsAsync()
        {
            var cvs = await _cvRepository.GetAllCVsWithUsersAsync();
            var result = new List<CVDetailResponse>();
            
            foreach (var cv in cvs)
            {
                // Generate secure URL with SAS token for file access
                var secureUrl = await _blobStorageService.GetSecureFileUrlAsync(cv.FileUrl) ?? cv.FileUrl;
                
                result.Add(new CVDetailResponse
                {
                    Id = cv.Id,
                    Name = cv.Name,
                    IsPrimary = cv.IsPrimary,
                    FileName = cv.FileName,
                    FileUrl = secureUrl,
                    User = new UserInfoResponse
                    {
                        Id = cv.User.Id,
                        FullName = cv.User.FullName ?? "",
                        Email = cv.User.Email ?? "",
                        PhoneNumber = cv.User.PhoneNumber ?? ""
                    }
                });
            }
            
            return result;
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

            // Xóa file từ Azure Blob Storage
            if (!string.IsNullOrEmpty(cv.FileUrl))
            {
                await _blobStorageService.DeleteFileAsync(cv.FileUrl);
            }
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
                    throw new AppException(ErrorCode.InvalidFile("Chỉ PDF, DOCX, và DOC được phép"));

                if (file.Length > 10 * 1024 * 1024) // 10MB limit
                    throw new AppException(ErrorCode.InvalidFile("Kích thước file phải nhỏ hơn 10MB"));

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
                        Reason = "Phản hồi không hợp lệ từ dịch vụ AI",
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
                        Reason = $"Xác thực AI thất bại: {errorContent}",
                        FileInfo = new CVFileInfo
                        {
                            FileName = file.FileName,
                            FileSizeMB = file.Length / (1024.0 * 1024.0),
                            Error = "Lỗi dịch vụ AI"
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
                    Reason = $"Dịch vụ AI không khả dụng: {ex.Message}",
                    FileInfo = new CVFileInfo
                    {
                        FileName = file.FileName,
                        FileSizeMB = file.Length / (1024.0 * 1024.0),
                        Error = "Kết nối dịch vụ thất bại"
                    }
                };
            }
            catch (TaskCanceledException ex)
            {
                return new CVValidationResponse
                {
                    IsCV = false,
                    Confidence = 0.0,
                    Reason = "Hết thời gian chờ dịch vụ AI",
                    FileInfo = new CVFileInfo
                    {
                        FileName = file.FileName,
                        FileSizeMB = file.Length / (1024.0 * 1024.0),
                        Error = "Hết thời gian chờ yêu cầu"
                    }
                };
            }
            catch (Exception ex)
            {
                return new CVValidationResponse
                {
                    IsCV = false,
                    Confidence = 0.0,
                    Reason = $"Lỗi xác thực: {ex.Message}",
                    FileInfo = new CVFileInfo
                    {
                        FileName = file.FileName,
                        FileSizeMB = file.Length / (1024.0 * 1024.0),
                        Error = "Xử lý thất bại"
                    }
                };
            }
        }

        /// <summary>
        /// Clean up all CV files for a user (useful when deleting user account)
        /// </summary>
        /// <param name="userId">User ID to clean up CVs for</param>
        /// <returns></returns>
        public async Task CleanupUserCVsAsync(int userId)
        {
            try
            {
                var userCVs = await _cvRepository.GetCVsByUserIdAsync(userId);
                foreach (var cv in userCVs)
                {
                    // Delete from Azure Blob Storage
                    if (!string.IsNullOrEmpty(cv.FileUrl))
                    {
                        await _blobStorageService.DeleteFileAsync(cv.FileUrl);
                    }
                    
                    // Delete from database
                    await _cvRepository.DeleteAsync(cv.Id);
                }
            }
            catch (Exception)
            {
                // Log error but don't throw - file cleanup shouldn't break the main flow
                // You might want to add proper logging here
            }
        }

        // Dispose HttpClient when service is disposed
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}
