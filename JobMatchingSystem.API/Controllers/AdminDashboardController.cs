using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetDashboard([FromQuery] int month, [FromQuery] int year)
        {
            var result = await _dashboardService.GetDashboardDataAsync(month, year);
            return Ok(result);
        }
    }
}
