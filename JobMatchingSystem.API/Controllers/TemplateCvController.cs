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

            return Ok(new
            {
                StatusCode = (int)HttpStatusCode.Created,
                Success = true,
                Message = "Template CV uploaded successfully"
            });
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            return Ok(item);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);

            return Ok(new
            {
                StatusCode = (int)HttpStatusCode.OK,
                Success = true,
                Message = "Deleted successfully"
            });
        }
    }
}
