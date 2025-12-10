using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CVEducationDto
    {
        public int Id { get; set; }
        public string SchoolName { get; set; }
        public int EducationLevelId { get; set; }  // Thay đổi từ DegreeType
        public string EducationLevelName { get; set; }  // Tên bậc học
        public int RankScore { get; set; }  // Điểm xếp hạng
        public string Major { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
    }
}
