using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicePlanController : ControllerBase
    {
        private readonly IServicePlanService _servicePlanService;

        public ServicePlanController(IServicePlanService servicePlanService)
        {
            _servicePlanService = servicePlanService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _servicePlanService.GetAllAsync();
            return Ok(APIResponse<List<ServicePlanResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _servicePlanService.GetByIdAsync(id);
            return Ok(APIResponse<ServicePlanResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServicePlanRequest request)
        {
            await _servicePlanService.UpdateAsync(id, request);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Service plan updated successfully")
                .Build());
        }
    }
}
