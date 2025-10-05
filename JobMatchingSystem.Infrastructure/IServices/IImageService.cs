using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JobMatchingSystem.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.Infrastructure.IServices
{
    public interface IImageService
    {
        Task<ResponseModel> SaveImageAsync(IFormFile image, string path, string? defaultName = null);
        Task<ResponseModel> DeleteImageAsync(string path, string fileName);
    }
}
