namespace JobMatchingSystem.API.DTOs.Request
{
    public class CVAchievementRequest
    {
        public string Title { get; set; }
        public string Organization { get; set; }
        public string? Description { get; set; }
        public DateTime AchievedAt { get; set; }
    }
}
