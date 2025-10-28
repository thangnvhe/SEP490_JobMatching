using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplateCVController : ControllerBase
    {
        private readonly ITemplateCVService _templateCVService;

        public TemplateCVController(ITemplateCVService templateCVService)
        {
            _templateCVService = templateCVService;
        }

        [HttpPost]
        [Authorize]
        //[Authorize(Roles = "Staff")] // Chỉ Staff được tạo TemplateCV
        public async Task<IActionResult> CreateTemplateCV([FromForm] CreateTemplateCVRequest request, IFormFile file)
        {
            await _templateCVService.CreateTemplateCVAsync(request, file);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("TemplateCV created successfully")
                .Build());
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllTemplateCVs()
        {
            var templates = await _templateCVService.GetAllTemplateCVsAsync();
            return Ok(APIResponse<List<TemplateCVResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(templates)
                .Build());
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetTemplateCVById(int id)
        {
            var template = await _templateCVService.GetTemplateCVByIdAsync(id);
            return Ok(APIResponse<TemplateCVResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(template)
                .Build());
        }

        [HttpPut]
        [Authorize]
        //[Authorize(Roles = "Staff")] // Chỉ Staff được tạo TemplateCV
        public async Task<IActionResult> UpdateTemplateCV(int id, [FromForm] UpdateTemplateCVRequest request, IFormFile? file)
        {
            await _templateCVService.UpdateTemplateCVAsync(id, request, file);
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("TemplateCV updated successfully")
                .Build());
        }
    }
}