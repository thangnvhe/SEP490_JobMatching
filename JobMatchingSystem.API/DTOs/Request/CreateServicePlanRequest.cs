namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateServicePlanRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }

        public int? JobPostAdditional { get; set; }
        public int? HighlightJobDays { get; set; }
        public int? HighlightJobDaysCount { get; set; }
        public int? ExtensionJobDays { get; set; }
        public int? ExtensionJobDaysCount { get; set; }
        public int? CVSaveAdditional { get; set; }
    }
}
