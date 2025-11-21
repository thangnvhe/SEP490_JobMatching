using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Net;
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

        public async Task<APIResponse<TemplateCV>> CreateTemplateAsync(CreateTemplateCvRequest request)
        {
            try
            {
                if (request == null)
                    return APIResponse<TemplateCV>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("Request không được để trống")
                        .Build();

                var file = request.File;
                if (file == null || file.Length == 0)
                    return APIResponse<TemplateCV>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("File không hợp lệ hoặc không tồn tại")
                        .Build();

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (extension != ".html" && extension != ".htm")
                    return APIResponse<TemplateCV>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("Chỉ chấp nhận file HTML (.html, .htm)")
                        .Build();

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

                // Handle image upload if provided
                string? imageUrl = null;
                if (request.ImageFile != null && request.ImageFile.Length > 0)
                {
                    var imageExtension = Path.GetExtension(request.ImageFile.FileName).ToLowerInvariant();
                    var allowedImageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    
                    if (allowedImageExtensions.Contains(imageExtension))
                    {
                        // Validate image file size (max 5MB)
                        if (request.ImageFile.Length <= 5 * 1024 * 1024)
                        {
                            var imageFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "template_cv", "images");
                            if (!Directory.Exists(imageFolder))
                                Directory.CreateDirectory(imageFolder);

                            var imageFileName = $"{originalName}_preview_{Guid.NewGuid()}{imageExtension}";
                            var imageFullPath = Path.Combine(imageFolder, imageFileName);

                            using (var imageStream = new FileStream(imageFullPath, FileMode.Create))
                            {
                                await request.ImageFile.CopyToAsync(imageStream);
                            }

                            imageUrl = $"/template_cv/images/{imageFileName}";
                        }
                    }
                }

                // create DB record
                var template = new TemplateCV
                {
                    Name = request.Name,
                    PathUrl = $"/template_cv/{fileName}", // relative url to serve
                    ImageUrl = imageUrl
                };

                await _repository.CreateAsync(template);

                return APIResponse<TemplateCV>.Builder()
                    .WithStatusCode(HttpStatusCode.Created)
                    .WithSuccess(true)
                    .WithResult(template)
                    .Build();
            }
            catch (Exception ex)
            {
                return APIResponse<TemplateCV>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithMessage($"Lỗi khi tạo template CV: {ex.Message}")
                    .Build();
            }
        }
        public async Task<APIResponse<PagedResult<TemplateCV>>> GetAllAsync(int page = 1, int pageSize = 10, string sortBy = "", bool isDescending = false)
        {
            try
            {
                var templates = await _repository.GetAllAsync();
                
                // Apply sorting
                if (!string.IsNullOrEmpty(sortBy))
                {
                    switch (sortBy.ToLower())
                    {
                        case "name":
                            templates = isDescending 
                                ? templates.OrderByDescending(x => x.Name).ToList()
                                : templates.OrderBy(x => x.Name).ToList();
                            break;
                        case "createdat":
                            templates = isDescending 
                                ? templates.OrderByDescending(x => x.Id).ToList()
                                : templates.OrderBy(x => x.Id).ToList();
                            break;
                        default:
                            templates = templates.OrderBy(x => x.Id).ToList();
                            break;
                    }
                }
                else
                {
                    templates = templates.OrderBy(x => x.Id).ToList();
                }

                var totalItems = templates.Count;
                var pagedTemplates = templates
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var pageInfo = new PageInfo(totalItems, page, pageSize, sortBy, isDescending);
                var pagedResult = new PagedResult<TemplateCV>
                {
                    Items = pagedTemplates,
                    pageInfo = pageInfo
                };

                return APIResponse<PagedResult<TemplateCV>>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(pagedResult)
                    .Build();
            }
            catch (Exception ex)
            {
                return APIResponse<PagedResult<TemplateCV>>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithMessage($"Lỗi khi lấy danh sách template CV: {ex.Message}")
                    .Build();
            }
        }

        public async Task<APIResponse<TemplateCV>> GetByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return APIResponse<TemplateCV>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("ID không hợp lệ")
                        .Build();

                var template = await _repository.GetByIdAsync(id);
                if (template == null)
                    return APIResponse<TemplateCV>.Builder()
                        .WithStatusCode(HttpStatusCode.NotFound)
                        .WithSuccess(false)
                        .WithMessage("Không tìm thấy template CV")
                        .Build();

                return APIResponse<TemplateCV>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(template)
                    .Build();
            }
            catch (Exception ex)
            {
                return APIResponse<TemplateCV>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithMessage($"Lỗi khi lấy template CV: {ex.Message}")
                    .Build();
            }
        }

        public async Task<APIResponse<object>> DeleteAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("ID không hợp lệ")
                        .Build();

                var template = await _repository.GetByIdAsync(id);
                if (template == null)
                    return APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.NotFound)
                        .WithSuccess(false)
                        .WithMessage("Không tìm thấy template CV")
                        .Build();

                var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", template.PathUrl.TrimStart('/'));

                if (File.Exists(fullPath))
                    File.Delete(fullPath);

                // Delete image file if exists
                if (!string.IsNullOrEmpty(template.ImageUrl))
                {
                    var imageFullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", template.ImageUrl.TrimStart('/'));
                    if (File.Exists(imageFullPath))
                        File.Delete(imageFullPath);
                }

                await _repository.DeleteAsync(template);

                return APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithMessage("Xóa template CV thành công")
                    .Build();
            }
            catch (Exception ex)
            {
                return APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithMessage($"Lỗi khi xóa template CV: {ex.Message}")
                    .Build();
            }
        }
    }
}
