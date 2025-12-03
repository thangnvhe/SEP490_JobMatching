namespace JobMatchingSystem.API.DTOs.Response
{
    public class CandidateMatchingResult
    {
        public int CandidateId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public DateTime Birthday { get; set; }
        public bool Gender { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public double TotalScore { get; set; }
        public DateTime MatchedAt { get; set; } = DateTime.UtcNow;
        
        // CV Information
        public CandidateCVInfo? PrimaryCV { get; set; }
        
        // Skills
        public List<CandidateSkillInfo> Skills { get; set; } = new();
        
        // Work Experience
        public List<CandidateExperienceInfo> WorkExperiences { get; set; } = new();
        
        // Education
        public List<CandidateEducationInfo> Educations { get; set; } = new();
    }

    public class CandidateCVInfo
    {
        public int CVId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CandidateSkillInfo
    {
        public int TaxonomyId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public int ExperienceYear { get; set; }
    }

    public class CandidateExperienceInfo
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
    }

    public class CandidateEducationInfo
    {
        public string SchoolName { get; set; } = string.Empty;
        public string EducationLevelName { get; set; } = string.Empty;
        public int RankScore { get; set; }
        public string Major { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}