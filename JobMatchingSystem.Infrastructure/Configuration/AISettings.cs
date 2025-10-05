namespace JobMatchingSystem.Infrastructure.Configuration
{
    public class AISettings
    {
        public string OllamaBaseUrl { get; set; } = "http://localhost:11434";
        public string DefaultModel { get; set; } = "llama3.1";
        public int TimeoutSeconds { get; set; } = 300;
        public bool EnableAI { get; set; } = true;
    }
}