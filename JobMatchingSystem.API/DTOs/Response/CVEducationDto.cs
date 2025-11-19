using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CVEducationDto
    {
        public int Id { get; set; }
        public string SchoolName { get; set; }
        public DegreeType Degree { get; set; }
        public string Major { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
    }
}
