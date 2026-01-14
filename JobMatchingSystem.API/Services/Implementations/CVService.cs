using HandlebarsDotNet;
using JobMatchingSystem.API.Data;
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
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVService : ICVService, IDisposable
    {
        private readonly ICVRepository _cvRepository;
        private readonly IWebHostEnvironment _env;
        private readonly IBlobStorageService _blobStorageService;
        private readonly ApplicationDbContext _context;

        public CVService(ICVRepository cvRepository, IWebHostEnvironment env, IBlobStorageService blobStorageService, IConfiguration configuration, ApplicationDbContext context)
        {
            _cvRepository = cvRepository;
            _env = env;
            _blobStorageService = blobStorageService;
            _context = context;
        }

        public async Task UploadCVAsync(UploadCVRequest request, int userId)
        {
            // Lấy danh sách CV cũ của user
            var existingCVs = await _cvRepository.GetCVsByUserIdAsync(userId);

            var maxCvCount = await _context.SystemConfigs
               .Where(x => x.Type == "upload_cv" && x.Name == "UploadCVCount")
               .Select(x => int.Parse(x.Value))
               .FirstAsync();

            if (existingCVs.Count >= maxCvCount)
                throw new AppException(ErrorCode.CvUploadLimitExceeded());

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
                return cvs;
                            
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

        public void Dispose()
        {
            // No longer need to dispose HttpClient since it's removed
        }
    }
}
