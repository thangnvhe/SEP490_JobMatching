using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class TemplateCvService : ITemplateCvService
    {
        private readonly ITemplateCvRepository _repository;
        private readonly IWebHostEnvironment _env;

        public TemplateCvService(ITemplateCvRepository repository, IWebHostEnvironment env)
        {
            _repository = repository;
            _env = env;
        }

        public async Task CreateTemplateAsync(CreateTemplateCvRequest request)
        {
            if (request == null)
                throw new AppException(ErrorCode.InvalidFile());

            var file = request.File;
            if (file == null || file.Length == 0)
                throw new AppException(ErrorCode.InvalidFile());

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != ".html" && extension != ".htm")
                throw new AppException(ErrorCode.InvalidFile());

            // ensure folder exists
            var folder = Path.Combine(_env.WebRootPath ?? "wwwroot", "template_cv");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            // create unique filename
            var originalName = Path.GetFileNameWithoutExtension(file.FileName)
                          .Replace(" ", "_")
                          .Replace(".", "_");

            var fileName = $"{originalName}_{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(folder, fileName);

            // save file
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // create DB record
            var template = new TemplateCV
            {
                Name = request.Name,
                PathUrl = $"/template_cv/{fileName}" // relative url to serve
            };

            await _repository.CreateAsync(template);
        }
        public async Task<List<TemplateCV>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<TemplateCV> GetByIdAsync(int id)
        {
            var template = await _repository.GetByIdAsync(id);
            if (template == null)
                throw new AppException(ErrorCode.NotFoundTemplateCV());

            return template;
        }

        public async Task DeleteAsync(int id)
        {
            var template = await _repository.GetByIdAsync(id);
            if (template == null)
                throw new AppException(ErrorCode.NotFoundTemplateCV());

            var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", template.PathUrl.TrimStart('/'));

            if (File.Exists(fullPath))
                File.Delete(fullPath);

            await _repository.DeleteAsync(template);
        }
    }
}
