using System;
using System.IO;
using System.Linq;
using JobMatchingSystem.Application.DTOs;
using JobMatchingSystem.Infrastructure.IServices;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.Infrastructure.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _env;

        public ImageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<ResponseModel> SaveImageAsync(IFormFile image, string path, string? defaultName = null)
        {
            try
            {
                if (image == null || image.Length == 0)
                    return new ResponseModel { Success = false, Message = "No image was uploaded" };

                // Max allowed size = 5MB
                const long maxBytes = 5 * 1024 * 1024;
                if (image.Length > maxBytes)
                    return new ResponseModel { Success = false, Message = "Image size must be less than 5 MB" };

                string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extensionFile = Path.GetExtension(image.FileName);
                if (string.IsNullOrEmpty(extensionFile))
                    return new ResponseModel { Success = false, Message = "File has no extension" };
                extensionFile = extensionFile.ToLower();

                if (!allowedExtensions.Contains(extensionFile))
                    return new ResponseModel { Success = false, Message = "Invalid image format" };

                string fileName = !string.IsNullOrEmpty(defaultName)
                    ? defaultName + extensionFile
                    : Guid.NewGuid().ToString() + extensionFile;

                string pathImage = Path.Combine(_env.WebRootPath, path);
                if (!Directory.Exists(pathImage))
                    Directory.CreateDirectory(pathImage);

                string fullPath = Path.Combine(pathImage, fileName);

                await using var fileStream = new FileStream(fullPath, FileMode.Create);
                await image.CopyToAsync(fileStream);

                return new ResponseModel { Success = true, Message = "Uploaded the image successfully" };
            }
            catch (Exception)
            {
                return new ResponseModel { Success = false, Message = "An error occurred while uploading the image." };
            }
        }

        public Task<ResponseModel> DeleteImageAsync(string path, string fileName)
        {
            try
            {
                if (string.IsNullOrEmpty(fileName))
                    return Task.FromResult(new ResponseModel { Success = false, Message = "File name is required" });

                string pathImage = Path.Combine(_env.WebRootPath, path);
                string fullPath = Path.Combine(pathImage, fileName);

                if (!File.Exists(fullPath))
                    return Task.FromResult(new ResponseModel { Success = false, Message = "File not found" });

                File.Delete(fullPath);
                return Task.FromResult(new ResponseModel { Success = true, Message = "Deleted the image successfully" });
            }
            catch (Exception)
            {
                return Task.FromResult(new ResponseModel { Success = false, Message = "An error occurred while deleting the image." });
            }
        }
    }
}

