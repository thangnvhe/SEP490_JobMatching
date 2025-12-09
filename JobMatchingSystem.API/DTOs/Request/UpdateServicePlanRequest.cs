using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateServicePlanRequest : IValidatableObject
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Giá tiền không được âm")]
        public decimal? Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "JobPostAdditional không được âm")]
        public int? JobPostAdditional { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "HighlightJobDays không được âm")]
        public int? HighlightJobDays { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "HighlightJobDaysCount không được âm")]
        public int? HighlightJobDaysCount { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "ExtensionJobDays không được âm")]
        public int? ExtensionJobDays { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "ExtensionJobDaysCount không được âm")]
        public int? ExtensionJobDaysCount { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "CVSaveAdditional không được âm")]
        public int? CVSaveAdditional { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Validate HighlightJob pair
            if (HighlightJobDays.HasValue && !HighlightJobDaysCount.HasValue)
            {
                yield return new ValidationResult(
                    "HighlightJobDaysCount không được trống khi HighlightJobDays có giá trị",
                    new[] { nameof(HighlightJobDaysCount) });
            }
            
            if (HighlightJobDaysCount.HasValue && !HighlightJobDays.HasValue)
            {
                yield return new ValidationResult(
                    "HighlightJobDays không được trống khi HighlightJobDaysCount có giá trị",
                    new[] { nameof(HighlightJobDays) });
            }

            // Validate ExtensionJob pair
            if (ExtensionJobDays.HasValue && !ExtensionJobDaysCount.HasValue)
            {
                yield return new ValidationResult(
                    "ExtensionJobDaysCount không được trống khi ExtensionJobDays có giá trị",
                    new[] { nameof(ExtensionJobDaysCount) });
            }
            
            if (ExtensionJobDaysCount.HasValue && !ExtensionJobDays.HasValue)
            {
                yield return new ValidationResult(
                    "ExtensionJobDays không được trống khi ExtensionJobDaysCount có giá trị",
                    new[] { nameof(ExtensionJobDays) });
            }
        }
    }
}
