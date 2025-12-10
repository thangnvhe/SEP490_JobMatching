namespace JobMatchingSystem.API.DTOs.Response
{
    public class JobQuotaResponse
    {
        public int Id { get; set; }
        public int MonthlyQuota { get; set; }
        public int ExtraQuota { get; set; }
    }
}
