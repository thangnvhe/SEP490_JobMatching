using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JobMatchingSystem.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.Infrastructure.IServices
{
    public interface IPDFService
    {
        Task<ResponseModel> UploadCVAsync(IFormFile pdfFile, string path, string? customName = null);
        Task<ResponseModel<byte[]>> DownloadCVAsync(string path, string fileName);
        Task<ResponseModel> DeleteCVAsync(string path, string fileName);
    }
}
