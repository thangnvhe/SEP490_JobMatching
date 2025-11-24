using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplateCvController : ControllerBase
    {
        private readonly ITemplateCvService _service;

        public TemplateCvController(ITemplateCvService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTemplate([FromForm] CreateTemplateCvRequest request)
        {
            await _service.CreateTemplateAsync(request);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Template CV uploaded successfully")
                .Build());
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Giả định GetAllAsync trả về một List<TemplateCvResponse> hoặc tương tự
            var data = await _service.GetAllAsync();

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(data)
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // Giả định GetByIdAsync trả về một TemplateCvResponse hoặc tương tự
            var item = await _service.GetByIdAsync(id);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(item)
                .Build());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);

            // Sửa đổi trả về: Dùng APIResponse<string> cho thông báo thành công
            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Deleted successfully")
                .Build());
        }
    }
}
