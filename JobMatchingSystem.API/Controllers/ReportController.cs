using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
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
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var report = await _reportService.GetReportByIdAsync(id);

            return Ok(APIResponse<Report>.Builder()
                .WithResult(report)
                .WithSuccess(true)
                .Build());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReportRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _reportService.CreateReportAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Report created successfully")
                .Build());
        }

        [HttpPut("censor/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Censor(int id, [FromBody] CensorReportRequest request)
        {
            int adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            await _reportService.CensorReportAsync(id, adminId, request);

            return Ok(APIResponse<string>.Builder()
                .WithSuccess(true)
                .WithResult("Report censored successfully")
                .Build());
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetReportsPaged([FromQuery] GetReportPagedRequest request)
        {
            var result = await _reportService.GetReportsPagedAsync(request);

            return Ok(APIResponse<PagedResult<ReportDetailResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }
    }
}
