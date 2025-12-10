using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CVEducationRequest
    {
        public string SchoolName { get; set; }
        public int EducationLevelId { get; set; }  // Thay đổi từ DegreeType sang EducationLevelId
        public string Major { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
    }
}
