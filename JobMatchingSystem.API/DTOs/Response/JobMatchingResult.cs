using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.DTOs.Response
{
    // Internal DTO for job matching calculations
    public class JobMatchingResult
    {
        public int JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public int CandidateId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public double TotalScore { get; set; }
        public MatchingDetails Details { get; set; } = new();
        public DateTime MatchedAt { get; set; } = DateTime.UtcNow;
    }

    public class MatchingDetails
    {
        public SkillMatchingDetails SkillMatching { get; set; } = new();
        public ExperienceMatchingDetails ExperienceMatching { get; set; } = new();
        public PositionMatchingDetails PositionMatching { get; set; } = new();
        public EducationMatchingDetails EducationMatching { get; set; } = new();
    }

    public class SkillMatchingDetails
    {
        public double Score { get; set; }
        public double Weight { get; set; } = 30.0; // 30%
        public List<SkillMatchItem> MatchedSkills { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
    }

    public class ExperienceMatchingDetails
    {
        public double Score { get; set; }
        public double Weight { get; set; } = 20.0; // 20%
        public int RequiredYears { get; set; }
        public int CandidateMaxYears { get; set; }
        public double ExperienceRatio { get; set; }
    }

    public class PositionMatchingDetails
    {
        public double Score { get; set; }
        public double Weight { get; set; } = 40.0; // 40%
        public string RequiredPosition { get; set; } = string.Empty;
        public string CandidatePosition { get; set; } = string.Empty;
        public PositionMatchType MatchType { get; set; }
    }

    public class EducationMatchingDetails
    {
        public double Score { get; set; }
        public double Weight { get; set; } = 10.0; // 10%
        public string RequiredLevel { get; set; } = string.Empty;
        public string CandidateLevel { get; set; } = string.Empty;
        public int RequiredRankScore { get; set; }
        public int CandidateRankScore { get; set; }
    }

    public class SkillMatchItem
    {
        public int TaxonomyId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public double Similarity { get; set; }
        public int RequiredYears { get; set; }
        public int CandidateYears { get; set; }
        public double ExperienceRatio { get; set; }
        public double FinalScore { get; set; }
        public SkillMatchType MatchType { get; set; }
    }

    public enum SkillMatchType
    {
        ExactMatch = 0,    // 100% - Trùng khớp hoàn toàn
        ParentMatch = 1,   // 50% - Biết ngôn ngữ cha
        SiblingMatch = 2   // 30% - Cùng hệ sinh thái
    }

    public enum PositionMatchType
    {
        ExactMatch = 0,    // 100% - Trùng khớp chính xác
        FullstackMatch = 1, // 80% - Fullstack có thể làm
        RelatedMatch = 2,   // 30% - Có liên quan
        NoMatch = 3        // 0% - Không phù hợp
    }
}