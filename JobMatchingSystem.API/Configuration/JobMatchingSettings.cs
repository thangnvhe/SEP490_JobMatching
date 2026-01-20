namespace JobMatchingSystem.API.Configuration
{
    public class JobMatchingSettings
    {
        public double SkillWeight { get; set; }
        public double EducationWeight { get; set; }
        public SkillSimilaritySettings SkillSimilarity { get; set; } = new();
    }

    public class SkillSimilaritySettings
    {
        public double ExactMatch { get; set; }
        public double ChildMatch { get; set; }
        public double ParentMatch { get; set; }
        public double SiblingMatch { get; set; }
    }
}
