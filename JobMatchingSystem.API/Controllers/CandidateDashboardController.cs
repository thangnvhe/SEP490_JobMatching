using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateDashboardController : ControllerBase
    {
        private readonly ICandidateDashboardService _dashboardService;

        public CandidateDashboardController(ICandidateDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            int candidateId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _dashboardService.GetDashboardDataAsync(candidateId);
            
            return Ok(APIResponse<object>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}
