using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<IActionResult> Create([FromForm] CreateCompanyRequest request)
        {
            await _companyService.Add(request);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Create Company Success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.Created)
                .Build());
        }
        [HttpPost("{id}/accept")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AcceptCompany(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _companyService.AcceptCompany(id,userId);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Company approved and please into email to setup password")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK) 
                .Build());
        }
        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> RejectCompany(int id, [FromQuery] string rejectReason)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _companyService.RejectCompany(id, userId, rejectReason);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Company rejected and email notification sent successfully")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpGet("{companyId}")]
        public async Task<IActionResult> GetDetailCompany(int companyId)
        {
            var company = await _companyService.GetDetailCompany(companyId);
            return Ok(APIResponse<CompanyDTO>.Builder()
                .WithResult(company)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpGet]
        public async Task<IActionResult> GetDetailCompanyList(
            [FromQuery] int page = 1,
            [FromQuery] int size = 5,
            [FromQuery] string search = "",
            [FromQuery] string sortBy = "",
            [FromQuery] bool isDecending = false,
            [FromQuery] string status = "")
        {
            var companies = await _companyService.GetDetailCompanyList(page, size, search, sortBy, isDecending, status);
            return Ok(APIResponse<PagedResult<CompanyDTO>>.Builder()
                .WithResult(companies)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpPut("{companyId}/change-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeStatus(int companyId)
        {
            await _companyService.ChangeStatus(companyId);

            return Ok(APIResponse<string>.Builder()
                .WithResult("Change company status success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpPut("{companyId}")]
        public async Task<IActionResult> UpdateCompany([FromForm] UpdateCompanyRequest request, int companyId)
        {
            await _companyService.UpdateCompany(request, companyId);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Update Company Success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

    }
}

