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
            var response = await _service.CreateTemplateAsync(request);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, 
            [FromQuery] string sortBy = "", [FromQuery] bool isDescending = false)
        {
            var response = await _service.GetAllAsync(page, pageSize, sortBy, isDescending);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _service.GetByIdAsync(id);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _service.DeleteAsync(id);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
