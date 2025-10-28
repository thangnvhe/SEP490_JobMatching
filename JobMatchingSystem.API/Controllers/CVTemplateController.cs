// Controllers/CVTemplateController.cs
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CVTemplateController : ControllerBase
    {
        private readonly ICVTemplateService _cvTemplateService;

        public CVTemplateController(ICVTemplateService cvTemplateService)
        {
            _cvTemplateService = cvTemplateService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateCV([FromBody] CreateCVFromTemplateRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var htmlBytes = await _cvTemplateService.GenerateCVHtmlAsync(
                userId: userId,
                templateId: request.TemplateId
            );

            var fileName = $"CV_{userId}_{request.TemplateId}.html";
            return File(htmlBytes, "text/html", fileName);
        }
    }
}