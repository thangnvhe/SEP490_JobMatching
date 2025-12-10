namespace JobMatchingSystem.API.DTOs.Response
{
    public class EducationLevelDto
    {
        public int Id { get; set; }
        public string LevelName { get; set; } = string.Empty;
        public int RankScore { get; set; }
        public bool IsActive { get; set; }
    }
}