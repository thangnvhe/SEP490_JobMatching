using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class GetOrderPagedRequest
    {
        public int page { get; set; } = 1;
        public int size { get; set; } = 10;
        public string? search { get; set; } = "";
        public string? sortBy { get; set; } = "";
        public bool isDescending { get; set; } = false;

        // Filter theo Order
        public int? id { get; set; }
        public decimal? amount { get; set; }
        public string? transferContent { get; set; }
        public OrderStatus? status { get; set; }
        public int? buyerId { get; set; }
        public int? serviceId { get; set; }

        // Filter theo khoảng ngày tạo
        public DateTime? createMin { get; set; }
        public DateTime? createMax { get; set; }
    }
}
