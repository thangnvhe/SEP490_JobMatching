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

        public TemplateCVService(ITemplateCVRepository templateCVRepository, ApplicationDbContext context)
        {
            _templateCVRepository = templateCVRepository;
            _context = context;
        }

        public async Task CreateTemplateCVAsync(CreateTemplateCVRequest request)
        {
            var templateCV = new TemplateCV
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive,
                PathUrl = request.PathUrl,
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

        public async Task UpdateTemplateCVAsync(int id, UpdateTemplateCVRequest request)
        {
            var template = await _templateCVRepository.GetByIdAsync(id);
            if (template == null)
                throw new AppException(ErrorCode.NotFoundTemplateCV());

            template.Name = request.Name;
            template.Description = request.Description;
            template.IsActive = request.IsActive;
            template.PathUrl = request.PathUrl;
            template.UpdatedAt = DateTime.Now;

            await _templateCVRepository.UpdateAsync(template);
        }
    }
}