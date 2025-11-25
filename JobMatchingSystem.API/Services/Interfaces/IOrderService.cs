using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, int buyerId);
        Task<PagedResult<OrderResponse>> GetOrdersPagedAsync(GetOrderPagedRequest request);
    }
}
