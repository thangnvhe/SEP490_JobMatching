// File: Services/Implementations/DataCVService.cs
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class DataCVService : IDataCVService
    {
        private readonly IDataCVRepository _cvRepository;
        private readonly IWebHostEnvironment _env;
        private readonly string _cvFolder = "CVs";

        public DataCVService(IDataCVRepository cvRepository, IWebHostEnvironment env)
        {
            _cvRepository = cvRepository;
            _env = env;
        }

        public async Task<List<DataCV>> GetActiveCVsByUserIdAsync(int userId)
        {
            return await _cvRepository.GetActiveCVsByUserIdAsync(userId);
        }

        public async Task<string> CreateCVAsync(CreateCVRequest request, int userId)
        {
            // Validate file
            if (request.File == null || request.File.Length == 0)
                throw new AppException(ErrorCode.InvalidFile());

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".html" };
            var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                throw new AppException(ErrorCode.InvalidFile());

            if (request.File.Length > 10 * 1024 * 1024) // 10MB
                throw new AppException(ErrorCode.InvalidFile());

            // Tạo thư mục nếu chưa có
            var cvPath = Path.Combine(_env.WebRootPath, _cvFolder);
            Directory.CreateDirectory(cvPath);

            // Tạo tên file duy nhất
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.File.FileName)}";
            var filePath = Path.Combine(cvPath, fileName);

            // Lưu file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            // Tạo CV entity
            var newCV = new DataCV
            {
                UserId = userId,
                Title = request.Title,
                FileName = request.File.FileName,
                FileUrl = $"/{_cvFolder}/{fileName}",
                IsPrimary = true,
                IsActive = true,
                CreatedAt = DateTime.Now,
            };

            // Tắt IsPrimary của các CV khác
            var existingCVs = await _cvRepository.GetActiveCVsByUserIdAsync(userId);
            foreach (var cv in existingCVs)
            {
                cv.IsPrimary = false;
                cv.UpdatedAt = DateTime.Now;
                await _cvRepository.UpdateAsync(cv);
            }

            await _cvRepository.AddAsync(newCV);
            await _cvRepository.SaveChangesAsync();

            return newCV.FileUrl;
        }

        public async Task DeleteCVAsync(int cvId, int userId)
        {
            var cv = await _cvRepository.GetByIdAsync(cvId, userId);
            if (cv == null || !cv.IsActive)
                throw new AppException(ErrorCode.NotFoundCV());

            cv.IsActive = false;
            cv.DeletedAt = DateTime.Now;
            cv.UpdatedAt = DateTime.Now;

            bool needNewPrimary = cv.IsPrimary == true;

            await _cvRepository.UpdateAsync(cv);
            await _cvRepository.SaveChangesAsync();

            // Nếu xóa CV chính → chọn CV mới nhất còn active làm primary
            if (needNewPrimary)
            {
                var remainingCVs = await _cvRepository.GetActiveCVsByUserIdAsync(userId);
                var newPrimary = remainingCVs.FirstOrDefault();
                if (newPrimary != null)
                {
                    newPrimary.IsPrimary = true;
                    newPrimary.UpdatedAt = DateTime.Now;
                    await _cvRepository.UpdateAsync(newPrimary);
                    await _cvRepository.SaveChangesAsync();
                }
            }
        }

        public async Task SetPrimaryCVAsync(int cvId, int userId)
        {
            var targetCV = await _cvRepository.GetByIdAsync(cvId, userId);
            if (targetCV == null || !targetCV.IsActive)
                throw new AppException(ErrorCode.NotFoundCV());

            if (targetCV.IsPrimary == true)
                return; // Đã là primary → không làm gì

            // Lấy tất cả CV active của user
            var activeCVs = await _cvRepository.GetActiveCVsByUserIdAsync(userId);

            // Tắt IsPrimary của tất cả CV khác
            foreach (var cv in activeCVs.Where(c => c.CVId != cvId))
            {
                cv.IsPrimary = false;
                cv.UpdatedAt = DateTime.Now;
                await _cvRepository.UpdateAsync(cv);
            }

            // Bật IsPrimary cho CV được chọn
            targetCV.IsPrimary = true;
            targetCV.UpdatedAt = DateTime.Now;
            await _cvRepository.UpdateAsync(targetCV);

            await _cvRepository.SaveChangesAsync();
        }
    }
}