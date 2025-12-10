namespace JobMatchingSystem.API.DTOs.Request
{
    public class CVExperienceRequest
    {
        public string CompanyName { get; set; }
        public string Position { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
    }
}
