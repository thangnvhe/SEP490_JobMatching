using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public CompanyController(ICompanyService companyService)
        {
            _companyService = companyService;
        }
        [HttpPost()]
        public async Task<IActionResult> Create([FromForm] RegisterRecruiterRequest request)
        {
            await _companyService.CreateCompanyAsync(request);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Create Company Success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.Created)
                .Build());
        }
        [HttpPost("accept")]
        public async Task<IActionResult> AcceptCompany([FromBody] AccepRejectCompanyRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _companyService.AcceptCompanyAsync(request, userId);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Accept Company Success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpPost("reject")]
        public async Task<IActionResult> RejectCompany([FromBody] AccepRejectCompanyRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _companyService.RejectCompanyAsync(request, userId);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Reject Company Success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}
