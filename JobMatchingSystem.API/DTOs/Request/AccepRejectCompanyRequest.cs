using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class AccepRejectCompanyRequest
    {
        [Required]
        public int CompanyId { get; set; }
    }
}
