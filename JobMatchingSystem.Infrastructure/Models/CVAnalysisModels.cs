namespace JobMatchingSystem.Infrastructure.Models
{
    public class CVAnalysisResult
    {
        public string? FullName { get; set; }
        public string? BirthYear { get; set; }
        public string? Gender { get; set; }
        public List<EducationInfo> Education { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public List<ExperienceInfo> Experience { get; set; } = new();
        public List<string> Achievements { get; set; } = new();
        public List<ProjectInfo> Projects { get; set; } = new();
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? OriginalText { get; set; }
    }

    public class EducationInfo
    {
        public string? Institution { get; set; }
        public string? Degree { get; set; }
        public string? Major { get; set; }
        public string? GraduationYear { get; set; }
        public string? GPA { get; set; }
    }

    public class ExperienceInfo
    {
        public string? Company { get; set; }
        public string? Position { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? Description { get; set; }
        public List<string> Responsibilities { get; set; } = new();
    }

    public class ProjectInfo
    {
        public string? ProjectName { get; set; }
        public string? Description { get; set; }
        public string? Technologies { get; set; }
        public string? Duration { get; set; }
        public string? Role { get; set; }
    }

    public class AIRequest
    {
        public string Model { get; set; } = "llama3.1";
        public string Prompt { get; set; } = "";
        public bool Stream { get; set; } = false;
    }

    public class AIResponse
    {
        public string Response { get; set; } = "";
        public bool Done { get; set; }
    }
}