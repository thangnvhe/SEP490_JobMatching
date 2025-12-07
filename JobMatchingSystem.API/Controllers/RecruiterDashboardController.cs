using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecruiterDashboardController : ControllerBase
    {
        private readonly IRecruiterDashboardService _dashboardService;

        public RecruiterDashboardController(IRecruiterDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard([FromQuery] int month, [FromQuery] int year)
        {
            int recruiterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _dashboardService.GetDashboardAsync(recruiterId, month, year);

            return Ok(result);
        }
    }
}
