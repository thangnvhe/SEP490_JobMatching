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

        [HttpGet("all")]
        public async Task<IActionResult> GetAllNoPaging()
        {
            var result = await _servicePlanService.GetAllAsync();
            
            return Ok(APIResponse<List<ServicePlanResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, 
            [FromQuery] string sortBy = "", [FromQuery] bool isDescending = false, [FromQuery] string search = "")
        {
            // For now, get all results and do pagination in controller
            // TODO: Update service to support pagination natively
            var allResults = await _servicePlanService.GetAllAsync();
            
            // Apply search filter if provided
            var filteredResults = allResults;
            if (!string.IsNullOrEmpty(search))
            {
                filteredResults = allResults.Where(sp => 
                    sp.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    sp.Description.Contains(search, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }
            
            // Apply sorting if provided
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "name":
                        filteredResults = isDescending 
                            ? filteredResults.OrderByDescending(sp => sp.Name).ToList()
                            : filteredResults.OrderBy(sp => sp.Name).ToList();
                        break;
                    case "price":
                        filteredResults = isDescending 
                            ? filteredResults.OrderByDescending(sp => sp.Price).ToList()
                            : filteredResults.OrderBy(sp => sp.Price).ToList();
                        break;
                }
            }
            
            // Calculate pagination
            var totalItems = filteredResults.Count;
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            var items = filteredResults.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            
            var pageInfo = new
            {
                CurrentPage = page,
                PageSize = pageSize,
                TotalItem = totalItems,
                TotalPage = totalPages,
                HasPreviousPage = page > 1,
                HasNextPage = page < totalPages,
                SortBy = sortBy,
                IsDecending = isDescending
            };
            
            var result = new
            {
                Items = items,
                PageInfo = pageInfo
            };
            
            return Ok(APIResponse<object>.Builder()
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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateServicePlanRequest request)
        {
            await _servicePlanService.CreateAsync(request);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Service plan created successfully")
                .Build());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _servicePlanService.DeleteAsync(id);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Service plan deleted successfully")
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
