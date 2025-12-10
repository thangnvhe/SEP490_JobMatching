using System.Text.Json;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITaxCodeValidationService
    {
        Task<TaxCodeValidationResult> ValidateTaxCodeAsync(string taxCode);
    }
    
    public class TaxCodeValidationResult
    {
        public bool IsValid { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
    }
}