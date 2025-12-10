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
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            int buyerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var orderResponse = await _orderService.CreateOrderAsync(request, buyerId);

            return Ok(APIResponse<OrderResponse>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult(orderResponse)
                .Build());
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetOrdersPaged([FromQuery] GetOrderPagedRequest request)
        {
            var result = await _orderService.GetOrdersPagedAsync(request);

            return Ok(APIResponse<PagedResult<OrderResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(result)
                .Build());
        }
    }
}
