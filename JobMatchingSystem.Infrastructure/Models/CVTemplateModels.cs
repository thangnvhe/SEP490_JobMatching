namespace JobMatchingSystem.Infrastructure.Models
{
    public class CVTemplateData
    {
        public string FullName { get; set; } = "";
        public string JobTitle { get; set; } = "";
        public string Email { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string Address { get; set; } = "";
        public string Summary { get; set; } = "";
        public string Skills { get; set; } = "";
        public string Education { get; set; } = "";
        public string Experience { get; set; } = "";
        public string Projects { get; set; } = "";
        public string Achievements { get; set; } = "";
        public string Languages { get; set; } = "";
        public string Hobbies { get; set; } = "";
        // Avatar sẽ implement sau
        public string? AvatarPath { get; set; }
    }

    public class CVTemplate
    {
        public string TemplateId { get; set; } = "";
        public string TemplateName { get; set; } = "";
        public string TemplateImagePath { get; set; } = "";
        public string Description { get; set; } = "";
        public CVTemplateStyle Style { get; set; } = new();
    }

    public class CVTemplateStyle
    {
        // Text positions and styling for different templates
        public TextPosition NamePosition { get; set; } = new();
        public TextPosition JobTitlePosition { get; set; } = new();
        public TextPosition ContactPosition { get; set; } = new();
        public TextPosition SummaryPosition { get; set; } = new();
        public TextPosition SkillsPosition { get; set; } = new();
        public TextPosition EducationPosition { get; set; } = new();
        public TextPosition ExperiencePosition { get; set; } = new();
        
        // Styling
        public string PrimaryColor { get; set; } = "#000000";
        public string SecondaryColor { get; set; } = "#666666";
        public string FontFamily { get; set; } = "Arial";
        public int BaseFontSize { get; set; } = 12;
    }

    public class TextPosition
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int FontSize { get; set; } = 12;
        public string FontStyle { get; set; } = "Regular"; // Bold, Italic, etc.
        public string TextAlign { get; set; } = "Left"; // Left, Center, Right
    }

    public class CVGenerationResult
    {
        public bool Success { get; set; }
        public byte[]? GeneratedImageBytes { get; set; }
        public string? FileName { get; set; }
        public string? ErrorMessage { get; set; }
        public CVTemplateData? UsedData { get; set; }
        public string? UsedTemplateId { get; set; }
    }
}