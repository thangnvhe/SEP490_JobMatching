using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVService : ICVService
    {
        private readonly ICVRepository _cvRepository;
        private readonly IWebHostEnvironment _env;

        public CVService(ICVRepository cvRepository, IWebHostEnvironment env)
        {
            _cvRepository = cvRepository;
            _env = env;
        }

        public async Task UploadCVAsync(UploadCVRequest request, int userId)
        {
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
    }
}
