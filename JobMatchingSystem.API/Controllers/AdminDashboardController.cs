using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;

        public AdminDashboardController(IAdminDashboardService service)
        {
            _dashboardService = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard([FromQuery] int month = 0, [FromQuery] int year = 0)
        {
            // Default to current month/year if not provided or invalid
            var now = DateTime.UtcNow;
            if (year <= 0 || year > 9999) year = now.Year;
            if (month <= 0 || month > 12) month = now.Month;
            
            var result = await _dashboardService.GetDashboardDataAsync(month, year);
            
            return Ok(APIResponse<object>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}
