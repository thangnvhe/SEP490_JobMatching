namespace JobMatchingSystem.API.DTOs.Response
{
    public class CVAchievementDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Organization { get; set; }
        public string? Description { get; set; }
        public DateTime AchievedAt { get; set; }
    }
}
