using System;
using System.IO;
using System.Linq;
using JobMatchingSystem.Application.DTOs;
using JobMatchingSystem.Infrastructure.IServices;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.Infrastructure.Services
{
    public class PDFService : IPDFService
    {
        private readonly IWebHostEnvironment _env;

        public PDFService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<ResponseModel> UploadCVAsync(IFormFile pdfFile, string path, string? customName = null)
        {
            try
            {
                if (pdfFile == null || pdfFile.Length == 0)
                    return new ResponseModel { Success = false, Message = "No PDF file was uploaded" };

                // Max allowed size = 5MB
                const long maxBytes = 5 * 1024 * 1024;
                if (pdfFile.Length > maxBytes)
                    return new ResponseModel { Success = false, Message = "PDF file size must be less than 5 MB" };

                var extensionFile = Path.GetExtension(pdfFile.FileName);
                if (string.IsNullOrEmpty(extensionFile))
                    return new ResponseModel { Success = false, Message = "File has no extension" };
                extensionFile = extensionFile.ToLower();

                if (extensionFile != ".pdf")
                    return new ResponseModel { Success = false, Message = "Only PDF files are allowed" };

                string fileName = !string.IsNullOrEmpty(customName)
                    ? customName + extensionFile
                    : Guid.NewGuid().ToString() + extensionFile;

                string pdfPath = Path.Combine(_env.WebRootPath, path);
                if (!Directory.Exists(pdfPath))
                    Directory.CreateDirectory(pdfPath);

                string fullPath = Path.Combine(pdfPath, fileName);

                await using var fileStream = new FileStream(fullPath, FileMode.Create);
                await pdfFile.CopyToAsync(fileStream);

                return new ResponseModel { Success = true, Message = "CV uploaded successfully" };
            }
            catch (Exception)
            {
                return new ResponseModel { Success = false, Message = "An error occurred while uploading the CV." };
            }
        }

        public Task<ResponseModel<byte[]>> DownloadCVAsync(string path, string fileName)
        {
            try
            {
                if (string.IsNullOrEmpty(fileName))
                    return Task.FromResult(new ResponseModel<byte[]> { Success = false, Message = "File name is required" });

                string pdfPath = Path.Combine(_env.WebRootPath, path);
                string fullPath = Path.Combine(pdfPath, fileName);

                if (!File.Exists(fullPath))
                    return Task.FromResult(new ResponseModel<byte[]> { Success = false, Message = "CV file not found" });

                var fileBytes = File.ReadAllBytes(fullPath);
                return Task.FromResult(new ResponseModel<byte[]> 
                { 
                    Success = true, 
                    Message = "CV downloaded successfully", 
                    Data = fileBytes 
                });
            }
            catch (Exception)
            {
                return Task.FromResult(new ResponseModel<byte[]> { Success = false, Message = "An error occurred while downloading the CV." });
            }
        }

        public Task<ResponseModel> DeleteCVAsync(string path, string fileName)
        {
            try
            {
                if (string.IsNullOrEmpty(fileName))
                    return Task.FromResult(new ResponseModel { Success = false, Message = "File name is required" });

                string pdfPath = Path.Combine(_env.WebRootPath, path);
                string fullPath = Path.Combine(pdfPath, fileName);

                if (!File.Exists(fullPath))
                    return Task.FromResult(new ResponseModel { Success = false, Message = "CV file not found" });

                File.Delete(fullPath);
                return Task.FromResult(new ResponseModel { Success = true, Message = "CV deleted successfully" });
            }
            catch (Exception)
            {
                return Task.FromResult(new ResponseModel { Success = false, Message = "An error occurred while deleting the CV." });
            }
        }
    }
}
