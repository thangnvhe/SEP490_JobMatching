using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "HiringManager")]
    public class HiringManagerDashboardController : ControllerBase
    {
        private readonly IHiringManagerDashboardService _dashboardService;

        public HiringManagerDashboardController(IHiringManagerDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            int hiringManagerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _dashboardService.GetDashboardDataAsync(hiringManagerId);

            return Ok(APIResponse<object>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}
