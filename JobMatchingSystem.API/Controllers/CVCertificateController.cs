using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CVCertificateController : ControllerBase
    {
        private readonly ICVCertificateService _service;

        public CVCertificateController(ICVCertificateService service)
        {
            _service = service;
        }

        // GET: api/cvcertificate/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var certificate = await _service.GetByIdAsync(id);

            return Ok(APIResponse<CVCertificate>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(certificate)
                .Build());
        }

        // GET: api/cvcertificate/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyCertificates()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var certificates = await _service.GetByCurrentUserAsync(userId);

            return Ok(APIResponse<List<CVCertificateDto>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(certificates)
                .Build());
        }

        // POST: api/cvcertificate
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CVCertificateRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var certificate = await _service.CreateAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Certificate add successfully")
                .Build());
        }

        // PUT: api/cvcertificate/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CVCertificateRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var certificate = await _service.UpdateAsync(id, request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Certificate update successfully")
                .Build());
        }

        // DELETE: api/cvcertificate/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _service.DeleteAsync(id, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Certificate deleted successfully")
                .Build());
        }
    }
}
