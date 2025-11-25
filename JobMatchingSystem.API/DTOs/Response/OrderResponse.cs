namespace JobMatchingSystem.API.DTOs.Response
{
    public class OrderResponse
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string TransferContent { get; set; } = null!;
        public string Status { get; set; } = null!;
        public int BuyerId { get; set; }
        public int ServiceId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
