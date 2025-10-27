using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class TemplateCVService : ITemplateCVService
    {
        private readonly ITemplateCVRepository _templateCVRepository;
        private readonly ApplicationDbContext _context;
        private readonly string _uploadPath;

        public TemplateCVService(ITemplateCVRepository templateCVRepository, ApplicationDbContext context, IWebHostEnvironment env)
        {
            _templateCVRepository = templateCVRepository;
            _context = context;
            _uploadPath = Path.Combine(env.WebRootPath, "TemplateCV");
            // Tạo thư mục TemplateCV nếu chưa tồn tại
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task CreateTemplateCVAsync(CreateTemplateCVRequest request, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new AppException(ErrorCode.InvalidFile());

            // Tạo tên file duy nhất để tránh xung đột
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(_uploadPath, fileName);
            var relativePath = $"/TemplateCV/{fileName}";

            // Lưu file vào wwwroot/TemplateCV
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var templateCV = new TemplateCV
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive,
                PathUrl = relativePath,
                CreatedAt = DateTime.Now
            };

            await _templateCVRepository.AddAsync(templateCV);
        }

        public async Task<List<TemplateCVResponse>> GetAllTemplateCVsAsync()
        {
            var templates = await _templateCVRepository.GetAllAsync();
            return templates.Select(t => new TemplateCVResponse
            {
                TemplateId = t.TemplateId,
                Name = t.Name,
                Description = t.Description,
                IsActive = t.IsActive ?? false,
                PathUrl = t.PathUrl,
                CreatedAt = t.CreatedAt ?? DateTime.Now,
                UpdatedAt = t.UpdatedAt
            }).ToList();
        }

        public async Task<TemplateCVResponse?> GetTemplateCVByIdAsync(int id)
        {
            var template = await _templateCVRepository.GetByIdAsync(id);
            if (template == null)
                throw new AppException(ErrorCode.NotFoundTemplateCV());

            return new TemplateCVResponse
            {
                TemplateId = template.TemplateId,
                Name = template.Name,
                Description = template.Description,
                IsActive = template.IsActive ?? false,
                PathUrl = template.PathUrl,
                CreatedAt = template.CreatedAt ?? DateTime.Now,
                UpdatedAt = template.UpdatedAt
            };
        }

        public async Task UpdateTemplateCVAsync(int id, UpdateTemplateCVRequest request, IFormFile? file)
        {
            var template = await _templateCVRepository.GetByIdAsync(id);
            if (template == null)
                throw new AppException(ErrorCode.NotFoundTemplateCV());

            // Cập nhật thông tin cơ bản
            template.Name = request.Name;
            template.Description = request.Description;
            template.IsActive = request.IsActive;
            template.UpdatedAt = DateTime.Now;

            // Nếu có file mới, xóa file cũ và lưu file mới
            if (file != null && file.Length > 0)
            {
                // Xóa file cũ nếu tồn tại
                if (!string.IsNullOrEmpty(template.PathUrl))
                {
                    var oldFilePath = Path.Combine(_uploadPath, Path.GetFileName(template.PathUrl));
                    if (File.Exists(oldFilePath))
                    {
                        File.Delete(oldFilePath);
                    }
                }

                // Lưu file mới
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(_uploadPath, fileName);
                var relativePath = $"/TemplateCV/{fileName}";

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                template.PathUrl = relativePath;
            }

            await _templateCVRepository.UpdateAsync(template);
        }
    }
}