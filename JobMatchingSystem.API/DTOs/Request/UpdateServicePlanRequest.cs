namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateServicePlanRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
    }
}
